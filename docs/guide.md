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

`NewDialog` 由组件内部管理显示状态，通过 `ref` 调用 `open()` 打开弹窗；`confirmAction` 可为同步或异步函数。成功返回任意结果会触发 `confirm` 并关闭；返回 `false` 时保持打开。提交异常由业务方法自行处理，不会被组件捕获。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { NewDialog } from '@oyai32/new-dialog'

const dialogRef = ref<InstanceType<typeof NewDialog> | null>(null)
const save = async () => ({ id: 1 })
</script>

<template>
  <el-button @click="dialogRef?.open()">编辑</el-button>
  <NewDialog ref="dialogRef" title="编辑用户" :confirm-action="save" @confirm="console.log">
    内容
  </NewDialog>
</template>
```

`NewDrawer` 是 `NewDialog` 的 Drawer 版本，接受相同的 Element Plus 属性和插槽。

## 命令式用法

命令式 API 会把业务组件临时挂载到 `body`，在 `closed` 后自动卸载。业务组件需要自己使用 `NewDialog`，并把提交、校验等业务方法放在组件内部；调用方仅将参数传给组件暴露的 `open(params)` 方法。确认时 Promise resolve 结果；用户取消则 resolve `undefined`。

```ts
import { useDialog } from '@oyai32/new-dialog'

// 在 setup 中调用一次，后续会自动继承 Element Plus、Pinia 等全局能力。
const { openDialog } = useDialog()
const result = await openDialog(UserEditor, user) // 每次调用传入最新数据
if (result) {
  Object.assign(user, result) // 保存后更新调用方数据，供下次打开时使用
  await updateUser(result)
}
```

`UserEditor` 内部示意：

```vue
<NewDialog ref="dialogRef" title="编辑用户" :confirm-action="submit"
  @confirm="emit('confirm', $event)" @cancel="emit('cancel')" @closed="emit('closed')">
  <!-- 表单内容 -->
</NewDialog>
```

它应暴露 `open(user)`，在其中初始化表单数据并调用 `dialogRef.value.open()`。推荐在组件 `setup` 中使用 `useDialog()`，它会自动继承 Element Plus、路由、Pinia、i18n 和全局 provide；独立调用 `openDialog` 时仍可通过第三个参数传入 `appContext`。
