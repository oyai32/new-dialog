import { defineComponent, h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { NewDialog, openDialog } from '../src'

const FormDialog = defineComponent({
  name: 'FormDialog',
  emits: ['confirm', 'cancel', 'closed'],
  setup(_, { emit, expose }) {
    const dialogRef = ref<{ open: () => Promise<unknown> } | null>(null)
    expose({ open: () => dialogRef.value?.open() ?? Promise.resolve(undefined) })
    return () => h(NewDialog, {
      ref: dialogRef,
      title: '编辑用户',
      confirmAction: () => ({ saved: true }),
      onConfirm: result => emit('confirm', result),
      onCancel: result => emit('cancel', result),
      onClosed: () => emit('closed'),
    }, () => h('div', 'form content'))
  },
})

describe('openDialog', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('调用组件暴露的 open 方法，确认后返回业务结果', async () => {
    const promise = openDialog(FormDialog)
    await nextTick()

    const button = document.body.querySelector('.el-button--primary') as HTMLButtonElement
    button.click()

    await expect(promise).resolves.toEqual({ saved: true })
  })

  it('用户取消后返回 undefined', async () => {
    const promise = openDialog(FormDialog)
    await nextTick()

    const button = document.body.querySelector('.el-button') as HTMLButtonElement
    button.click()

    await expect(promise).resolves.toBeUndefined()
  })
})
