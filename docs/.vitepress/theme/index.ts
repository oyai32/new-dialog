// 主题入口文件
// VitePress 官方推荐的方式：通过 theme/index.ts 来扩展主题
import Theme from 'vitepress/theme'
import './style.css';
import type { EnhanceAppContext } from 'vitepress'

// 导入 Element Plus
import ElementPlus from 'element-plus'
import { ID_INJECTION_KEY } from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 导入 DemoContainer 组件
import DemoContainer from '../components/DemoContainer.vue'

export default {
  ...Theme,

  // 增强应用：在这里注册全局组件和插件
  enhanceApp({ app }: EnhanceAppContext) {
    // 注册 Element Plus
    app.use(ElementPlus)
    app.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 })

    // 注册所有 Element Plus 图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }

    // 注册 DemoContainer 为全局组件
    app.component('DemoContainer', DemoContainer)
  }
}
