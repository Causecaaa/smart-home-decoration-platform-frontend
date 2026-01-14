<template>
  <div class="designer-list">
    <div
        v-for="designer in designers"
        :key="designer.userId"
        class="designer-item"
        :class="{ selected: designer.userId === modelValue }"
        @click="selectDesigner(designer)"
    >
      <img :src="'http://localhost:8181' + designer.avatar" class="avatar" />
      <div class="info">
        <div class="top-row">
          <div class="name">{{ designer.name }}</div>
          <div class="rating-orders">⭐ {{ designer.rating }} | 接单: {{ designer.orderCount }}</div>
        </div>
        <div class="style">风格: {{ designer.style }}</div>
        <div class="experience">经验: {{ designer.experienceYears }} 年</div>
        <div class="bio">{{ designer.shortBio }}</div>
      </div>
      <div class="check" v-if="designer.userId === modelValue">✔</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  designers: { type: Array, default: () => [] },
  modelValue: { type: [String, Number], default: null }
})

const emit = defineEmits(['update:modelValue', 'select'])

const selectDesigner = (designer) => {
  emit('update:modelValue', designer.userId)
  emit('select', designer)
}
</script>

<style scoped>
.designer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #eee;
}

/* 设计师卡片 */
.designer-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  align-items: center;
  position: relative;
  background-color: #fff;
  transition: all 0.2s;
}

.designer-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-color: #409eff;
}

.designer-item.selected {
  border-color: #409eff;
}

/* 头像 */
.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

/* 信息区域 */
.info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.name {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.style,
.experience,
.bio,
.rating-orders {
  font-size: 12px;
  color: #666;
}

.rating-orders {
  color: #ff9800;
}

/* 选中对勾 */
.check {
  font-size: 16px;
  color: #409eff;
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
