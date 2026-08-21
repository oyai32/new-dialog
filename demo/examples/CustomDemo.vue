<template>
  <el-space wrap>
    <el-button type="primary" @click="openEditor">命令式打开 Dialog</el-button>
    <el-button @click="openSettings">命令式打开 Drawer</el-button>
  </el-space>
  <p v-if="message" class="result">{{ message }}</p>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'
import { ElInput } from 'element-plus'
import { DialogCancelledError, openDialog, openDrawer } from '@/index'

const message = ref('')
const appContext = getCurrentInstance()?.appContext

async function openEditor() {
  try {
    const result = await openDialog({
      component: ElInput,
      props: { modelValue: '命令式内容', type: 'textarea', rows: 4 },
      title: '命令式 Dialog',
      appContext,
      onConfirm: instance => (instance as { modelValue?: string } | null)?.modelValue ?? '已确认',
    })
    message.value = `确认结果：${String(result)}`
  } catch (error) {
    if (error instanceof DialogCancelledError) message.value = '已取消'
  }
}

async function openSettings() {
  try {
    const result = await openDrawer({
      component: ElInput,
      props: { modelValue: 'Drawer 内容', type: 'textarea', rows: 5 },
      title: '命令式 Drawer',
      appContext,
      overlayProps: { size: '420px' },
      onConfirm: () => '设置已保存',
    })
    message.value = `确认结果：${result}`
  } catch (error) {
    if (error instanceof DialogCancelledError) message.value = '已取消'
  }
}
</script>

<style scoped>
.result { margin-top: 16px; color: var(--el-color-primary); }
</style>
