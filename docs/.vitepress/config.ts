import { defineConfig } from 'vitepress'
import { resolve } from 'path'

export default defineConfig({
  title: 'NewDialog',
  description: 'NewDialog 组件及文档',
  appearance: false,
  themeConfig: {
    nav: [
      { text: '使用指南', link: '/guide' },
      { text: '示例', link: '/examples/base' },
      { text: 'API', link: '/api' },
      { text: '更新日志', link: '/changelog' }
    ],

    sidebar: {
      '/examples/': [
        {
          items: [
            { text: '基础示例', link: '/examples/base' },
            { text: '其他示例', link: '/examples/custom' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/' }
    ]
  },

  vite: {
    resolve: {
      alias: {
        '@': resolve(__dirname, '../../src')
      }
    },
    server: {
      fs: {
        allow: ['..']
      }
    }
  }
})
