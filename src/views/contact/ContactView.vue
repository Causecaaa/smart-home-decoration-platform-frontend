<!-- src/views/contact/ContactView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import TopNav from "@/layouts/TopNav.vue"
import ChatView from '@/components/ChatView.vue'
import { getChatPartners } from '@/api/message'

// 页面状态
const chatPartners = ref([])
const selectedPartner = ref(null)

// 选择聊天对象时使用userId
const selectPartner = (partner) => {
  selectedPartner.value = partner.userId // 使用userId作为目标用户ID
}

// 获取聊天伙伴列表
const loadChatPartners = async () => {
  try {
    const response = await getChatPartners()
    chatPartners.value = response
  } catch (error) {
    console.error('获取聊天伙伴失败:', error)
  }
}


onMounted(() => {
  loadChatPartners()
})
</script>

<template>
  <TopNav />

  <div class="contact-container">
    <div class="contact-content">
      <h2>聊天</h2>
      <div class="chat-main">
        <!-- 左侧联系人列表 -->
        <div class="partners-panel">
          <div class="partners-list">
            <div
                class="partner-item"
                v-for="partner in chatPartners"
                :key="partner.userId"
                :class="{ active: selectedPartner === partner.userId }"
                @click="selectPartner(partner)"
            >
              <div class="partner-avatar">
                <img
                    :src="`http://localhost:8181${partner.avatar_url}`"
                    alt="头像"
                    v-if="partner.avatar_url"
                />
                <div v-else class="default-avatar">{{ partner.userName.charAt(0) }}</div>
              </div>
              <div class="partner-info">
                <div class="partner-name">{{ partner.userName }}</div>
                <div class="partner-role">{{ partner.role === 'DESIGNER' ? '设计师' : '用户' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧聊天区域 -->
        <div class="chat-panel" v-if="selectedPartner">
          <div class="chat-header">
            <span>与用户{{ selectedPartner }}聊天</span>
          </div>
          <div class="chat-content">
            <ChatView :target-user-id="selectedPartner" />
          </div>
        </div>

        <!-- 右侧空状态 -->
        <div v-else class="empty-chat-panel">
          <div class="empty-content">
            <p>选择一个联系人开始聊天</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.contact-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 600px;
}

.contact-content h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: bold;
}

.chat-main {
  display: flex;
  height: 500px;
  gap: 16px;
}

.partners-panel {
  width: 300px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.partners-list {
  flex: 1;
  overflow-y: auto;
}

.partner-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.partner-item:hover {
  background-color: #f5f5f5;
}

.partner-item.active {
  background-color: #e6f7ff;
}

.partner-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 12px;
  flex-shrink: 0;
}
.partner-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.default-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px; /* 减小字体 */
}

.partner-info {
  flex: 1;
  min-width: 0;
}

.partner-name {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.last-message {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: bold;
  background-color: #fafafa;
}

.chat-content {
  flex: 1;
  overflow: hidden;
}

.empty-chat-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  border: 1px dashed #ddd;
  border-radius: 8px;
}

.empty-content {
  text-align: center;
  color: #999;
}
</style>
