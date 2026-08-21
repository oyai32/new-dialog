<template>
  <div class="layout">
    <aside>
      <h2>Demo 列表</h2>
      <ul>
        <li 
          v-for="name in demoNames" 
          :key="name"
          :class="{ active: currentDemoName === name }"
        >
          <a :href="`/demo/?demo=${name}`">{{ name }}</a>
        </li>
      </ul>
    </aside>

    <main>
      <section class="stage">
        <div class="demo-wrapper">
          <component v-if="CurrentDemo" :is="CurrentDemo" />
          <div v-else class="placeholder">
            请选择左侧任一 Demo 进行预览。
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

// 直接以 eager 方式收集 demo/examples 下的 .vue 组件，拿到模块默认导出（组件实例）
const modules = import.meta.glob('/demo/examples/*.vue', { eager: true })

// 规范化成 { [name]: SFCComponent }
const demos = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const name = path.split('/').pop()!.replace('.vue', '')
    const comp = (mod as any).default
    return [name, comp]
  })
)

const demoNames = Object.keys(demos).sort()

// 解析 URL ?demo=xxx
function getQueryDemoName(): string | null {
  const url = new URL(location.href)
  return url.searchParams.get('demo')
}

const currentDemoName = ref<string | null>(getQueryDemoName())

// 当前组件（已是同步组件实例）
const CurrentDemo = computed(() => {
  const name = currentDemoName.value
  if (!name) return null
  return demos[name] || null
})

// 监听地址栏变化（前进/后退）
window.addEventListener('popstate', () => {
  currentDemoName.value = getQueryDemoName()
})

// 当首次没有 demo 时，默认选第一个（可选）
watchEffect(() => {
  if (!currentDemoName.value && demoNames.length) {
    currentDemoName.value = demoNames[0]
    const url = new URL(location.href)
    url.searchParams.set('demo', demoNames[0])
    history.replaceState(null, '', url)
  }
})
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
}

aside {
  border-right: 1px solid #eee;
  padding: 16px;
  overflow: auto;
}

aside h2 {
  margin: 0 0 12px;
  font-size: 16px;
}

aside ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

aside li {
  margin: 6px 0;
}

aside li a {
  color: #333;
  text-decoration: none;
}

aside li.active a {
  color: #1677ff;
  font-weight: 600;
}

main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid #eee;
}

.stage {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  padding: 16px;
  background: #fafafa;
  min-height: 0;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
}

.demo-wrapper {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: visible;
}

.placeholder {
  color: #999;
}
</style>
