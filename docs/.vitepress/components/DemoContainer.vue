<template>
  <div class="demo-container">
    <div class="demo-preview">
      <component v-if="component" :is="component" />
      <div v-else-if="error" class="error">
        <p>组件加载失败</p>
        <p class="error-message">{{ error }}</p>
      </div>
      <div v-else class="loading">加载中...</div>
    </div>
    
    <div class="demo-toolbar">
       <el-tooltip :content="copySuccess ? '已复制' : '复制代码'" placement="top">
        <el-button link @click="copyCode" class="toolbar-btn icon-btn" :class="{ 'copied': copySuccess }">
          <el-icon>
            <component :is="copySuccess ? Check : DocumentCopy" />
          </el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip :content="showCode ? '隐藏代码' : '显示代码'" placement="top">
        <el-button link @click="toggleCode" class="toolbar-btn icon-btn">
          <el-icon> <component :is="showCode ? ArrowUp : ArrowDown" /></el-icon>
        </el-button>
      </el-tooltip>
      
      <!-- <el-tooltip content="在新标签页打开" placement="top">
        <button @click="openInNewTab" class="toolbar-btn icon-btn">
          <el-icon><View /></el-icon>
        </button>
      </el-tooltip> -->
    </div>
    
    <div v-if="showCode && sourceCode" class="demo-code-wrapper">
      <div class="demo-code" v-html="highlightedCode"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { ArrowDown, DocumentCopy, Check, ArrowUp } from '@element-plus/icons-vue'
import { codeToHtml } from 'shiki'

interface Props {
  /** demo 组件路径，格式：demo/examples/BaseDemo.vue */
  src: string
  /** 是否默认展开代码 */
  defaultExpand?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpand: false
})

const component = ref<any>(null)
const sourceCode = ref('')
const showCode = ref(props.defaultExpand)
const error = ref<string | null>(null)
const copySuccess = ref(false)
const highlightedCode = ref('')

// 使用 import.meta.glob 预先加载所有 demo 组件和源码
// 使用 eager: true 立即加载，创建映射关系
const demoModules = import.meta.glob('../../../demo/examples/*.vue', { eager: true })
const demoRawModules = import.meta.glob('../../../demo/examples/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true
})

// 创建路径映射：标准化路径 -> 组件/源码
const componentMap = new Map<string, any>()
const sourceCodeMap = new Map<string, string>()

// 初始化映射关系
Object.keys(demoModules).forEach(key => {
  const fileName = key.split('/').pop() || ''
  
  // 只支持 demo/examples/BaseDemo.vue 格式
  const path = `demo/examples/${fileName}`
  
  const module = demoModules[key] as any
  const componentValue = module.default || module
  
  componentMap.set(path, componentValue)
  
  console.log(`已注册组件映射: ${path}`)
})

// 初始化源码映射关系
Object.keys(demoRawModules).forEach(key => {
  const fileName = key.split('/').pop() || ''
  
  // 只支持 demo/examples/BaseDemo.vue 格式
  const path = `demo/examples/${fileName}`
  
  const rawContent = demoRawModules[key] as string
  
  sourceCodeMap.set(path, rawContent)
  
  console.log(`已注册源码映射: ${path}`)
})

console.log('组件映射总数:', componentMap.size)
console.log('源码映射总数:', sourceCodeMap.size)

// 标准化路径（用于查找）：只支持 demo/examples/BaseDemo.vue 格式
function normalizePath(src: string): string {
  // 移除开头的 /（如果有）
  const path = src.startsWith('/') ? src.slice(1) : src
  
  return path
}

// 加载组件
function loadComponent() {
  try {
    error.value = null
    
    const normalizedPath = normalizePath(props.src)
    console.log('查找组件，原始路径:', props.src)
    console.log('标准化路径:', normalizedPath)
    
    // 从映射中查找
    if (componentMap.has(normalizedPath)) {
      component.value = componentMap.get(normalizedPath)
      console.log('组件加载成功')
    } else {
      throw new Error(`未找到组件: ${props.src}。标准化路径: ${normalizedPath}。可用的路径: ${Array.from(componentMap.keys()).join(', ')}`)
    }
  } catch (err: any) {
    console.error('组件加载失败:', err)
    error.value = err.message || '未知错误'
  }
}

// 加载源码
function loadSourceCode() {
  try {
    const normalizedPath = normalizePath(props.src)
    console.log('查找源码，原始路径:', props.src)
    console.log('标准化路径:', normalizedPath)
    
    // 从映射中查找
    if (sourceCodeMap.has(normalizedPath)) {
      sourceCode.value = sourceCodeMap.get(normalizedPath) || ''
      console.log('源码加载成功，长度:', sourceCode.value.length)
    } else {
      console.warn(`未找到源码: ${props.src}。标准化路径: ${normalizedPath}。可用的路径: ${Array.from(sourceCodeMap.keys()).join(', ')}`)
    }
  } catch (err) {
    console.error('无法获取源码:', err)
  }
}

// 使用 Shiki 高亮代码
async function highlightCode() {
  if (!sourceCode.value) return
  
  try {
const html = await codeToHtml(sourceCode.value, {
  lang: 'vue',
  theme: {
    type: 'light',
    colors: {
      'editor.background': '#f8fafc', // 背景色
      'editor.foreground': '#334155', // 文字颜色
    },
    tokenColors: [
      {
        scope: ['keyword', 'operator'],
        settings: {
          foreground: '#dc2626'
        }
      }
    ]
  }
})
    highlightedCode.value = html
  } catch (err) {
    console.error('代码高亮失败:', err)
    // 降级方案：显示纯文本
    highlightedCode.value = `<pre><code>${sourceCode.value}</code></pre>`
  }
}

// 监听代码变化
watch([showCode, sourceCode], () => {
  if (showCode.value && sourceCode.value) {
    highlightCode()
  }
})

onMounted(() => {
  loadComponent()
  loadSourceCode()
  
  if (showCode.value && sourceCode.value) {
    highlightCode()
  }
})

// 切换代码显示
function toggleCode() {
  showCode.value = !showCode.value
  if (showCode.value && sourceCode.value) {
    highlightCode()
  }
}

// 复制代码
async function copyCode() {
  if (!sourceCode.value) {
    return
  }
  
  try {
    await navigator.clipboard.writeText(sourceCode.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  }
}

// 在新标签页打开 demo
function openInNewTab() {
  // 从 src 中提取文件名，例如 demo/examples/BaseDemo.vue -> BaseDemo
  const fileName = props.src.split('/').pop()?.replace('.vue', '') || ''
  // 构建 demo 页面 URL
  const demoUrl = `/demo/?demo=${fileName}`
  window.open(demoUrl, '_blank')
}
</script>

<style scoped>
.demo-container {
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  margin: 24px 0;
  overflow: hidden;
  background: #fff;
}

.demo-preview {
  border-bottom: 1px solid #e1e4e8;
  min-height: 100px;
  padding: 20px;
}

.loading,
.error {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.error {
  color: #d32f2f;
}

.error-message {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.demo-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 4px 12px;
}

.toolbar-btn {
  color: #24292f;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

/* 图标按钮样式 */
.toolbar-btn:hover {
  color: #0969da;
}

.toolbar-btn.copied {
  color: #52c41a;
}

.toolbar-btn.copied:hover {
  color: #52c41a;
}

.demo-code-wrapper {
  border-top: 1px solid #e1e4e8;
  overflow: hidden;
}

.demo-code {
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

/* Shiki 生成的代码样式调整 */
.demo-code :deep(pre) {
  margin: 0;
  padding: 20px;
  font-size: 13px;
  line-height: 1.7;
}

.demo-code :deep(code) {
  font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.7;
}

/* 行悬停效果 */
.demo-code :deep(.line:hover) {
  background: rgba(255, 255, 255, 0.05);
}
</style>
