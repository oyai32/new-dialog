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
        <el-button link @click="copyCode" class="toolbar-btn icon-btn" :class="{ copied: copySuccess }">
          <el-icon>
            <component :is="copySuccess ? Check : DocumentCopy" />
          </el-icon>
        </el-button>
      </el-tooltip>

      <el-tooltip :content="showCode ? '隐藏代码' : '显示代码'" placement="top">
        <el-button link @click="toggleCode" class="toolbar-btn icon-btn">
          <el-icon><component :is="showCode ? ArrowUp : ArrowDown" /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <div v-if="showCode && sourceFiles.length" class="demo-code-wrapper">
      <el-tabs v-if="sourceFiles.length > 1" v-model="activeFile" class="demo-code-tabs">
        <el-tab-pane
          v-for="file in sourceFiles"
          :key="file.path"
          :label="file.label"
          :name="file.path"
        />
      </el-tabs>
      <div class="demo-code" v-html="activeHighlightedCode" />
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
  /** 额外展示的源码文件，逗号分隔；不传则自动解析 src 中的本地 .vue 引用 */
  files?: string
}

interface SourceFile {
  path: string
  label: string
  content: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultExpand: false,
})

const component = ref<any>(null)
const sourceFiles = ref<SourceFile[]>([])
const activeFile = ref('')
const showCode = ref(props.defaultExpand)
const error = ref<string | null>(null)
const copySuccess = ref(false)
const highlightedCodeMap = ref<Record<string, string>>({})

const demoModules = import.meta.glob('../../../demo/examples/*.vue', { eager: true })
const demoRawModules = import.meta.glob('../../../demo/examples/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const componentRawModules = import.meta.glob('../../../src/**/*.vue', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const componentMap = new Map<string, any>()
const sourceCodeMap = new Map<string, string>()

function registerModule(key: string, module: unknown, isRaw: boolean) {
  const normalizedKey = key.replace(/\\/g, '/')
  let path: string | null = null

  if (normalizedKey.includes('/demo/examples/')) {
    const fileName = normalizedKey.split('/').pop() || ''
    path = `demo/examples/${fileName}`
  } else if (normalizedKey.includes('/src/')) {
    path = `src/${normalizedKey.split('/src/')[1]}`
  }

  if (!path) return

  if (isRaw) {
    sourceCodeMap.set(path, module as string)
  } else {
    const mod = module as { default?: unknown }
    componentMap.set(path, mod.default || module)
  }
}

Object.entries(demoModules).forEach(([key, mod]) => registerModule(key, mod, false))
Object.entries(demoRawModules).forEach(([key, mod]) => registerModule(key, mod, true))
Object.entries(componentRawModules).forEach(([key, mod]) => registerModule(key, mod, true))

function normalizePath(src: string): string {
  return src.startsWith('/') ? src.slice(1) : src
}

function resolveImportPath(specifier: string, fromPath: string): string | null {
  if (!specifier.endsWith('.vue')) return null
  if (specifier.startsWith('@/')) return `src/${specifier.slice(2)}`
  if (!specifier.startsWith('.')) return null

  const baseDir = fromPath.split('/').slice(0, -1)
  const segments = specifier.split('/')
  const resolved = [...baseDir]

  for (const segment of segments) {
    if (segment === '.' || segment === '') continue
    if (segment === '..') resolved.pop()
    else resolved.push(segment)
  }

  return resolved.join('/')
}

function parseLocalVueImports(source: string, fromPath: string): string[] {
  const imports: string[] = []
  const importRegex = /import\s+(?:type\s+)?(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g
  let match: RegExpExecArray | null

  while ((match = importRegex.exec(source)) !== null) {
    const resolved = resolveImportPath(match[1], fromPath)
    if (resolved && sourceCodeMap.has(resolved)) imports.push(resolved)
  }

  return imports
}

function fileLabel(path: string): string {
  return path.split('/').pop() || ''
}

function buildSourceFileList(mainPath: string): SourceFile[] {
  const mainContent = sourceCodeMap.get(mainPath) || ''
  const extraPaths = props.files
    ? props.files.split(',').map(item => normalizePath(item.trim())).filter(Boolean)
    : parseLocalVueImports(mainContent, mainPath)

  const paths = [mainPath, ...extraPaths.filter(path => path !== mainPath)]
  const uniquePaths = [...new Set(paths)].filter(path => sourceCodeMap.has(path))

  return uniquePaths.map(path => ({
    path,
    label: fileLabel(path),
    content: sourceCodeMap.get(path) || '',
  }))
}

const activeSourceFile = computed(() =>
  sourceFiles.value.find(file => file.path === activeFile.value) ?? sourceFiles.value[0] ?? null,
)

const activeHighlightedCode = computed(() => {
  const path = activeSourceFile.value?.path
  return path ? highlightedCodeMap.value[path] ?? '' : ''
})

function loadComponent() {
  try {
    error.value = null
    const normalizedPath = normalizePath(props.src)

    if (componentMap.has(normalizedPath)) {
      component.value = componentMap.get(normalizedPath)
    } else {
      throw new Error(
        `未找到组件: ${props.src}。可用的路径: ${Array.from(componentMap.keys()).join(', ')}`,
      )
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : '未知错误'
  }
}

function loadSourceFiles() {
  const normalizedPath = normalizePath(props.src)
  sourceFiles.value = buildSourceFileList(normalizedPath)
  activeFile.value = normalizedPath
}

async function highlightFile(file: SourceFile) {
  if (highlightedCodeMap.value[file.path]) return

  try {
    const html = await codeToHtml(file.content, {
      lang: 'vue',
      theme: {
        type: 'light',
        colors: {
          'editor.background': '#f8fafc',
          'editor.foreground': '#334155',
        },
        tokenColors: [
          {
            scope: ['keyword', 'operator'],
            settings: { foreground: '#dc2626' },
          },
        ],
      },
    })
    highlightedCodeMap.value = { ...highlightedCodeMap.value, [file.path]: html }
  } catch {
    highlightedCodeMap.value = {
      ...highlightedCodeMap.value,
      [file.path]: `<pre><code>${file.content}</code></pre>`,
    }
  }
}

async function highlightAllFiles() {
  await Promise.all(sourceFiles.value.map(file => highlightFile(file)))
}

watch([showCode, sourceFiles], () => {
  if (showCode.value && sourceFiles.value.length) {
    void highlightAllFiles()
  }
})

watch(activeFile, () => {
  const file = activeSourceFile.value
  if (showCode.value && file) void highlightFile(file)
})

onMounted(() => {
  loadComponent()
  loadSourceFiles()
  if (showCode.value && sourceFiles.value.length) {
    void highlightAllFiles()
  }
})

function toggleCode() {
  showCode.value = !showCode.value
  if (showCode.value && sourceFiles.value.length) {
    void highlightAllFiles()
  }
}

async function copyCode() {
  const content = activeSourceFile.value?.content
  if (!content) return

  try {
    await navigator.clipboard.writeText(content)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch {
    alert('复制失败，请手动复制')
  }
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

.demo-code-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 12px;
  background: #f6f8fa;
  border-bottom: 1px solid #e1e4e8;
}

.demo-code-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.demo-code {
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
}

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

.demo-code :deep(.line:hover) {
  background: rgba(255, 255, 255, 0.05);
}
</style>
