<template>
  <component
    :is="overlayComponent"
    v-bind="$attrs"
    :model-value="visible"
    :title="title"
    :before-close="handleBeforeClose"
    @update:model-value="visible = $event"
    @open="emit('open')"
    @opened="emit('opened')"
    @close="emit('close')"
    @closed="handleClosed"
  >
    <!-- 弹窗主体内容。 -->
    <slot />

    <template v-if="$slots.header" #header>
      <!-- 自定义标题区域。 -->
      <slot name="header" />
    </template>

    <template v-if="showFooter" #footer>
      <!-- 自定义底部；参数包含关闭方法和确认按钮 loading 状态。 -->
      <slot name="footer" :cancel="requestCancel" :confirm="requestConfirm" :confirm-loading="confirmLoading">
        <div class="new-dialog-footer">
          <el-button :disabled="confirmLoading" @click="requestCancel">{{ cancelText }}</el-button>
          <el-button type="primary" :loading="confirmLoading" @click="requestConfirm">{{ confirmText }}</el-button>
        </div>
      </slot>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElButton, ElDialog, ElDrawer } from 'element-plus'
import { type DialogKind, type DialogAction } from '../types'

export interface NewDialogProps {
  /** 弹窗类型。 */
  kind?: DialogKind
  /** 标题；也可用 header 插槽完全替换。 */
  title?: string
  /** 是否渲染默认底部操作区。 */
  showFooter?: boolean
  /** 确认按钮文本。 */
  confirmText?: string
  /** 取消按钮文本。 */
  cancelText?: string
  /** 确认操作；返回 false 时保持打开，抛出异常时同样保持打开。 */
  confirmAction?: DialogAction
  /** 取消或通过遮罩、ESC、关闭图标关闭前执行的操作。 */
  cancelAction?: DialogAction
}

const props = withDefaults(defineProps<NewDialogProps>(), {
  kind: 'dialog',
  title: '',
  showFooter: true,
  confirmText: '确定',
  cancelText: '取消',
  confirmAction: undefined,
  cancelAction: undefined,
})

const emit = defineEmits<{
  /** 确认操作成功后的返回值。 */
  confirm: [result: unknown]
  /** 取消操作成功执行。 */
  cancel: [result: unknown]
  open: []
  opened: []
  close: []
  closed: []
}>()

const confirmLoading = ref(false)
const cancelLoading = ref(false)
const visible = ref(false)
const overlayComponent = computed(() => props.kind === 'drawer' ? ElDrawer : ElDialog)

let pendingOpen: {
  resolve: (value: unknown) => void
} | null = null

function settleOpen(result: unknown) {
  if (!pendingOpen) return
  const { resolve } = pendingOpen
  pendingOpen = null
  resolve(result)
}

/** 打开弹窗；返回的 Promise 在确认时返回结果，用户取消时返回 undefined。 */
function open(): Promise<unknown> {
  if (pendingOpen) settleOpen(undefined)
  visible.value = true
  return new Promise(resolve => {
    pendingOpen = { resolve }
  })
}

function close() {
  settleOpen(undefined)
  visible.value = false
}

function handleClosed() {
  if (pendingOpen) settleOpen(undefined)
  emit('closed')
}

async function runAction(action?: DialogAction) {
  return action ? await action() : undefined
}

async function requestConfirm() {
  if (confirmLoading.value) return
  confirmLoading.value = true
  try {
    const result = await runAction(props.confirmAction)
    if (result === false) return
    emit('confirm', result)
    settleOpen(result)
    visible.value = false
  } finally {
    confirmLoading.value = false
  }
}

async function requestCancel() {
  if (cancelLoading.value) return false
  cancelLoading.value = true
  try {
    const result = await runAction(props.cancelAction)
    if (result === false) return false
    emit('cancel', result)
    settleOpen(undefined)
    visible.value = false
    return true
  } finally {
    cancelLoading.value = false
  }
}

async function handleBeforeClose(done: () => void) {
  if (await requestCancel()) done()
}

defineExpose({ open, close, requestConfirm, requestCancel })
</script>
