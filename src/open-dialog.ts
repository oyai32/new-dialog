import { createVNode, getCurrentInstance, render, type AppContext, type Component, type VNode } from 'vue'

/**
 * 命令式挂载一个内部使用 NewDialog 的业务组件。
 *
 * 业务组件需暴露 `open(params)` 方法，并转发 NewDialog 的 `confirm`、`cancel` 与 `closed` 事件。
 */
export function openDialog<TParams = undefined, TResult = unknown>(
  component: Component,
  params?: TParams,
  appContext?: AppContext,
): Promise<TResult | undefined> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('openDialog can only be used in a browser environment'))
  }

  const container = document.createElement('div')
  document.body.appendChild(container)
  let settled = false
  let vnode: VNode | null = null

  const cleanup = () => {
    render(null, container)
    container.remove()
    vnode = null
  }

  return new Promise<TResult | undefined>((resolve, reject) => {
    const resolveOnce = (value: TResult | undefined) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    const rejectOnce = (error: unknown) => {
      if (settled) return
      settled = true
      reject(error)
    }

    vnode = createVNode(component, {
      onConfirm: (result: TResult) => resolveOnce(result),
      onCancel: () => resolveOnce(undefined),
      onClosed: () => {
        resolveOnce(undefined)
        cleanup()
      },
    })
    vnode.appContext = appContext ?? null
    render(vnode, container)

    const exposed = vnode.component?.exposed as { open?: (params?: TParams) => Promise<unknown> } | undefined
    if (!exposed?.open) {
      cleanup()
      rejectOnce(new Error('The dialog component must expose an open(params) method'))
      return
    }
    void exposed.open(params).catch(rejectOnce)
  })
}

/** 与 openDialog 相同；Drawer 类型由业务组件内部的 NewDrawer 决定。 */
export const openDrawer = openDialog

/**
 * 在组件 setup 中调用，返回自动继承当前应用上下文的命令式 API。
 */
export function useDialog() {
  const appContext = getCurrentInstance()?.appContext

  return {
    openDialog: <TParams = undefined, TResult = unknown>(component: Component, params?: TParams) =>
      openDialog<TParams, TResult>(component, params, appContext),
    openDrawer: <TParams = undefined, TResult = unknown>(component: Component, params?: TParams) =>
      openDrawer<TParams, TResult>(component, params, appContext),
  }
}
