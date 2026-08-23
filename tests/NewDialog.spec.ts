import { flushPromises, mount } from '@vue/test-utils'
import { ElDialog } from 'element-plus'
import { defineComponent, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import NewDialog from '../src/components/NewDialog.vue'

function mountWithOpen(props: Record<string, unknown> = {}) {
  let pendingOpen: Promise<unknown> | null = null
  const Host = defineComponent({
    components: { NewDialog },
    setup() {
      const dialogRef = ref<{ open: () => Promise<unknown> } | null>(null)
      function triggerOpen() {
        pendingOpen = dialogRef.value?.open() ?? null
      }
      return { dialogRef, triggerOpen, dialogProps: props }
    },
    template: `
      <button class="trigger" @click="triggerOpen">open</button>
      <NewDialog ref="dialogRef" v-bind="dialogProps" />
    `,
  })
  const wrapper = mount(Host, { attachTo: document.body })
  return { wrapper, getPendingOpen: () => pendingOpen!, open: () => (wrapper.find('.trigger').element as HTMLButtonElement).click() }
}

describe('NewDialog', () => {
  afterEach(() => { document.body.innerHTML = '' })

  it('确认 action 成功后关闭并返回结果', async () => {
    const action = vi.fn().mockResolvedValue({ id: 1 })
    const { wrapper, open } = mountWithOpen({ confirmAction: action, title: '编辑用户' })
    open()
    await flushPromises()

    ;(document.body.querySelector('.el-button--primary') as HTMLButtonElement).click()
    await flushPromises()

    expect(action).toHaveBeenCalledOnce()
    expect(wrapper.findComponent(NewDialog).emitted('confirm')?.[0]).toEqual([{ id: 1 }])
  })

  it('确认 action 返回 false 时保持打开', async () => {
    const { wrapper, open } = mountWithOpen({ confirmAction: () => false })
    open()
    await flushPromises()

    ;(document.body.querySelector('.el-button--primary') as HTMLButtonElement).click()
    await nextTick()

    expect(wrapper.findComponent(NewDialog).emitted('confirm')).toBeUndefined()
    expect(wrapper.findComponent(NewDialog).findComponent(ElDialog).props('modelValue')).toBe(true)
  })

  it('操作异常会继续抛给调用方，并保持弹窗打开', async () => {
    const error = new Error('save failed')
    const { wrapper, open } = mountWithOpen({ confirmAction: () => { throw error } })
    open()
    await nextTick()

    const dialog = wrapper.findComponent(NewDialog)
    await expect((dialog.vm as unknown as { requestConfirm: () => Promise<void> }).requestConfirm()).rejects.toThrow(error)

    expect(dialog.findComponent(ElDialog).props('modelValue')).toBe(true)
  })

  it('open 打开弹窗，确认后 resolve', async () => {
    const action = vi.fn().mockResolvedValue({ id: 1 })
    const { wrapper, getPendingOpen, open } = mountWithOpen({ confirmAction: action, title: '编辑用户' })

    open()
    await nextTick()
    await flushPromises()

    expect(getPendingOpen()).toBeInstanceOf(Promise)

    const dialog = wrapper.findComponent(NewDialog)
    expect(dialog.findComponent(ElDialog).props('modelValue')).toBe(true)

    ;(document.body.querySelector('.el-button--primary') as HTMLButtonElement).click()
    await flushPromises()

    await expect(getPendingOpen()).resolves.toEqual({ id: 1 })
    expect(action).toHaveBeenCalledOnce()
  })

  it('open 后用户取消会 resolve undefined', async () => {
    const { getPendingOpen, open } = mountWithOpen({ title: '编辑用户' })

    open()
    await nextTick()

    const promise = getPendingOpen()
    const assertion = expect(promise).resolves.toBeUndefined()
    await nextTick()
    await flushPromises()

    ;(document.body.querySelector('.el-button') as HTMLButtonElement).click()
    await assertion
  })
})
