<template>
  <nut-button
    :type="type"
    :size="size"
    :block="block"
    :disabled="disabled"
  >
    <slot />
  </nut-button>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  type: { type: String, default: 'primary' },    // primary / success / warning / danger
  size: { type: String, default: 'normal' },     // normal / small / large
  block: { type: Boolean, default: true },       // 是否撑满父容器
  disabled: { type: Boolean, default: false }
})
</script>

<style scoped>
/* 可加一些统一样式，例如圆角 */
</style>
