<template>
  <el-button type="primary" @click="dialogRef?.open()">打开编辑弹窗</el-button>

  <NewDialog
    ref="dialogRef"
    title="编辑用户"
    width="460px"
    :confirm-action="save"
    @confirm="handleConfirmed"
  >
    <el-form label-width="72px">
      <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
      <el-form-item label="邮箱"
        ><el-input v-model="form.email"
      /></el-form-item>
    </el-form>
  </NewDialog>

  <p v-if="message" class="result">{{ message }}</p>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { NewDialog } from "@/index";

const dialogRef = ref<{ open: () => Promise<unknown> } | null>(null);
const message = ref("");
const form = reactive({ name: "张三", email: "zhangsan@example.com" });

async function save() {
  const data = await new Promise((resolve) => setTimeout(() => resolve({ ...form }), 400));
  return data;
}

function handleConfirmed(data: unknown) {
  message.value = `已保存：${JSON.stringify(data)}`;
}

</script>

<style scoped>
.result {
  margin-top: 16px;
  color: var(--el-color-success);
}
</style>
