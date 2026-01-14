<template>
  <TopNav class="top-nav" />
  <div class="layouts-page">

    <div class="header">
      <h2>我的布局</h2>
      <button class="add-btn" @click="goCreateLayout">新增布局</button>
    </div>

    <div class="layout-list">
      <div
          class="layout-item"
          v-for="layout in layouts"
          :key="layout.layoutId"
      >
        <h3>布局ID: {{ layout.layoutId }}</h3>
        <p>户型意图：{{ layout.layoutIntent }}</p>
        <p>状态：{{ layout.layoutStatus }}</p>
        <p>设计师：
          <span v-if="layout.designerName">{{ layout.designerName }}</span>
          <span v-else>未指定</span>
        </p>
        <p>备注：{{ layout.redesignNotes || '无' }}</p>

        <div class="actions">
          <button @click="goEditLayout(layout.layoutId)">编辑</button>
          <button class="danger" @click="confirmDelete(layout.layoutId)">删除</button>
        </div>
      </div>

      <p v-if="layouts.length === 0" class="no-layout">
        还没有布局信息，快去新增吧～
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TopNav from '@/layouts/TopNav.vue'
import { useRoute, useRouter } from 'vue-router'
import { getLayoutsByHouse, deleteLayout } from '@/api/layout'
import { showToast } from '@nutui/nutui'

const route = useRoute()
const router = useRouter()

// 从路由获取 houseId
const houseId = route.params.houseId

const layouts = ref([])

// 加载布局列表
const loadLayouts = async () => {
  try {
    const res = await getLayoutsByHouse(houseId)
    layouts.value = res
    showToast.success('布局列表加载成功')
  } catch (err) {
    layouts.value = []
    showToast.fail('加载布局失败')
  }
}

// 跳转到创建布局
const goCreateLayout = () => {
  router.push({ name: 'LayoutForm', params: { houseId } })
}

// 跳转到编辑布局
const goEditLayout = (layoutId) => {
  router.push({ name: 'LayoutForm', params: { houseId, layoutId } })
}

// 删除布局
const confirmDelete = async (layoutId) => {
  if (confirm('确定要删除该布局吗？')) {
    try {
      await deleteLayout(layoutId)
      layouts.value = layouts.value.filter(l => l.layoutId !== layoutId)
      showToast.success('删除成功')
    } catch (err) {
      const msg = err.response?.data?.message || '删除失败'
      showToast.fail(msg)
    }
  }
}

onMounted(() => {
  loadLayouts()
})
</script>

<style scoped>
.layouts-page {
  padding: 24px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.add-btn {
  margin-left: auto;
  background: #409eff;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.layout-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.layout-item {
  width: 300px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.actions button {
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #f0f0f0;
}

.actions .danger {
  background: #ffeaea;
  color: #d93026;
}

.actions button:hover {
  background: #e0e0e0;
}

.no-layout {
  width: 100%;
  text-align: center;
  color: #888;
  margin-top: 40px;
}
</style>
