<template>
  <el-space wrap>
    <el-button type="primary" @click="openEditor">命令式打开 Dialog</el-button>
    <el-button @click="openSettings">命令式打开 Drawer</el-button>
  </el-space>
  <p v-if="message" class="result">{{ message }}</p>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useDialog } from "@/index";
import UserEdit from "@/components/UserEdit.vue";
import UserSettings from "@/components/UserSettings.vue";

const message = ref("");
const { openDialog, openDrawer } = useDialog();

const currentUser = ref({ name: "张三", email: "zhangsan@example.com" });

async function openEditor() {
  const user = await openDialog(UserEdit, currentUser.value);
  if (user) {
    Object.assign(currentUser.value, user as typeof currentUser.value);
    message.value = `已保存：${JSON.stringify(user)}`;
  }
}

const currentDrawer = ref("内容");

async function openSettings() {
  const result = await openDrawer(UserSettings, currentDrawer.value);
  if (result) {
    currentDrawer.value = result as string;
    message.value = `已保存：${result}`;
  }
}
</script>

<style scoped>
.result {
  margin-top: 16px;
  color: var(--el-color-primary);
}
</style>
