export type DialogKind = 'dialog' | 'drawer'
export type DialogAction<TResult = unknown> = () => TResult | Promise<TResult>

export class DialogCancelledError extends Error {
  constructor(message = 'Dialog was cancelled') {
    super(message)
    this.name = 'DialogCancelledError'
  }
}
