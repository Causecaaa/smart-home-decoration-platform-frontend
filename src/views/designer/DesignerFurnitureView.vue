<template>
  <TopNav />

  <div class="furniture-design-container">
    <div class="furniture-design-content">
      <div class="header">
        <h2>设计师 - 家居设计</h2>
      </div>

      <div class="layout-and-rooms-container">
        <!-- 设计师布局卡片 -->
        <div v-if="layoutDetail" class="layout-item designer-layout">
          <div class="layout-header">
            <h3>布局信息</h3>
          </div>

          <!-- 布局基本信息 -->
          <div class="layout-basic-info">
            <p><strong>社区：</strong>{{ layoutDetail.communityName }}</p>
            <p><strong>地址：</strong>{{ layoutDetail.city }} | {{ layoutDetail.buildingNo }}栋{{ layoutDetail.unitNo }}单元{{ layoutDetail.roomNo }}室</p>
            <p><strong>户型：</strong>{{ layoutDetail.layoutType }}</p>
            <p><strong>面积：</strong>{{ layoutDetail.area }}㎡</p>
            <p><strong>楼层数：</strong>{{ layoutDetail.floorCount }}层</p>
            <p><strong>装修类型：</strong>{{ formatDecorationType(layoutDetail.decorationType) }}</p>
            <p v-if="layoutDetail.designNotes"><strong>设计备注：</strong>{{ layoutDetail.designNotes }}</p>
          </div>

          <!-- 布局图片展示 -->
          <div class="images" v-if="imageStore.images[layoutDetail.layoutId]?.length > 0">
            <div
                v-for="(img, index) in imageStore.images[layoutDetail.layoutId] || []"
                :key="img.id ?? img.key ?? index"
                class="image-wrapper"
            >
              <img :src="img.url" class="image" @click="previewImage(img.file)" />
            </div>
          </div>

          <!-- 客户信息 -->
          <div class="client-info">
            <p><strong>客户：</strong>{{ layoutDetail.username }}</p>
            <p><strong>联系方式：</strong>{{ layoutDetail.userPhone }} | {{ layoutDetail.userEmail }}</p>
            <button
                class="chat-btn"
                @click="openChatWithClient"
                v-if="layoutDetail.userId"
            >
              💬 联系客户
            </button>
          </div>

        </div>

        <!-- 房间信息展示区域 -->
        <div v-if="rooms.length > 0" class="rooms-container">
          <div class="rooms-header">
            <h3>房间信息</h3>

            <!-- 未提交时的按钮 -->
            <template v-if="!layoutDetail?.finalSubmitted">
              <button class="add-room-btn" @click="openAddRoomDialog">
                + 增加房间
              </button>
              <button
                  class="add-room-btn"
                  @click="submitFinalDesign"
                  v-if="layoutDetail?.furnitureStatus === 'CONFIRMED'"
              >
                📤 提交最终设计
              </button>
            </template>

            <!-- 已提交后的提示信息 -->
            <div v-else class="design-completed-hint">
              <span class="hint-icon">✅</span>
              <span class="hint-text">设计已完成，请提醒用户支付尾款</span>
            </div>
          </div>

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

                <div class="detail-row">
                  <span>楼层：{{ room.floorNo }}</span>
                  <button
                      class="view-scheme-btn"
                      @click="viewSchemes(room)"
                      v-if="room.hasFurnitureScheme"
                  >

                    查看方案
                  </button>

                </div>

                <div class="detail-row">
                  <span>窗户：{{ room.hasWindow ? '有' : '无' }}</span>
                  <button
                      class="view-3dscheme-btn"
                      @click="open3DDesign(room)"
                      v-if="false"
                  >
                    3D 设计
                  </button>

                </div>

                <div class="detail-row">
                  <span>阳台：{{ room.hasBalcony ? '有' : '无' }}</span>
                  <button
                    class="edit-scheme-btn"
                    @click="editSchemes(room)"
                  >
                    增加方案
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <p v-if="!layoutDetail" class="no-layout">
          还没有家居设计信息
        </p>

        <!-- 没有房间时的提示 -->
        <div v-if="layoutDetail && rooms.length === 0" class="no-rooms">
          <p>暂无房间信息，请添加房间</p>
          <button class="add-room-btn" @click="openAddRoomDialog" style="margin-top: 10px;">
            + 添加房间
          </button>
        </div>
      </div>

      <!-- 增加房间弹窗 -->
      <div v-if="showAddRoomDialog" class="overlay" @click.self="closeAddRoomDialog">
        <div class="modal">
          <div class="modal-header">
            <span>添加房间</span>
            <span class="close" @click="closeAddRoomDialog">×</span>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addRoom">
              <div class="form-group">
                <label>房间名称</label>
                <input
                  v-model="newRoom.name"
                  type="text"
                  placeholder="例如：客厅、主卧等"
                  required
                />
              </div>

              <div class="form-group">
                <label>房间类型</label>
                <select v-model="newRoom.type" required>
                  <option value="">请选择房间类型</option>
                  <option value="LIVING_ROOM">客厅</option>
                  <option value="BEDROOM">卧室</option>
                  <option value="KITCHEN">厨房</option>
                  <option value="BATHROOM">卫生间</option>
                  <option value="DINING_ROOM">餐厅</option>
                  <option value="STUDY">书房</option>
                  <option value="BALCONY">阳台</option>
                </select>
              </div>

              <div class="form-group">
                <label>面积 (㎡)</label>
                <input
                  v-model.number="newRoom.area"
                  type="number"
                  placeholder="房间面积"
                  min="1"
                  required
                />
              </div>

              <div class="form-group">
                <label>楼层</label>
                <input
                  v-model.number="newRoom.floor"
                  type="number"
                  placeholder="楼层号"
                  min="1"
                  required
                />
              </div>

              <div class="checkbox-group">
                <label>
                  <input
                    v-model="newRoom.hasWindow"
                    type="checkbox"
                  />
                  有窗户
                </label>

                <label>
                  <input
                    v-model="newRoom.hasBalcony"
                    type="checkbox"
                  />
                  有阳台
                </label>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeAddRoomDialog" class="btn cancel">取消</button>
                <button type="submit" class="btn primary">添加房间</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- 编辑方案弹窗 -->
      <div v-if="showEditSchemeDialog" class="overlay" @click.self="closeEditSchemeDialog">
        <div class="modal large-modal">
          <div class="modal-header">
            <span>{{ editingRoom?.roomName }} - 编辑家居方案</span>
            <span class="close" @click="closeEditSchemeDialog">×</span>
          </div>
          <div class="modal-body">
            <div class="scheme-editor">
              <div class="scheme-form">
                <div class="form-group">
                  <label>上传方案图片</label>
                  <div class="upload-area" @dragover.prevent @drop="handleImageDrop" @click="triggerImageFileInput">
                    <input
                        ref="imageFileInputRef"
                        type="file"
                        accept="image/*"
                        @change="handleImageFileSelect"
                        class="hidden-file-input"
                    />
                    <div class="upload-content">
                      <div class="upload-icon">📁</div>
                      <p>拖拽图片到此处或点击上传</p>
                      <p class="hint">仅支持单张图片上传</p>
                    </div>
                  </div>

                  <!-- 单张图片预览 -->
                  <div v-if="uploadedFiles.length > 0" class="single-preview-section">
                    <h4>已选择的图片</h4>
                    <div class="single-preview">
                      <div class="preview-item">
                        <img :src="uploadedFiles[0].url" alt="预览图" />
                        <button
                            class="remove-btn"
                            @click="clearUploadedFile"
                            type="button"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                <div class="form-grid">
                    <div class="form-group">
                      <label>地面材料</label>
                      <select v-model="newScheme.floor.material">
                        <option value="">请选择地面材料</option>
                        <option value="TILES">瓷砖</option>
                        <option value="WOOD_FLOOR">木地板</option>
                        <option value="COMPOSITE_FLOOR">复合地板</option>
                        <option value="STONE">石材</option>
                        <option value="CARPET">地毯</option>
                        <option value="CEMENT_SELF_LEVELING">水泥自流平</option>
                      </select>

                    </div>

                    <div class="form-group">
                      <label>地面面积 (㎡)</label>
                      <input
                          v-model.number="newScheme.floor.area"
                          type="number"
                          placeholder="请输入地面面积"
                          min="0"
                          step="0.01"
                      />
                    </div>
                </div>

                <div class="form-group">
                  <label>地面备注</label>
                  <textarea
                      v-model="newScheme.floor.notes"
                      placeholder="请输入备注信息"
                      rows="3"
                  ></textarea>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label>墙面材料</label>
                    <select v-model="newScheme.wall.material">
                      <option value="">请选择墙面材料</option>
                      <option value="EMULSION_PAINT">乳胶漆</option>
                      <option value="WALLPAPER">壁纸</option>
                      <option value="DIATOM_MUDE">硅藻泥</option>
                      <option value="WALL_PANEL">护墙板</option>
                      <option value="TILES">瓷砖</option>
                      <option value="ARTISTIC_COATING">艺术涂料</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>墙面面积 (㎡)</label>
                    <input
                        v-model.number="newScheme.wall.area"
                        type="number"
                        placeholder="请输入墙面面积"
                        min="0"
                        step="0.01"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>墙面备注</label>
                  <textarea
                      v-model="newScheme.wall.notes"
                      placeholder="请输入备注信息"
                      rows="3"
                  ></textarea>
                </div>
                <div class="form-grid">
                  <div class="form-group">
                    <label>顶面材料</label>
                    <select v-model="newScheme.ceiling.material">
                      <option value="">请选择顶面材料</option>
                      <option value="PLASTERBOARD_CEILING">石膏板吊顶</option>
                      <option value="INTEGRATED_CEILING">集成吊顶</option>
                      <option value="PVC_CEILING">PVC吊顶</option>
                      <option value="ALUMINUM_SCREW_CEILING">铝扣板吊顶</option>
                      <option value="ORIGINAL_TOP_BRUSH_WHITE">原顶刷白</option>
                      <option value="WOODEN_DECORATIVE_CEILING">木饰面吊顶</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>顶面面积 (㎡)</label>
                    <input
                        v-model.number="newScheme.ceiling.area"
                        type="number"
                        placeholder="请输入顶面面积"
                        min="0"
                        step="0.01"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>顶面备注</label>
                  <textarea
                      v-model="newScheme.ceiling.notes"
                      placeholder="请输入备注信息"
                      rows="3"
                  ></textarea>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label>柜体材料</label>
                    <select v-model="newScheme.cabinet.material">
                      <option value="">请选择柜体材料</option>
                      <option value="SOLID_WOOD_PARTICLE_BOARD">实木颗粒板</option>
                      <option value="DENSITY_BOARD">密度板</option>
                      <option value="MULTI_LAYER_SOLID_WOOD_BOARD">多层实木板</option>
                      <option value="ECOLOGICAL_BOARD">生态板</option>
                      <option value="STAINLESS_STEEL">不锈钢</option>
                      <option value="ACRYLIC">亚克力</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>柜体面积 (㎡)</label>
                    <input
                        v-model.number="newScheme.cabinet.area"
                        type="number"
                        placeholder="请输入柜体面积"
                        min="0"
                        step="0.01"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>柜体备注</label>
                  <textarea
                      v-model="newScheme.cabinet.notes"
                      placeholder="请输入备注信息"
                      rows="3"
                  ></textarea>
                </div>

                <div class="form-actions">
                  <button type="button" @click="closeEditSchemeDialog" class="btn cancel">取消</button>
                  <button @click="saveScheme" class="btn primary">保存方案</button>
                </div>
              </div>
            </div>
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
                </div>

                <!-- 材料信息展示 -->
                <div class="compact-material-info">
                  <div class="material-row">
                    <span class="material-label">地面:</span>
                    <span class="material-value">{{ scheme.floorMaterial || '-' }} ({{ scheme.floorArea ? scheme.floorArea + '㎡' : '-' }})</span>
                  </div>
                  <div class="material-row">
                    <span class="material-label">墙面:</span>
                    <span class="material-value">{{ scheme.wallMaterial || '-' }} ({{ scheme.wallArea ? scheme.wallArea + '㎡' : '-' }})</span>
                  </div>
                  <div class="material-row">
                    <span class="material-label">顶面:</span>
                    <span class="material-value">{{ scheme.ceilingMaterial || '-' }} ({{ scheme.ceilingArea ? scheme.ceilingArea + '㎡' : '-' }})</span>
                  </div>
                  <div class="material-row">
                    <span class="material-label">柜体:</span>
                    <span class="material-value">{{ scheme.cabinetMaterial || '-' }} ({{ scheme.cabinetArea ? scheme.cabinetArea + '㎡' : '-' }})</span>
                  </div>
                  <div class="material-row" v-if="scheme.remark">
                    <span class="material-label">备注:</span>
                    <span class="material-value">{{ scheme.remark }}</span>
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

      <!-- 3D 设计悬浮窗 -->
      <div v-if="show3DDesignModal" class="overlay" @click.self="close3DDesign">
        <div class="modal large-modal" @click.stop>
          <div class="modal-header">
            <span>{{ current3DRoom?.roomName }} - 3D 设计</span>
            <span class="close" @click="close3DDesign">×</span>
          </div>
          <div class="modal-body">
            <div class="room-images-section">
              <h4>房间图片</h4>

              <!-- 上传区域 -->
              <div class="upload-area" @dragover.prevent @drop="handle3DDrop" @click="trigger3DFileInput">
                <input
                    ref="roomImageFileInputRef"
                    type="file"
                    accept="image/*"
                    @change="handle3DFileSelect"
                    class="hidden-file-input"
                />
                <div class="upload-content">
                  <div class="upload-icon">📁</div>
                  <p>拖拽图片到此处或点击上传</p>
                  <p class="hint">支持多张图片上传</p>
                </div>
              </div>

              <!-- 图片列表 -->
              <div v-if="roomImages.length > 0" class="room-images-grid">
                <div v-for="img in roomImages" :key="img.id" class="room-image-item">
                  <img :src="img.url" alt="房间图片" @click="previewRoomImage(img.url)" />
                  <button
                      class="remove-image-btn"
                      @click="deleteRoomImageById(img.id)"
                      type="button"
                  >
                    ×
                  </button>
                </div>
              </div>

              <!-- 待上传的图片预览 -->
              <div v-if="uploaded3DFiles.length > 0" class="pending-upload-section">
                <h4>待上传的图片</h4>
                <div class="pending-images-grid">
                  <div v-for="(file, index) in uploaded3DFiles" :key="index" class="pending-image-item">
                    <img :src="file.url" alt="待上传图片" />
                    <button
                        class="remove-pending-btn"
                        @click="removePending3DFile(index)"
                        type="button"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <button class="upload-all-btn" @click="uploadAllRoomImages">
                  批量上传
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- 图片预览弹窗 -->
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
                  :src="`${BASE_URL}${layoutDetail?.avatarUrl || '/uploads/avatar/default.png'}`"
                  alt="客户头像"
                  class="client-avatar"
                  @error="onAvatarError"
              />
              <span>与客户 {{ layoutDetail?.userName }} 聊天</span>
            </div>
            <span class="close-chat" @click="closeChatModal">×</span>
          </div>
          <div class="chat-body">
            <ChatView :target-user-id="chatTargetUserId" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import {onMounted, ref} from 'vue'
import {useRoute} from 'vue-router'
import TopNav from "@/layouts/TopNav.vue";
import {showToast} from '@nutui/nutui'
import {useLayoutImageStore} from '@/stores/layoutImageStore'
import {
  createFurnitureScheme, createRoom, getDesignerFurnitureLayoutById,
  getRoomsByLayout, getSchemesByRoom, createRoomImage, deleteRoomImage, getRoomImages
} from '@/api/furniture'
import {getLayoutImages, uploadLayoutImage} from "@/api/layoutImage";
import ChatView from '@/components/ChatView.vue';

// 添加响应式数据
const showChatModal = ref(false)
const chatTargetUserId = ref(null)

const route = useRoute()
const layoutId = Number(route.params.layoutId)
const imageStore = useLayoutImageStore()
const BASE_URL = 'http://localhost:8181'
const imageFileInputRef = ref(null)
const roomImageFileInputRef = ref(null)

// 页面状态
const layoutDetail = ref(null)
const rooms = ref([])

// 图片预览状态
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const showPreview = ref(false)
const previewUrl = ref(null)



// 添加房间相关状态
const showAddRoomDialog = ref(false)
const newRoom = ref({
  name: '',
  type: '',
  area: null,
  floor: null,
  hasWindow: false,
  hasBalcony: false
})

// 编辑方案相关状态
const showEditSchemeDialog = ref(false)
const editingRoom = ref(null)
const newScheme = ref({
  floor: {
    material: '',
    area: null,
    notes: ''
  },
  wall: {
    material: '',
    area: null,
    notes: ''
  },
  ceiling: {
    material: '',
    area: null,
    notes: ''
  },
  cabinet: {
    material: '',
    area: null,
    notes: ''
  }
});

const uploadedFiles = ref([])

// 查看方案悬浮窗状态
const showSchemeModal = ref(false)
const currentRoomSchemes = ref([])
const currentRoom = ref(null)

// 3D 设计相关状态
const show3DDesignModal = ref(false)
const current3DRoom = ref(null)
const roomImages = ref([])
const uploaded3DFiles = ref([])

// 清除已上传的文件
const clearUploadedFile = () => {
  if (uploadedFiles.value.length > 0) {
    const img = uploadedFiles.value[0]
    URL.revokeObjectURL(img.url) // 释放内存
    uploadedFiles.value = []
  }
}

// 3D 设计相关方法
const open3DDesign = async (room) => {
  current3DRoom.value = room
  uploaded3DFiles.value = []
  await loadRoomImages(room.roomId)
  show3DDesignModal.value = true
}

const close3DDesign = () => {
  show3DDesignModal.value = false
  current3DRoom.value = null
  uploaded3DFiles.value = []
}

const trigger3DFileInput = () => {
  roomImageFileInputRef.value.click()
}

const handle3DFileSelect = (e) => {
  const files = Array.from(e.target.files || [])
  add3DFiles(files)
}

const handle3DDrop = (e) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files || [])
  add3DFiles(files)
}

const add3DFiles = (files) => {
  const validFiles = files.filter(file => file.type.startsWith('image/'))

  if (validFiles.length === 0) {
    showToast.warn('请选择有效的图片文件')
    return
  }

  validFiles.forEach(file => {
    const url = URL.createObjectURL(file)
    uploaded3DFiles.value.push({ file, url })
  })
}

const removePending3DFile = (index) => {
  const file = uploaded3DFiles.value[index]
  URL.revokeObjectURL(file.url)
  uploaded3DFiles.value.splice(index, 1)
}

const loadRoomImages = async (roomId) => {
  try {
    const images = await getRoomImages(roomId)
    console.log('后端返回的图片数据:', images) // 调试日志

    roomImages.value = images.map(img => ({
      id: img.roomImageId,
      url: BASE_URL + img.imageUrl,
      roomId: img.roomId
    }))

    console.log('处理后的图片数据:', roomImages.value) // 调试日志
  } catch (error) {
    console.error('加载房间图片失败:', error)
    roomImages.value = []
  }
}

const uploadAllRoomImages = async () => {
  if (!current3DRoom.value) return

  if (uploaded3DFiles.value.length === 0) {
    showToast.warn('请选择要上传的图片')
    return
  }

  try {
    const uploadPromises = uploaded3DFiles.value.map(async (item) => {
      await createRoomImage(current3DRoom.value.roomId, item.file)
    })

    await Promise.all(uploadPromises)

    showToast.success('图片上传成功')
    uploaded3DFiles.value = []
    await loadRoomImages(current3DRoom.value.roomId)
  } catch (error) {
    showToast.fail('上传失败，请稍后重试')
    console.error('上传失败:', error)
  }
}

const deleteRoomImageById = async (imageId) => {
  try {
    await deleteRoomImage(imageId)
    showToast.success('删除成功')
    await loadRoomImages(current3DRoom.value.roomId)
  } catch (error) {
    showToast.fail('删除失败，请稍后重试')
    console.error('删除失败:', error)
  }
}

const previewRoomImage = (url) => {
  previewImageUrl.value = url
  showImagePreview.value = true
}

// 工具函数：URL转File
const urlToFile = async (url, name) => {
  const res = await fetch(url)
  const blob = await res.blob()
  return new File([blob], name, { type: blob.type })
}

// 图片处理相关方法
const triggerImageFileInput = () => {
  imageFileInputRef.value.click()
}

const handleImageFileSelect = (e) => {
  const files = Array.from(e.target.files || [])
  addImageFiles(files)
}

const handleImageDrop = (e) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files || [])
  addImageFiles(files)
}

const addImageFiles = (files) => {
  const validFiles = files.filter(file => file.type.startsWith('image/'))

  if (validFiles.length === 0) {
    showToast.warn('请选择有效的图片文件')
    return
  }

  // 只取第一张图片
  const file = validFiles[0]
  const url = URL.createObjectURL(file)
  const key = `${file.name}-${file.size}-${Date.now()}`

  // 清除现有图片（如果有的话）
  clearUploadedFile()

  // 添加新图片
  uploadedFiles.value.push({ file, url, key })
}



// 加载布局详情
const loadLayoutDetail = async () => {
  try {
    layoutDetail.value = await getDesignerFurnitureLayoutById(layoutId)

    // 加载房间信息
    await loadRooms()

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


const submitFinalDesign = async () => {
  // 创建一个虚拟的 input 元素用于选择文件
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.onchange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      // 调用上传图片的 API
      const res = await uploadLayoutImage(layoutId, {
        file,
        imageType: 'FINAL',
        imageDesc: '最终设计方案'
      })

      showToast.success('设计方案提交成功')
      console.log('上传成功:', res)

      // 刷新页面数据
      await loadLayoutDetail()
    } catch (error) {
      showToast.fail('提交失败，请稍后重试')
      console.error('上传失败:', error)
    }
  }
  fileInput.click()
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

// 关闭预览
const closePreview = () => {
  showPreview.value = false
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
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

// 格式化装修类型
const formatDecorationType = (type) => {
  const types = {
    'FULL': '全包',
    'SEMIFULL': '半包',
    'LABOR_ONLY': '清包'
  }
  return types[type] || type
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


// 打开增加房间对话框
const openAddRoomDialog = () => {
  // 重置表单
  newRoom.value = {
    name: '',
    type: '',
    area: null,
    floor: null,
    hasWindow: false,
    hasBalcony: false
  }
  showAddRoomDialog.value = true
}

// 关闭增加房间对话框
const closeAddRoomDialog = () => {
  showAddRoomDialog.value = false
}

// 添加房间
const addRoom = async () => {
  try {
    await createRoom({
      layoutId: layoutId,
      roomName: newRoom.value.name,
      roomType: newRoom.value.type,
      area: newRoom.value.area,
      floorNo: newRoom.value.floor,
      hasWindow: newRoom.value.hasWindow,
      hasBalcony: newRoom.value.hasBalcony
    })

    showToast.success('房间添加成功')
    closeAddRoomDialog()
    await loadRooms() // 重新加载房间列表
  } catch (error) {
    showToast.fail('添加房间失败')
    console.error(error)
  }
}

// 编辑方案
const editSchemes = (room) => {
  editingRoom.value = room;
  newScheme.value = {
    floor: { material: '', area: null, notes: '' },
    wall: { material: '', area: null, notes: '' },
    ceiling: { material: '', area: null, notes: '' },
    cabinet: { material: '', area: null, notes: '' }
  };
  uploadedFiles.value = [];
  showEditSchemeDialog.value = true;
};

// 关闭编辑方案对话框
const closeEditSchemeDialog = () => {
  showEditSchemeDialog.value = false;
  editingRoom.value = null;
  newScheme.value = {
    floor: { material: '', area: null, notes: '' },
    wall: { material: '', area: null, notes: '' },
    ceiling: { material: '', area: null, notes: '' },
    cabinet: { material: '', area: null, notes: '' }
  };
  uploadedFiles.value = [];
};



const saveScheme = async () => {
  if (!editingRoom.value) return;

  if (uploadedFiles.value.length === 0) {
    showToast.fail('请上传方案图片');
    return;
  }

  try {
    const file = uploadedFiles.value[0].file;

    // 构造符合后端要求的数据结构
    const schemeData = {
      roomId: editingRoom.value.roomId,
      floor_material: newScheme.value.floor.material,
      floor_area: newScheme.value.floor.area,
      floor_notes: newScheme.value.floor.notes,
      wall_material: newScheme.value.wall.material,
      wall_area: newScheme.value.wall.area,
      wall_notes: newScheme.value.wall.notes,
      ceiling_material: newScheme.value.ceiling.material,
      ceiling_area: newScheme.value.ceiling.area,
      ceiling_notes: newScheme.value.ceiling.notes,
      cabinet_material: newScheme.value.cabinet.material,
      cabinet_area: newScheme.value.cabinet.area,
      cabinet_notes: newScheme.value.cabinet.notes
    };

    // 移除空值字段
    Object.keys(schemeData).forEach(key => {
      if (
          schemeData[key] === null ||
          schemeData[key] === undefined ||
          schemeData[key] === ''
      ) {
        delete schemeData[key];
      }
    });

    // 构建 FormData
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(schemeData).forEach(key => {
      formData.append(key, schemeData[key]);
    });

    // 发送请求
    await createFurnitureScheme(editingRoom.value.roomId, file, schemeData);

    showToast.success('方案保存成功');
    closeEditSchemeDialog();
    await loadRooms(); // 重新加载房间列表以更新状态
  } catch (error) {
    showToast.fail('保存方案失败');
    console.error(error);
  }
};





// 查看方案方法
const viewSchemes = async (room) => {
  try {
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

const loadSchemeImages = async (roomId, schemes) => {
  const schemeIds = schemes.map(s => s.schemeId)
  await Promise.all(schemeIds.map(id => loadSingleSchemeImages(id)))
}

const loadSingleSchemeImages = async (schemeId) => {
  const scheme = currentRoomSchemes.value.find(s => s.schemeId === schemeId)
  if (!scheme || !scheme.imageUrl) return

  try {
    const fullUrl = `http://localhost:8181${scheme.imageUrl}`
    const file = await urlToFile(fullUrl, `scheme_${schemeId}.jpg`)

    imageStore.setImages(`scheme_${schemeId}`, [{
      id: scheme.schemeId,
      url: fullUrl,
      file: file
    }])
  } catch (error) {
    console.error('Failed to cache image:', error)
  }
}

// 关闭方案悬浮窗
const closeSchemeModal = () => {
  showSchemeModal.value = false
  currentRoomSchemes.value = []
  currentRoom.value = null
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


// 打开与客户的聊天窗口
const openChatWithClient = () => {
  if (layoutDetail.value && layoutDetail.value.userId) {
    chatTargetUserId.value = layoutDetail.value.userId
    showChatModal.value = true
  }
}

// 关闭聊天窗口
const closeChatModal = () => {
  showChatModal.value = false
}

// 头像错误处理
const onAvatarError = (event) => {
  event.target.src = '/uploads/avatar/default.png'
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

.designer-layout {
  border: 1px solid #e6a23c;
  background-color: #fdf6ec;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.layout-basic-info p {
  margin: 4px 0;
  font-size: 13px;
  color: #333;
}

.layout-basic-info strong {
  color: #666;
}

.client-info {
  padding: 10px;
  background: #f0f9ff;
  border-radius: 6px;
  margin: 8px 0;
}

.client-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.client-info strong {
  color: #333;
}

.status-info {
  margin-top: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.status-info p {
  margin: 4px 0;
  font-size: 12px;
  color: #666;
}

.rooms-container {
  flex: 1;
  min-width: 600px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.rooms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.design-completed-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f0f9eb;
  border-radius: 6px;
  color: #67c23a;
  font-size: 14px;
  font-weight: 500;
}

.hint-icon {
  font-size: 18px;
}

.hint-text {
  color: #67c23a;
}

.rooms-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.add-room-btn {
  padding: 6px 12px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.3s;
}

.add-room-btn:hover {
  background: #66b1ff;
}

.room-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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
    min-width: 100%;
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

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  margin-top: 8px;
}

.detail-row span {
  flex: 1;
  color: #666;
  font-size: 12px;
}

.view-scheme-btn, .edit-scheme-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  height: 26px;
  transition: background 0.3s;
  outline: none; /* 移除默认轮廓 */
  box-shadow: none; /* 移除默认阴影 */
}

.view-scheme-btn {
  background: #409eff;
  color: #fff;
}

.view-3dscheme-btn {
  background: #b340ff;
  color: #fff;
  border: none;
  outline: none;
  box-shadow: none;
}

.view-3dscheme-btn:hover {
  filter: brightness(1.1);
  border: none;
  outline: none;
  box-shadow: none;
}

.edit-scheme-btn {
  background: #e6a23c;
  color: #fff;
}

.view-scheme-btn:hover, .edit-scheme-btn:hover {
  filter: brightness(1.1);
}


.edit-scheme-btn {
  background: #e6a23c;
}

.edit-scheme-btn:hover {
  background: #f3ae46;
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

.large-modal {
  width: 700px;
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

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #409eff;
}

.checkbox-group {
  display: flex;
  gap: 16px;
  margin: 12px 0;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
}

.checkbox-group input {
  margin-right: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn.cancel {
  background: #f5f7fa;
  color: #909399;
  border: 1px solid #dcdfe6;
}

.btn.cancel:hover {
  background: #ebedf0;
}

.btn.primary {
  background: #409eff;
  color: #fff;
  border: 1px solid #409eff;
}

.btn.primary:hover {
  background: #66b1ff;
}

.file-upload-label {
  display: inline-block;
  padding: 8px 16px;
  background: #409eff;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.hidden-file-input {
  display: none;
}

.uploaded-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.uploaded-image {
  position: relative;
  width: 80px;
  height: 80px;
}

.uploaded-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.remove-btn {
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

.remove-btn:hover {
  background: rgba(255,0,0,0.8);
}

.scheme-editor {
  padding: 16px 0;
}

.scheme-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scheme-modal {
  width: 600px;
  max-height: 80vh;
  z-index: 1000;
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
  margin-top: 8px;
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

.client-avatar {
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

/* 图片相关的样式 */
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

.no-layout {
  width: 100%;
  text-align: center;
  color: #888;
  margin-top: 40px;
}

.no-rooms {
  width: 100%;
  text-align: center;
  color: #888;
  margin: 40px 0;
}

.no-rooms p {
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .furniture-design-container {
    padding: 16px;
  }

  .layout-and-rooms-container {
    flex-direction: column;
  }

  .layout-item {
    width: 100%;
  }

  .rooms-container {
    min-width: 100%;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
  }
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
  margin-top: 8px;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-content .upload-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.upload-content p {
  margin: 5px 0;
  color: #666;
}

.hint {
  font-size: 12px;
  color: #999;
}

.hidden-file-input {
  display: none;
}

.single-preview-section h4 {
  margin: 10px 0 8px 0;
  font-size: 14px;
  color: #666;
}

.single-preview {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.preview-item {
  position: relative;
  width: 120px;
  height: 120px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(255,0,0,0.7);
  border: none;
  color: #fff;
  border-radius: 4px;
  padding: 2px 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-btn:hover {
  background: rgba(255,0,0,0.9);
}

.compact-material-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 12px 0;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
  font-size: 12px;
}

.material-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
}

.material-label {
  font-weight: bold;
  color: #666;
  min-width: 50px;
}

.material-value {
  color: #333;
  flex: 1;
  text-align: right;
  word-break: break-word;
  padding-left: 8px;
}
.remove-btn:hover {
  background: rgba(255,0,0,0.9);
}

.room-images-section h4 {
  margin: 16px 0 12px 0;
  font-size: 16px;
  color: #333;
}

.room-images-grid {
  display: flex;
  justify-content: center; /* 居中排列 */
  flex-wrap: wrap; /* 允许换行 */
  gap: 12px;
  margin-top: 16px;
}

.room-image-item {
  position: relative;
  width: 120px; /* 固定宽度 */
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ddd;
}


.room-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}

.room-image-item img:hover {
  opacity: 0.9;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(255,0,0,0.7);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background 0.3s;
}

.remove-image-btn:hover {
  background: rgba(255,0,0,0.9);
}

.pending-upload-section h4 {
  margin: 16px 0 12px 0;
  font-size: 16px;
  color: #333;
}

.pending-images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.pending-image-item {
  position: relative;
  width: 100%;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.pending-image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-pending-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(255,0,0,0.7);
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: background 0.3s;
}

.remove-pending-btn:hover {
  background: rgba(255,0,0,0.9);
}

.upload-all-btn {
  margin-top: 16px;
  padding: 10px 20px;
  background: #52c41a;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.upload-all-btn:hover {
  background: #73d13d;
}

</style>
