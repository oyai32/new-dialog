<script lang="ts">
import { defineComponent, h } from 'vue'
import NewDialog from './NewDialog.vue'

/** NewDialog 的 Drawer 快捷组件，保留所有 Dialog 插槽和属性。 */
export default defineComponent({
  name: 'NewDrawer',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, required: true },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) {
    return () => h(NewDialog, {
      ...attrs,
      modelValue: props.modelValue,
      kind: 'drawer',
      'onUpdate:modelValue': value => emit('update:modelValue', value),
    }, slots)
  },
})
</script>
