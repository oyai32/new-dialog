# 使用指南

## 安装

```bash
npm install @oyai32/new-dialog element-plus
```

`vue`、`element-plus` 与 `@element-plus/icons-vue` 都是 peer dependencies，应由宿主项目安装。样式需要由宿主项目引入：

```ts
import 'element-plus/dist/index.css'
import '@oyai32/new-dialog/style.css'
```

## 声明式用法

`NewDialog` 通过 `v-model` 控制显示；`confirmAction` 可为同步或异步函数。成功返回任意结果会触发 `confirm` 并关闭；返回 `false` 或抛出异常会保持打开。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NewDialog } from '@oyai32/new-dialog'

const visible = ref(false)
const save = async () => ({ id: 1 })
</script>

<template>
  <el-button @click="visible = true">编辑</el-button>
  <NewDialog v-model="visible" title="编辑用户" :confirm-action="save" @confirm="console.log">
    内容
  </NewDialog>
</template>
```

`NewDrawer` 是 `NewDialog` 的 Drawer 版本，接受相同的 Element Plus 属性和插槽。

## 命令式用法

命令式 API 会把业务组件临时挂载到 `body`，在 `closed` 后自动卸载。确认时 Promise resolve；取消、ESC、遮罩或关闭图标则 reject `DialogCancelledError`。

```ts
import { DialogCancelledError, openDialog } from '@oyai32/new-dialog'

try {
  const result = await openDialog({
    component: UserEditor,
    props: { user },
    title: '编辑用户',
    appContext: getCurrentInstance()?.appContext,
    onConfirm: instance => instance?.submit(),
  })
  await updateUser(result)
} catch (error) {
  if (!(error instanceof DialogCancelledError)) throw error
}
```

在组件内部调用时传入 `appContext`，可使动态内容继承 Element Plus、路由、Pinia、i18n 和全局 provide。
