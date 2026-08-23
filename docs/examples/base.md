# 声明式 Dialog

通过 `ref` 调用 `open()` 打开弹窗，组件会处理确认按钮的异步 loading。`confirmAction` 返回 `false` 时不关闭；异常由业务方法自行处理。

<DemoContainer src="demo/examples/BaseDemo.vue" />
