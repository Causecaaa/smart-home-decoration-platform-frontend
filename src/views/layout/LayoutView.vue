<template>
  <TopNav class="top-nav" />

  <div class="layouts-page">
    <div class="header">
      <h2>房屋布局</h2>
      <!-- 新增布局按钮 -->
      <button class="add-btn" @click="openLayoutDialog">新增布局</button>
    </div>

    <div class="layout-list">
      <div
          class="layout-item"
          v-for="layout in layouts"
          :key="layout.layoutId"
      >
        <h3>
          布局意图：{{ LAYOUT_INTENT_MAP[layout.layoutIntent] }}
          <span v-if="layout.version"> - V{{ layout.version }}</span>
        </h3>
        <p v-if="layout.redesignNotes">设计需求：{{ layout.redesignNotes }}</p>
        <p>状态：{{ LAYOUT_STATUS_MAP[layout.layoutStatus] }}</p>

        <div class="images">
          <div v-for="img in layout.images" :key="img.id">
            <img :src="img.url" />
            <button @click="removeImage(img.id)">删除</button>
          </div>
        </div>


        <!-- 新增图片 -->
        <input type="file" @change="uploadImage($event, layout.layoutId)" />

        <div class="actions">
          <button class="danger" @click="confirmDelete(layout.layoutId)">删除</button>
        </div>
      </div>

      <p v-if="layouts.length === 0" class="no-layout">
        还没有布局信息，快去新增吧～
      </p>
    </div>

    <!-- 新增布局弹窗（循环外） -->
    <div v-if="showLayoutDialog" class="overlay" @click.self="closeLayoutDialog">
      <div class="modal">
        <div class="modal-header">
          <span>布局设计</span>
          <span class="close" @click="closeLayoutDialog">×</span>
        </div>

        <div class="modal-body">
          <LayoutForm
              :houseId="currentHouseId"
              @success="onLayoutCreated"
              @cancel="closeLayoutDialog"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from '@/layouts/TopNav.vue'
import { showToast } from '@nutui/nutui'
import { getLayoutsByHouse, deleteLayout } from '@/api/layout'
import LayoutForm from '@/components/layout/LayoutForm.vue'
import {deleteLayoutImage, uploadLayoutImage, getLayoutImages } from "@/api/layoutImage";

// 映射常量
const LAYOUT_INTENT_MAP = { KEEP_ORIGINAL: '保留现有户型', REDESIGN: '需要重新设计' }
const LAYOUT_STATUS_MAP = { DRAFT: '草稿', SUBMITTED: '已提交', CONFIRMED: '已确认', ARCHIVED: '已废弃'}

const route = useRoute()
const houseId = Number(route.params.houseId)

const layouts = ref([])

// 弹窗状态
const showLayoutDialog = ref(false)
const currentHouseId = ref(houseId) // 当前房屋ID

// 加载布局列表
const BASE_URL = 'http://localhost:8181'

const loadLayouts = async () => {
  try {
    const res = await getLayoutsByHouse(houseId)

    // 1️⃣ 初始化 layouts
    layouts.value = res.map(l => ({
      ...l,
      version: l.version || 1,
      images: [] // 一定要先给
    }))

    // 2️⃣ 给每个 layout 拉图片
    for (const layout of layouts.value) {
      const imgList = await getLayoutImages(layout.layoutId)

      layout.images = imgList.map(img => ({
        id: img.imageId,
        url: BASE_URL + img.imageUrl
      }))
    }

  } catch (err) {
    console.error(err)
    layouts.value = []
    showToast.fail('加载布局失败，请重试')
  }
}


// 打开新增布局弹窗
const openLayoutDialog = () => {
  currentHouseId.value = houseId
  showLayoutDialog.value = true
}

// 新增布局成功回调
const onLayoutCreated = () => {
  showLayoutDialog.value = false
  loadLayouts() // 创建成功后刷新列表
}

// 删除布局
const confirmDelete = async (layoutId) => {
  if (!confirm('确定要删除该布局吗？')) return
  try {
    await deleteLayout(layoutId)
    layouts.value = layouts.value.filter(l => l.layoutId !== layoutId)
    showToast.success('删除成功')
  } catch (err) {
    const msg = err.response?.data?.message || '删除失败，请重试'
    showToast.fail(msg)
  }
}

// 关闭弹窗
const closeLayoutDialog = () => {
  showLayoutDialog.value = false
}

const reloadImages = async (layoutId) => {
  try {
    const res = await getLayoutImages(layoutId)

    const target = layouts.value.find(l => l.layoutId === layoutId)
    if (target) {
      target.images = res.data
    }
  } catch (e) {
    console.error(e)
    showToast.fail('刷新图片失败')
  }
}

const uploadImage = async (e, layoutId) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  await uploadLayoutImage(layoutId, formData)
  await reloadImages(layoutId)
}

const removeImage = async (imageId, layoutId) => {
  await deleteLayoutImage(imageId)
  await reloadImages(layoutId)
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
  width: 280px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layout-item h3 {
  font-weight: bold;
}

.images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.images img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
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

/* 弹窗覆盖层 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: #fff;
  border-radius: 12px;
  width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 16px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 12px;
}

.modal-header .close {
  cursor: pointer;
  font-size: 20px;
}
</style>
