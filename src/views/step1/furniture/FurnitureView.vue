<template>
  <TopNav />

  <div class="furniture-design-container">
    <div class="furniture-design-content">
      <div class="header">
        <h2>家具设计</h2>
      </div>

      <div class="layout-and-rooms-container">
        <!-- 用户家具布局卡片 -->
        <div v-if="layoutDetail" class="layout-item user-layout">
          <div class="layout-header">
            <h3>家具设计方案</h3>
          </div>

          <div class="images" v-if="imageStore.images[layoutDetail.layoutId]?.length > 0">
            <div
                v-for="(img, index) in imageStore.images[layoutDetail.layoutId] || []"
                :key="img.id ?? img.key ?? index"
                class="image-wrapper"
            >
              <img :src="img.url" class="image" @click="previewImage(img.file)" />
            </div>
          </div>

          <!-- 显示设计师信息或提示 -->
          <div v-if="layoutDetail.furnitureDesignerId" class="designer-info">
            <!-- 显示设计师信息或提示 -->
            <div v-if="layoutDetail.furnitureDesignerId" class="designer-info">

                <div style="padding-bottom: 10px">
                  设计师：{{ layoutDetail.designerUsername }}（{{ layoutDetail.designerEmail }}）
                </div>
                <button
                    class="chat-btn"
                    @click="openChatWithDesigner"
                    v-if="layoutDetail.furnitureDesignerId"
                >
                  💬 联系设计师
                </button>

              <!-- 其他内容保持不变 -->
            </div>


            <p class="status" style="padding-top: 20px">状态：设计师正在为您准备家具设计方案</p>




            <!-- 💰 订单状态区 -->
            <div class="bill-box">
              <div class="bill-title">💰 家具设计方案费用</div>
              <!-- 防止 _billMeta 为空 -->
              <div v-if="layoutDetail.payStatus === 'UNPAID'">
                <p>总价：¥{{ layoutDetail.billAmount }}</p>
                <p>定金：¥{{ layoutDetail.depositAmount }}</p>
                <p class="bill-hint">支付定金后，设计师将开始家具方案设计</p>
                <button class="btn" @click="payDeposit(layoutDetail.billId)">支付定金</button>
              </div>
              <div v-else-if="layoutDetail.payStatus === 'DEPOSIT_PAID'">
                <p>已支付定金：¥{{ layoutDetail.depositAmount }}</p>
                <!-- 检查是否所有方案都已确认 -->
                <div v-if="layoutDetail.furnitureStatus === 'CONFIRMED'">
                  <p class="bill-hint">✅ 所有方案已确认，可支付尾款</p>
                  <button class="btn btn-primary" @click="payFinalAmount(layoutDetail.billId)">支付尾款</button>
                </div>
                <div v-else>
                  <p class="bill-hint">设计师正在出方案，确认所有方案后需支付尾款</p>
                </div>
              </div>
              <div v-else-if="layoutDetail.payStatus === 'PAID'">
                <p>总价：¥{{ layoutDetail.billAmount }}</p>
                <p class="bill-hint success">
                  ✅ 费用已全部结清<br>
                  已完成家具方案设计
                </p>
              </div>
            </div>

          </div>
          <div v-else class="no-designer-info">
            <p>⚠️ 尚未选择家具设计师</p>
            <button class="select-designer-btn" @click="openDesignerDialog">
              选择设计师
            </button>
          </div>
        </div>

        <!-- 房间信息展示区域 -->
        <div v-if="rooms.length > 0" class="rooms-container">
          <h3>房间信息</h3>
          <div class="room-list">
            <div v-for="room in rooms" :key="room.roomId" class="room-item">
              <div class="room-header">
                <h4>{{ room.roomName }} ({{ room.roomType }})</h4>
                <span class="room-status" :class="getRoomStatus(room).class">
                  {{ getRoomStatus(room).text }}
                </span>

              </div>
              <div class="room-details">
                <p>面积：{{ room.area }}㎡</p>
                <p>楼层：{{ room.floorNo }}</p>
                <p>窗户：{{ room.hasWindow ? '有' : '无' }}</p>
                <div class="detail-row">
                  <span>阳台：{{ room.hasBalcony ? '有' : '无' }}</span>
                  <button v-if="room.hasFurnitureScheme" class="view-scheme-btn" @click="viewSchemes(room)">查看方案</button>
                </div>
              </div>
            </div>



          </div>
        </div>

        <!-- 空状态 -->
        <p v-if="!layoutDetail" class="no-layout">
          还没有家具设计信息
        </p>
      </div>

      <!-- 设计师选择弹窗 -->
      <div v-if="showDesignerDialog" class="overlay" @click.self="closeDesignerDialog">
        <div class="modal">
          <div class="modal-header">
            <span>选择家具设计师</span>
            <span class="close" @click="closeDesignerDialog">×</span>
          </div>
          <div class="modal-body">
            <DesignerSelector
                :designers="designers"
                v-model="selectedDesignerId"
                @select="handleSelectDesigner"
            />
          </div>
        </div>
      </div>


      <!-- 图片预览弹窗使用更高的层级 -->
      <div v-if="showImagePreview" class="overlay image-preview-overlay" @click="closeImagePreview">
        <div class="modal" @click.stop>
          <img :src="previewImageUrl" style="max-width: 100%; max-height: 80vh;" />
        </div>
      </div>

      <!-- 布局图片预览弹窗 -->
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
                  :src="`${BASE_URL}${layoutDetail.avatarUrl }`"
                  alt="设计师头像"
                  class="designer-avatar"
                  @error="onAvatarError"
              />
              <span>与设计师 {{ layoutDetail.designerUsername }} 聊天</span>
            </div>
            <span class="close-chat" @click="closeChatModal">×</span>
          </div>
          <div class="chat-body">
            <ChatView :target-user-id="chatTargetUserId" />
          </div>
        </div>
      </div>



      <!-- 查看方案悬浮窗 -->
      <div v-if="showSchemeModal" class="overlay" @click="closeSchemeModal">
        <div class="modal scheme-modal" @click.stop>
          <div class="modal-header">
            <span>{{ currentRoom?.roomName }} - 方案列表</span>
            <span class="close" @click="closeSchemeModal">×</span>
          </div>
          <div class="modal-body scheme-modal-body">
            <div v-if="currentRoomSchemes.length > 0" class="scheme-list">
              <div v-for="scheme in currentRoomSchemes" :key="scheme.schemeId" class="scheme-item">
                <!-- 第一行：信息和确认按钮 -->
                <div class="scheme-header">
                  <div class="scheme-info">
                    <p>版本: V{{ scheme.schemeVersion }}</p>
                    <p>状态: {{ scheme.schemeStatus === 'SUBMITTED' ? '已提交' : scheme.schemeStatus }}</p>
                    <p>创建时间: {{ new Date(scheme.createdAt).toLocaleString() }}</p>
                  </div>
                  <!-- 确认按钮：仅在方案状态为SUBMITTED时显示 -->
                  <div class="scheme-actions" v-if="scheme.schemeStatus === 'SUBMITTED'">
                    <button class="confirm-btn" @click="confirmScheme(scheme.schemeId)">确认方案</button>
                  </div>
                </div>

                <!-- 图片区域 -->
                <div v-if="scheme.imageUrl" class="scheme-image">
                  <img
                      :src="getImageUrl(scheme.schemeId)"
                      alt="方案图片"
                      @click="previewImageFromCache(scheme.schemeId)"
                  />
                </div>

                <div v-else class="no-image">
                  <p>暂无图片</p>
                </div>
              </div>

            </div>
            <div v-else class="no-schemes">
              <p>暂无方案</p>
            </div>
          </div>
        </div>
      </div>




    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from "@/layouts/TopNav.vue";
import DesignerSelector from '@/components/DesignerSelector.vue'
import { showToast } from '@nutui/nutui'
import {getDesignerList} from "@/api/designer";
import {payDepositRequest, payFinalRequest} from '@/api/bill'
import { useLayoutImageStore } from '@/stores/layoutImageStore'
import {
  assignFurnitureDesigner,
  confirmFurnitureScheme,
  getUserFurnitureLayoutById,
  getRoomsByLayout,
  getSchemesByRoom
} from '@/api/furniture'
// 导入聊天组件
import ChatView from '@/components/ChatView.vue'
import {getLayoutImages} from "@/api/layoutImage";

// 添加响应式数据
const showChatModal = ref(false)
const chatTargetUserId = ref(null)



const route = useRoute()
const layoutId = Number(route.params.layoutId)
const imageStore = useLayoutImageStore()
const BASE_URL = 'http://localhost:8181'

// 页面状态
const layoutDetail = ref(null)
const designers = ref([])
const selectedDesignerId = ref(null)
const showDesignerDialog = ref(false)
const rooms = ref([])  // 添加房间数组

// 图片预览状态
const showImagePreview = ref(false)
const previewImageUrl = ref('')

const showPreview = ref(false)
const previewUrl = ref(null)

// 添加悬浮窗状态
const showSchemeModal = ref(false)
const currentRoomSchemes = ref([])
const currentRoom = ref(null)



// 加载布局详情
// 加载布局详情
const loadLayoutDetail = async () => {
  try {
    const res = await getUserFurnitureLayoutById(layoutId)
    layoutDetail.value = res

    // 如果没有指定家具设计师，则加载设计师列表
    if (!res.furnitureDesignerId) {
      await loadDesigners()
    } else {
      selectedDesignerId.value = res.furnitureDesignerId
    }

    // 加载房间信息
    if (res.furnitureDesignerId) {
      await loadRooms()
    }

    // 加载布局图片
    await loadAllLayoutImages()
  } catch (error) {
    showToast.fail('加载布局详情失败')
    console.error(error)
  }
}


// 加载房间信息
const loadRooms = async () => {
  try {
    const res = await getRoomsByLayout(layoutId)
    rooms.value = res
  } catch (error) {
    showToast.fail('加载房间信息失败')
    console.error(error)
  }
}

const loadDesigners = async () => {
  try {
    const res = await getDesignerList()
    designers.value = res.map(d => ({
      userId: d.userId,
      name: d.name,
      avatar: d.avatar,
      rating: d.rating,
      orderCount: d.orderCount,
      style: d.style,
      experienceYears: d.experienceYears,
      shortBio: d.shortBio
    }))
  } catch (error) {
    showToast.fail('加载设计师列表失败')
    console.error(error)
  }
}
// 打开与设计师的聊天窗口
const openChatWithDesigner = () => {
  if (layoutDetail.value && layoutDetail.value.furnitureDesignerId) {
    chatTargetUserId.value = layoutDetail.value.furnitureDesignerId
    showChatModal.value = true
  }
}

// 关闭聊天窗口
const closeChatModal = () => {
  showChatModal.value = false
}

// 工具函数：URL转File
const urlToFile = async (url, name) => {
  const res = await fetch(url)
  const blob = await res.blob()
  return new File([blob], name, { type: blob.type })
}


// 加载布局图片
const loadLayoutImages = async (layoutId) => {
  try {
    const imgList = await getLayoutImages(layoutId)

    const formatted = await Promise.all(
        imgList.map(async img => {
          const fullUrl = BASE_URL + img.imageUrl
          const file = await urlToFile(fullUrl, `image_${img.imageId}.jpg`)
          return { id: img.imageId, url: fullUrl, file }
        })
    )

    imageStore.setImages(layoutId, formatted)
  } catch (error) {
    console.error('加载布局图片失败:', error)
  }
}

const loadAllLayoutImages = async () => {
  if (layoutDetail.value) {
    await loadLayoutImages(layoutDetail.value.layoutId)
  }
}

// 图片预览
const previewImage = (file) => {
  previewUrl.value = URL.createObjectURL(file)
  showPreview.value = true
}


// 添加图片加载方法
const loadSchemeImages = async (roomId, schemes) => {
  const schemeIds = schemes.map(s => s.schemeId)
  await Promise.all(schemeIds.map(id => loadSingleSchemeImages(id)))
}

const loadSingleSchemeImages = async (schemeId) => {
  // 获取方案图片信息
  const scheme = currentRoomSchemes.value.find(s => s.schemeId === schemeId)
  if (!scheme || !scheme.imageUrl) return

  try {
    // 将图片URL转换为File对象并缓存
    const fullUrl = `http://localhost:8181${scheme.imageUrl}`
    const file = await urlToFile(fullUrl, `scheme_${schemeId}.jpg`)

    // 将图片存储到缓存中，使用schemeId作为标识
    imageStore.setImages(`scheme_${schemeId}`, [{
      id: scheme.schemeId,
      url: fullUrl,
      file: file
    }])
  } catch (error) {
    console.error('Failed to cache image:', error)
  }
}

// 获取缓存中的图片URL
const getImageUrl = (schemeId) => {
  const images = imageStore.images[`scheme_${schemeId}`]
  return images && images.length > 0 ? images[0].url : ''
}

// 预览缓存中的图片
const previewImageFromCache = (schemeId) => {
  const images = imageStore.images[`scheme_${schemeId}`]
  if (images && images.length > 0) {
    const file = images[0].file
    const url = URL.createObjectURL(file)
    previewImageUrl.value = url
    showImagePreview.value = true
  }
}

// 查看方案方法
const viewSchemes = async (room) => {
  try {
    // 调用API获取房间的所有方案
    const schemes = await getSchemesByRoom(room.roomId)
    currentRoomSchemes.value = schemes
    currentRoom.value = room

    // 加载方案图片到缓存
    await loadSchemeImages(room.roomId, schemes)

    showSchemeModal.value = true
  } catch (error) {
    showToast.fail('加载方案失败')
    console.error(error)
  }
}

// 关闭方案悬浮窗
const closeSchemeModal = () => {
  showSchemeModal.value = false
  currentRoomSchemes.value = []
  currentRoom.value = null
}

// 辅助函数：获取房间状态
const getRoomStatus = (room) => {
  if (room.hasConfirmedScheme) {
    return { text: '已确定', class: 'confirmed' }
  } else if (room.hasFurnitureScheme) {
    return { text: '有方案', class: 'has-scheme' }
  } else {
    return { text: '无方案', class: 'no-scheme' }
  }
}

// 选择设计师
const handleSelectDesigner = async (designer) => {
  try {
    // 调用后端接口分配家具设计师
    await assignFurnitureDesigner(layoutId, designer.userId)

    // 更新本地状态
    selectedDesignerId.value = designer.userId
    layoutDetail.value.furnitureDesignerId = designer.userId

    // 显示成功提示
    showToast.success(`已成功选择${designer.name}`)

    // 关闭弹窗
    closeDesignerDialog()

    // 重新加载布局详情以获取最新数据
    await loadLayoutDetail()
  } catch (error) {
    showToast.fail('分配设计师失败')
    console.error(error)
  }
}

// 支付定金
const payDeposit = async (billId) => {
  const ok = confirm('确认支付定金吗？支付后将进入家具设计阶段')
  if (!ok) return

  try {
    await payDepositRequest(billId)
    showToast.success('定金支付成功')
    await loadLayoutDetail()  // 重新加载数据
  } catch (e) {
    showToast.fail('支付失败，请稍后重试')
  }
}

// 支付尾款
const payFinalAmount = async (billId) => {
  const ok = confirm('确认支付尾款吗？支付后家具设计环节将完成')
  if (!ok) return

  try {
    await payFinalRequest(billId)  // 使用现有的支付API（假设它能处理尾款）
    showToast.success('尾款支付成功')
    await loadLayoutDetail()  // 重新加载数据
  } catch (e) {
    showToast.fail('支付失败，请稍后重试')
  }
}


// 打开设计师选择弹窗
const openDesignerDialog = () => {
  showDesignerDialog.value = true
}

// 关闭设计师选择弹窗
const closeDesignerDialog = () => {
  showDesignerDialog.value = false
}

// 确认方案方法
const confirmScheme = async (schemeId) => {
  const ok = confirm('确认此方案吗？确认后将不能再修改')
  if (!ok) return

  try {
    await confirmFurnitureScheme(schemeId)
    showToast.success('方案确认成功')
    closeSchemeModal()  // 关闭模态框
    await loadLayoutDetail()  // 重新加载数据以更新状态
  } catch (error) {
    showToast.fail('确认失败')
    console.error(error)
  }
}

// 关闭图片预览
const closeImagePreview = () => {
  showImagePreview.value = false
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = ''
  }
}

// 关闭预览
const closePreview = () => {
  showPreview.value = false
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
}

onMounted(() => {
  loadLayoutDetail()
})
</script>

<style scoped>
.furniture-design-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.furniture-design-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 600px;
}

.furniture-design-content h2 {
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

.layout-and-rooms-container {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
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

.user-layout {
  border: 1px solid #409eff;
  background-color: #f0f9ff;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.designer-info p,
.no-designer-info p {
  margin: 4px 0;
  color: #666;
  font-size: 13px;
}

.status {
  color: #67c23a;
  font-weight: 500;
}

.no-designer-info {
  color: #e6a23c;
}

.select-designer-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.select-designer-btn:hover {
  background: #66b1ff;
}

.rooms-container {
  flex: 1;
  min-width: 600px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.room-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.room-item {
  flex: 1;
  min-width: 200px;
  max-width: 250px;
  padding: 12px;
  border-radius: 8px;
  background-color: #fafafa;
  flex-basis: calc(25% - 12px); /* 默认每行4个 */
  border: 1px solid #ccf0fd;
  transition: all 0.3s ease;
}

.room-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

/* 响应式调整：不同屏幕尺寸下的房间数量 */
@media (max-width: 1200px) {
  .room-item {
    flex-basis: calc(33.333% - 12px); /* 每行3个 */
  }
}

@media (max-width: 900px) {
  .room-item {
    flex-basis: calc(50% - 12px); /* 每行2个 */
  }
}

@media (max-width: 600px) {
  .room-item {
    flex-basis: 100%; /* 每行1个 */
  }

  .rooms-container {
    min-width: 300px;
  }
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.room-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #1e1e2f;
}

.room-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.room-status.has-scheme {
  background-color: #e6f7ff;
  color: #fa6616;
}

.room-status.no-scheme {
  background-color: #fff7e6;
  color: #a318ff;
}

.room-status.confirmed {
  background-color: #f0f9eb;
  color: #66ccff;
}

.room-details p {
  margin: 4px 0;
  color: #666;
  font-size: 12px;
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

.modal-body {
  max-height: 60vh;
  overflow-y: auto;
}

.no-layout {
  width: 100%;
  text-align: center;
  color: #888;
  margin-top: 40px;
}

.bill-box {
  margin-top: 12px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.bill-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.bill-hint {
  font-size: 12px;
  color: #666;
  margin: 8px 0;
}

.bill-hint.success {
  color: #67c23a;
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

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
}

.detail-row span {
  flex: 1;
  color: #666;
  font-size: 12px;
}

.view-scheme-btn {
  padding: 4px 8px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  height: 26px;
  transition: background 0.3s;
}

.view-scheme-btn:hover {
  background: #66b1ff;
}

.scheme-modal {
  width: 600px;
  max-height: 80vh;
  z-index: 1000; /* 确保层级足够高 */
}

.scheme-modal-body {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
}

.scheme-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scheme-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.3s ease;
}

.scheme-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.scheme-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.scheme-info {
  flex: 1;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.scheme-info p {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.scheme-actions {
  flex-shrink: 0;
}

.image-preview-overlay {
  z-index: 1001; /* 比方案悬浮窗更高 */
}
.scheme-image {
  text-align: center;
  margin: 8px 0;
}

.scheme-image img {
  max-width: 100%;
  max-height: 200px;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #eee;
  cursor: pointer;
}

.scheme-image img:hover {
  opacity: 0.9;
}

.no-image {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 20px 0;
}

.no-schemes {
  text-align: center;
  color: #999;
  font-size: 16px;
  padding: 40px 0;
}

.confirm-btn {
  padding: 4px 8px;
  background: #52c41a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
}

.confirm-btn:hover {
  background: #73d13d;
}

.chat-btn {
  margin-left: 10px;
  padding: 4px 8px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.3s;
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

.chat-header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.designer-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #409eff;
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

/* 添加图片相关的样式 */
.images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 12px 0;
  justify-content: flex-start;
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
  border: 1px solid #ddd;
}

.image:hover {
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .furniture-design-container {
    padding: 16px;
  }

  .layout-and-rooms-container {
    flex-direction: column;
  }

  .rooms-container {
    min-width: 100%;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
