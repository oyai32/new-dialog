# API

## NewDialog

除下列属性外，所有 Element Plus `ElDialog` / `ElDrawer` 属性均会透传。设置 `kind="drawer"` 时使用 Drawer。

| 方法 | 说明 |
| --- | --- |
| `open()` | 打开弹窗；返回 Promise，确认 resolve 结果，用户取消 resolve `undefined` |
| `close()` | 关闭弹窗 |

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
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
| `open` / `opened` / `close` / `closed` | 透传 Element Plus 生命周期 |

默认插槽为主体；`header` 用于替换标题；`footer` 的插槽参数为 `{ cancel, confirm, confirmLoading }`。

## NewDrawer

`NewDrawer` 固定使用 Drawer，其余行为与 `NewDialog kind="drawer"` 一致。

## openDialog / openDrawer

```ts
openDialog<TParams, TResult>(component, params?, appContext?): Promise<TResult | undefined>
```

| 参数 | 说明 |
| --- | --- |
| `component` | 必填；组件内部必须使用 `NewDialog`，并暴露 `open(params)` 方法 |
| `params` | 作为参数传入组件的 `open(params)`，用于初始化表单等业务数据 |
| `appContext` | 可选；在组件内调用时传递，以继承应用上下文 |

业务组件应转发 `NewDialog` 的 `confirm`、`cancel`、`closed` 事件。确认时返回结果；用户取消时返回 `undefined`。提交或取消动作的异常不会由 `NewDialog` 捕获，应在业务组件的方法中显式处理。

## useDialog

在组件 `setup` 中调用 `useDialog()`，返回已绑定当前应用 `appContext` 的 `openDialog` 和 `openDrawer`。这是在应用组件中使用命令式 API 的推荐方式，无需每次传入 `appContext`。
