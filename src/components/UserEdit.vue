<template>
  <NewDialog
    ref="dialogRef"
    title="编辑用户"
    :confirm-action="save"
    @confirm="emit('confirm', $event)"
    @cancel="emit('cancel', $event)"
    @closed="emit('closed')"
  >
    <el-form label-width="64px">
      <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
      <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
    </el-form>
  </NewDialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElForm, ElFormItem, ElInput } from 'element-plus'
import NewDialog from './NewDialog.vue'

interface User {
  name: string
  email: string
}

const emit = defineEmits<{
  confirm: [result: unknown]
  cancel: [result: unknown]
  closed: []
}>()
const dialogRef = ref<{ open: () => Promise<unknown> } | null>(null)
const form = reactive<User>({ name: '', email: '' })

async function save() {
  return await new Promise<User & { id: string }>(resolve => {
    setTimeout(() => {
      resolve({ ...form, id: Math.random().toString(36).slice(2, 15) })
    }, 400)
  })
}

function open(user: User) {
  Object.assign(form, user)
  return dialogRef.value?.open() ?? Promise.resolve(undefined)
}

defineExpose({ open })
</script>
