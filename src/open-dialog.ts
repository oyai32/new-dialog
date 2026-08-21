import { createVNode, ref, render, type ComponentPublicInstance, type VNode } from 'vue'
import NewDialog from './components/NewDialog.vue'
import { DialogCancelledError, type OpenDialogOptions } from './types'

/**
 * 命令式打开一个业务组件，并以 Promise 返回确认结果。
 * 关闭动画结束后才卸载临时根节点，因此不会截断 Element Plus 的 transition。
 */
export function openDialog<TProps extends Record<string, unknown> = Record<string, unknown>, TResult = unknown>(
  options: OpenDialogOptions<TProps, TResult>,
): Promise<TResult> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('openDialog can only be used in a browser environment'))
  }

  const container = document.createElement('div')
  document.body.appendChild(container)
  const visible = ref(true)
  const contentRef = ref<ComponentPublicInstance | null>(null)
  let settled = false
  let vnode: VNode | null = null

  const cleanup = () => {
    render(null, container)
    container.remove()
    vnode = null
  }

  return new Promise<TResult>((resolve, reject) => {
    const resolveOnce = (value: TResult) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    const rejectOnce = (reason: unknown = new DialogCancelledError()) => {
      if (settled) return
      settled = true
      reject(reason)
    }

    const renderOverlay = () => {
      vnode = createVNode(NewDialog, {
        ...options.overlayProps,
        modelValue: visible.value,
        kind: options.kind,
        title: options.title,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        confirmAction: () => options.onConfirm?.(contentRef.value),
        cancelAction: options.onCancel,
        'onUpdate:modelValue': (value: boolean) => {
          visible.value = value
          renderOverlay()
        },
        onConfirm: (result: TResult) => resolveOnce(result),
        onCancel: () => rejectOnce(),
        onClosed: () => {
          rejectOnce()
          cleanup()
        },
      }, {
        default: () => createVNode(options.component, { ...options.props, ref: contentRef }),
      })
      vnode.appContext = options.appContext ?? null
      render(vnode, container)
    }

    renderOverlay()
  })
}

export const openDrawer = <TProps extends Record<string, unknown> = Record<string, unknown>, TResult = unknown>(
  options: Omit<OpenDialogOptions<TProps, TResult>, 'kind'>,
) => openDialog<TProps, TResult>({ ...options, kind: 'drawer' })
