import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { DialogCancelledError, openDialog } from '../src'

const FormContent = defineComponent({
  name: 'FormContent',
  setup() {
    return () => h('div', 'form content')
  },
})

describe('openDialog', () => {
  afterEach(() => { document.body.innerHTML = '' })
  it('确认后 resolve 业务结果并清理挂载节点', async () => {
    const promise = openDialog({ component: FormContent, onConfirm: () => ({ saved: true }) })
    await nextTick()

    const button = document.body.querySelector('.el-button--primary') as HTMLButtonElement
    button.click()

    await expect(promise).resolves.toEqual({ saved: true })
  })

  it('取消后以 DialogCancelledError reject', async () => {
    const promise = openDialog({ component: FormContent })
    await nextTick()

    const buttons = document.body.querySelectorAll('.el-button')
    ;(buttons[0] as HTMLButtonElement).click()

    await expect(promise).rejects.toBeInstanceOf(DialogCancelledError)
  })
})
