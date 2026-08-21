<template>
  <el-button type="primary" @click="visible = true">打开编辑弹窗</el-button>

  <NewDialog
    v-model="visible"
    title="编辑用户"
    width="460px"
    :confirm-action="save"
    @confirm="handleConfirmed"
    @action-error="handleError"
  >
    <el-form label-width="72px">
      <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
      <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
    </el-form>
  </NewDialog>

  <p v-if="message" class="result">{{ message }}</p>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { NewDialog } from '@/index'

const visible = ref(false)
const message = ref('')
const form = reactive({ name: '张三', email: 'zhangsan@example.com' })

async function save() {
  await new Promise(resolve => setTimeout(resolve, 400))
  return { ...form }
}

function handleConfirmed(data: unknown) {
  message.value = `已保存：${JSON.stringify(data)}`
}

function handleError(error: unknown) {
  message.value = `保存失败：${String(error)}`
}
</script>

<style scoped>
.result { margin-top: 16px; color: var(--el-color-success); }
</style>
