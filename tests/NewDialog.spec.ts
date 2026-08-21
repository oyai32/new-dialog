import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import NewDialog from '../src/components/NewDialog.vue'

describe('NewDialog', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('确认 action 成功后关闭并返回结果', async () => {
    const action = vi.fn().mockResolvedValue({ id: 1 })
    const wrapper = mount(NewDialog, {
      attachTo: document.body,
      props: { modelValue: true, confirmAction: action, title: '编辑用户' },
    })
    await flushPromises()

    ;(document.body.querySelector('.el-button--primary') as HTMLButtonElement).click()
    await flushPromises()

    expect(action).toHaveBeenCalledOnce()
    expect(wrapper.emitted('confirm')?.[0]).toEqual([{ id: 1 }])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('确认 action 返回 false 时保持打开', async () => {
    const wrapper = mount(NewDialog, {
      attachTo: document.body,
      props: { modelValue: true, confirmAction: () => false },
    })
    await flushPromises()

    ;(document.body.querySelector('.el-button--primary') as HTMLButtonElement).click()
    await nextTick()

    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('操作异常会发出 action-error 而不关闭', async () => {
    const error = new Error('save failed')
    const wrapper = mount(NewDialog, {
      attachTo: document.body,
      props: { modelValue: true, confirmAction: () => { throw error } },
    })
    await nextTick()

    ;(document.body.querySelector('.el-button--primary') as HTMLButtonElement).click()
    await nextTick()

    expect(wrapper.emitted('action-error')?.[0]).toEqual([error])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
