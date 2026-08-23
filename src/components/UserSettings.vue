<template>
  <NewDrawer
    ref="drawerRef"
    title="编辑设置"
    size="420px"
    :confirm-action="submit"
    @confirm="emit('confirm', $event)"
    @cancel="emit('cancel', $event)"
    @closed="emit('closed')"
  >
    <el-form label-width="64px">
      <el-form-item label="内容"><el-input v-model="content" type="textarea" :rows="5" /></el-form-item>
    </el-form>
  </NewDrawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElForm, ElFormItem, ElInput } from 'element-plus'
import NewDrawer from './NewDrawer.vue'

const emit = defineEmits<{
  confirm: [result: string]
  cancel: [result: unknown]
  closed: []
}>()
const drawerRef = ref<{ open: () => Promise<unknown> } | null>(null)
const content = ref('')

function submit() {
  return content.value
}

function open(initialContent: string) {
  content.value = initialContent
  return drawerRef.value?.open() ?? Promise.resolve(undefined)
}

defineExpose({ open })
</script>
