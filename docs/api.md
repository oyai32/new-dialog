# API

## NewDialog

除下列属性外，所有 Element Plus `ElDialog` / `ElDrawer` 属性均会透传。设置 `kind="drawer"` 时使用 Drawer。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `v-model` | `boolean` | — | 显示状态 |
| `kind` | `'dialog' \| 'drawer'` | `'dialog'` | 覆盖层类型 |
| `title` | `string` | `''` | 标题 |
| `showFooter` | `boolean` | `true` | 是否显示默认 footer |
| `confirmText` / `cancelText` | `string` | `确定` / `取消` | 默认操作按钮文字 |
| `confirmAction` | `() => unknown \| Promise<unknown>` | — | 确认前执行；返回 `false` 保持打开 |
| `cancelAction` | `() => unknown \| Promise<unknown>` | — | 取消前执行；返回 `false` 阻止关闭 |

| 事件 | 说明 |
| --- | --- |
| `confirm(result)` | 确认操作完成且允许关闭时触发 |
| `cancel(result)` | 取消操作完成且允许关闭时触发 |
| `action-error(error)` | 确认或取消操作异常 |
| `open` / `opened` / `close` / `closed` | 透传 Element Plus 生命周期 |

默认插槽为主体；`header` 用于替换标题；`footer` 的插槽参数为 `{ cancel, confirm, confirmLoading }`。

## NewDrawer

`NewDrawer` 固定使用 Drawer，其余行为与 `NewDialog kind="drawer"` 一致。

## openDialog / openDrawer

```ts
openDialog<TProps, TResult>(options: OpenDialogOptions<TProps, TResult>): Promise<TResult>
```

| options | 说明 |
| --- | --- |
| `component` | 必填，业务组件 |
| `props` | 传给业务组件的 props |
| `onConfirm(instance)` | 返回值将作为 Promise resolve 值；返回 `false` 时不关闭 |
| `onCancel()` | 取消前回调；返回 `false` 时不关闭 |
| `overlayProps` | Element Plus 覆盖层属性，例如 `width`、`size`、`appendTo` |
| `appContext` | 推荐在组件内调用时传递，以继承应用上下文 |

用户取消会 reject `DialogCancelledError`；业务确认异常则由 `NewDialog` 发出 `action-error`，保持弹窗打开。
