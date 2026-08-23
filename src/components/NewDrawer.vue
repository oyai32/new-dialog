<template>
  <NewDialog ref="dialogRef" v-bind="$attrs" kind="drawer">
    <slot />
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <template v-if="$slots.footer" #footer="scope">
      <slot name="footer" v-bind="scope" />
    </template>
  </NewDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NewDialog from './NewDialog.vue'

const dialogRef = ref<InstanceType<typeof NewDialog>>()

defineExpose({
  open: () => dialogRef.value?.open(),
  close: () => dialogRef.value?.close(),
  requestConfirm: () => dialogRef.value?.requestConfirm(),
  requestCancel: () => dialogRef.value?.requestCancel(),
})
</script>
