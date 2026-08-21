import type { AppContext, Component } from 'vue'

export type DialogKind = 'dialog' | 'drawer'
export type DialogAction<TResult = unknown> = () => TResult | Promise<TResult>

export interface OpenDialogOptions<TProps extends Record<string, unknown> = Record<string, unknown>, TResult = unknown> {
  /** 要渲染的业务组件。 */
  component: Component
  /** 传给业务组件的 props。 */
  props?: TProps
  /** dialog 或 drawer。 */
  kind?: DialogKind
  /** 标题与默认按钮配置。 */
  title?: string
  confirmText?: string
  cancelText?: string
  /** Element Plus Dialog / Drawer 的其余属性。 */
  overlayProps?: Record<string, unknown>
  /** 业务组件实例由 ref 注入；确认时返回的数据将 resolve Promise。 */
  onConfirm?: (instance: unknown) => TResult | Promise<TResult>
  /** 取消前回调；返回 false 可阻止关闭。 */
  onCancel?: DialogAction<boolean | void>
  /** 继承调用方的全局组件、插件及 provide。 */
  appContext?: AppContext
}

export class DialogCancelledError extends Error {
  constructor(message = 'Dialog was cancelled') {
    super(message)
    this.name = 'DialogCancelledError'
  }
}
