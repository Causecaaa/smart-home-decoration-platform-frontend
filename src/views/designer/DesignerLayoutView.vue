<template>
  <TopNav class="top-nav" />
  <div class="designer-layouts-container">
    <div class="designer-layouts-content">
      <div class="header">
        <h2>设计师布局管理</h2>
        <button class="add-btn" @click="openLayoutDialog">创建新方案</button>
      </div>

      <div class="layout-and-rooms-container">
        <!-- 原始布局 -->
        <div
          v-if="draftLayout"
          :class="['layout-item', { 'original-layout': true }]"
        >
          <div class="layout-header">
            <h3>
              原始布局：{{ LAYOUT_INTENT_MAP[draftLayout.layoutIntent] }}
              <span v-if="draftLayout.version !== undefined">
                - V{{ draftLayout.version }}
              </span>
            </h3>
          </div>

          <p>状态：{{ LAYOUT_STATUS_MAP[draftLayout.layoutStatus] }}</p>

          <!-- 显示用户信息 -->
          <div class="user-info">
            <p><strong>客户：</strong>{{ draftLayout.userName }}</p>
            <p><strong>联系方式：</strong>{{ draftLayout.userPhone }} | {{ draftLayout.userEmail }}</p>
            <button
                class="chat-btn"
                @click="openChatWithUser"
                v-if="draftLayout.userId"
            >
              💬 联系客户
            </button>
          </div>

          <div class="images">
            <div v-for="(img, index) in imageStore.images[draftLayout.layoutId] || []" :key="img.id ?? img.key ?? index" class="image-wrapper">
              <img :src="img.url" class="image" @click="previewImage(img.file)" />
            </div>
          </div>

          <p class="readonly-note">原始布局为只读状态，不可编辑</p>
        </div>

        <!-- 设计师方案布局 -->
        <div class="designer-layouts-wrapper" v-if="designerLayouts.length > 0">
          <h3>设计师方案</h3>
          <div class="designer-layouts-grid">
            <div v-for="layout in designerLayouts" :key="layout.layoutId" :class="['layout-item', { 'designer-layout': true }]">
              <div class="layout-header">
                <h3>
                  设计师方案：{{ LAYOUT_INTENT_MAP[layout.layoutIntent] }}
                  <span v-if="layout.version !== undefined">
                    - V{{ layout.version }}
                  </span>
                </h3>
              </div>

              <p v-if="layout.redesignNotes">设计需求：{{ layout.redesignNotes }}</p>
              <p>状态：{{ LAYOUT_STATUS_MAP[layout.layoutStatus] }}</p>

              <div class="images">
                <div v-for="(img, index) in imageStore.images[layout.layoutId] || []" :key="img.id ?? img.key ?? index" class="image-wrapper">
                  <img :src="img.url" class="image" @click="previewImage(img.file)" />
                  <button class="delete-btn" @click.stop="removeImage(layout, img.id || img.key)" v-if="canEditLayout(layout)">×</button>
                </div>
              </div>

              <!-- 设计师可编辑的图片上传 -->
              <label class="file-btn" v-if="canEditLayout(layout)">
                新增图片
                <input type="file" class="hidden-file-input" @change="(e) => uploadImage(e, layout)" multiple />
              </label>

            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <p v-if="!draftLayout && designerLayouts.length === 0" class="no-layout">
          还没有布局信息
        </p>
      </div>
    </div>

    <!-- 创建新方案弹窗 -->
    <div v-if="showLayoutDialog" class="overlay" @click.self="closeLayoutDialog">
      <div class="modal">
        <div class="modal-header">
          <span>创建新方案</span>
          <span class="close" @click="closeLayoutDialog">×</span>
        </div>
        <div class="modal-body">
          <DesignerLayoutForm
              :houseId="currentHouseId"
              @success="onLayoutCreated"
              @cancel="closeLayoutDialog"
          />
        </div>
      </div>
    </div>

    <!-- 图片预览 -->
    <div v-if="showPreview" class="overlay" @click.self="closePreview">
      <div class="modal">
        <img :src="previewUrl" style="max-width: 100%; max-height: 80vh;" />
      </div>
    </div>

    <!-- 聊天悬浮窗 -->
    <div v-if="showChatModal" class="chat-overlay" @click.self="closeChatModal">
      <div class="chat-modal">
        <div class="chat-header">
          <div class="chat-header-info">
            <img
                :src="`${BASE_URL}${draftLayout.avatarUrl || '/uploads/avatar/default.png'}`"
                alt="客户头像"
                class="user-avatar"
                @error="onAvatarError"
            />
            <span>与客户 {{ draftLayout.userName }} 聊天</span>
          </div>
          <span class="close-chat" @click="closeChatModal">×</span>
        </div>

        <div class="chat-body">
          <ChatView :target-user-id="chatTargetUserId" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import { useRoute } from 'vue-router'
import TopNav from '@/layouts/TopNav.vue'
import { showToast } from '@nutui/nutui'
import ChatView from '@/components/ChatView.vue'

import {
  getLayoutsByHouse,
} from '@/api/layout'

import {
  getLayoutImages,
  uploadLayoutImage,
  deleteLayoutImage
} from '@/api/layoutImage'

import { useLayoutImageStore } from '@/stores/layoutImageStore'
import DesignerLayoutForm from "@/components/layout/DesignerLayoutForm.vue";

/* -------------------- 常量 -------------------- */
const LAYOUT_INTENT_MAP = {
  KEEP_ORIGINAL: '保留现有户型',
  REDESIGN: '需要重新设计'
}
const LAYOUT_STATUS_MAP = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
  ARCHIVED: '已封存'
}
const BASE_URL = 'http://localhost:8181'

/* -------------------- 路由 & Store -------------------- */
const route = useRoute()
const houseId = Number(route.params.houseId) // 从路由参数获取房屋ID
const imageStore = useLayoutImageStore()

/* -------------------- 页面状态 -------------------- */
const draftLayout = ref(null)
const designerLayouts = ref([])
const showLayoutDialog = ref(false)
const currentHouseId = ref(null)
const chatTargetUserId = ref(null)
const showChatModal = ref(false)

/* -------------------- 图片预览状态 -------------------- */
const previewUrl = ref(null)
const showPreview = ref(false)

/* -------------------- 工具函数 -------------------- */
const urlToFile = async (url, name) => {
  const res = await fetch(url)
  const blob = await res.blob()
  return new File([blob], name, { type: blob.type })
}

/* -------------------- 加载布局 -------------------- */
const loadLayouts = async () => {
  try {
    const res = await getLayoutsByHouse(houseId)

    draftLayout.value = res.draftLayout
        ? {
          ...res.draftLayout,
          layoutVersion: res.draftLayout.version ?? 0
        }
        : null

    console.log('draftLayout', draftLayout.value)
    if (draftLayout.value) {
      currentHouseId.value = draftLayout.value.houseId
    }

    designerLayouts.value = (res.designerLayouts || []).map(l => ({
      ...l,
      layoutVersion: l.version ?? 0
    }))

    await loadAllLayoutImages()
  } catch (err) {
    draftLayout.value = null
    designerLayouts.value = []
    showToast.fail('加载布局失败')
  }
}

/* -------------------- 加载图片 -------------------- */
const loadAllLayoutImages = async () => {
  const ids = []

  if (draftLayout.value) {
    ids.push(draftLayout.value.layoutId)
  }
  designerLayouts.value.forEach(l => ids.push(l.layoutId))

  await Promise.all(ids.map(loadLayoutImages))
}

const loadLayoutImages = async (layoutId) => {
  const imgList = await getLayoutImages(layoutId)

  const formatted = await Promise.all(
      imgList.map(async img => {
        const fullUrl = BASE_URL + img.imageUrl
        const file = await urlToFile(fullUrl, `image_${img.imageId}.jpg`)
        return { id: img.imageId, url: fullUrl, file }
      })
  )

  imageStore.setImages(layoutId, formatted)
}

/* -------------------- 图片预览 -------------------- */
const previewImage = (file) => {
  previewUrl.value = URL.createObjectURL(file)
  showPreview.value = true
}
const closePreview = () => {
  showPreview.value = false
}

/* -------------------- 创建新方案 -------------------- */
const openLayoutDialog = () => {
  showLayoutDialog.value = true
}

const closeLayoutDialog = () => {
  showLayoutDialog.value = false
}

const onLayoutCreated = async () => {
  showLayoutDialog.value = false
  await loadLayouts()
}

/* -------------------- 上传图片 -------------------- */
const uploadImage = async (e, layout) => {
  if (!canEditLayout(layout)) {
    showToast.fail('当前方案不可编辑')
    return
  }

  const layoutId = layout.layoutId
  const files = Array.from(e.target.files)
  if (!files || files.length === 0) return

  for(const file of files) {
    const key = Date.now() + '_' + file.name
    imageStore.addImage(layoutId, {
      key,
      file,
      url: URL.createObjectURL(file)
    })

    try {
      const res = await uploadLayoutImage(layoutId, {
        file,
        imageType: 'STRUCTURE',
        imageDesc: ''
      })

      const img = imageStore.images[layoutId].find(i => i.key === key)
      if (img) img.id = res.imageId

      showToast.success('上传成功')
    } catch {
      imageStore.removeImage(layoutId, key)
      showToast.fail('上传失败')
    }
  }

  e.target.value = ''
}

/* -------------------- 删除图片 -------------------- */
const removeImage = async (layout, keyOrId) => {
  if (!canEditLayout(layout)) {
    showToast.fail('当前方案不可编辑')
    return
  }

  const layoutId = layout.layoutId
  const target = imageStore.images[layoutId]?.find(
      i => i.id === keyOrId || i.key === keyOrId
  )
  if (!target) return

  if (target.id) {
    await deleteLayoutImage(target.id)
  }

  imageStore.removeImage(layoutId, keyOrId)
}


/* -------------------- 聊天功能 -------------------- */
const openChatWithUser = () => {
  if (draftLayout.value && draftLayout.value.userId) {
    chatTargetUserId.value = draftLayout.value.userId
    showChatModal.value = true
  }
}

const closeChatModal = () => {
  showChatModal.value = false
}

/* -------------------- 辅助函数 -------------------- */
const canEditLayout = (layout) => {
  // 设计师只能编辑自己的方案，不能编辑原始布局
  return layout.layoutStatus !== 'CONFIRMED' && layout.layoutStatus !== 'ARCHIVED'
}

/* -------------------- 生命周期 -------------------- */
onMounted(loadLayouts)
</script>

<style scoped>
/* 样式部分保持不变 */
.designer-layouts-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.designer-layouts-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 600px;
}

.designer-layouts-content h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: bold;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.add-btn {
  margin-left: auto;
  background: #409eff;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 13px;
}

.layout-and-rooms-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.layout-item {
  width: 280px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: auto;
  height: auto;
  transition: all 0.3s ease;
}

.layout-item:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.layout-item h3 {
  font-weight: bold;
  margin: 0 0 8px 0;
  color: #1e1e2f;
  font-size: 16px;
}

.original-layout {
  border: 1px solid #e6a23c;
  background-color: #fdf6ec;
}

.readonly-note {
  font-size: 12px;
  color: #e6a23c;
  font-style: italic;
  margin-top: 8px;
}

.user-info {
  padding: 10px;
  background: #f0f9ff;
  border-radius: 6px;
  margin: 8px 0;
}

.user-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.user-info strong {
  color: #333;
}

/* 设计师布局容器 */
.designer-layouts-wrapper {
  flex: 1;
  min-width: 600px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  min-height: auto;
}

.designer-layouts-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

/* 设计师布局差异化样式 */
.designer-layout {
  border: 1px solid #ccf0fd;
  background-color: #e6f7ff;
}

.designer-layouts-wrapper h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.image-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
}

.delete-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.6);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
}

.delete-btn:hover {
  background: rgba(255,0,0,0.8);
}

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
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.modal-header .close {
  cursor: pointer;
  font-size: 20px;
}

.no-layout {
  width: 100%;
  text-align: center;
  color: #888;
  margin-top: 40px;
}

.hidden-file-input {
  display: none;
}

.btn {
  margin-top: 8px;
  padding: 6px 10px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  text-align: center;
}

.btn:hover {
  background: #66b1ff;
}

.file-btn {
  display: inline-block;
  padding: 5px 10px;
  background-color: #409eff;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  margin-top: 8px;
  transition: background 0.2s;
  text-align: center;
}

.file-btn:hover {
  background-color: #66b1ff;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 8px;
}

.notes-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  resize: vertical;
  min-height: 60px;
  font-size: 12px;
  margin-top: 8px;
}

.notes-input:focus {
  outline: none;
  border-color: #409eff;
}

.chat-btn {
  margin-top: 8px;
  padding: 4px 8px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.chat-btn:hover {
  background: #66b1ff;
}

.chat-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.chat-modal {
  background: #fff;
  border-radius: 12px;
  width: 500px;
  height: 600px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  font-weight: bold;
}

.close-chat {
  cursor: pointer;
  font-size: 24px;
  color: #999;
}

.close-chat:hover {
  color: #333;
}

.chat-body {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .designer-layouts-container {
    padding: 16px;
  }

  .layout-and-rooms-container {
    flex-direction: column;
  }

  .designer-layouts-wrapper {
    min-width: 100%;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-btn {
    margin-left: 0;
    margin-top: 12px;
  }
}
</style>
