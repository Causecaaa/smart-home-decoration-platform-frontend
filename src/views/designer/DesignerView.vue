<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPendingLayouts, getPendingFurnitureLayouts } from '@/api/designer'
import { showToast } from '@nutui/nutui'
import TopNav from "@/layouts/TopNav.vue"

const router = useRouter()

// 页面状态
const activeTab = ref('layout')
const layouts = ref([])
const furnitureLayouts = ref([])
const loading = ref(false)
const initialLoad = ref(true)  // 添加标志区分初始化和切换标签

// 获取待处理布局任务
const loadPendingLayouts = async () => {
  try {
    const res = await getPendingLayouts()
    layouts.value = res
  } catch (error) {
    showToast.fail('加载布局任务失败')
    console.error(error)
  }
}

// 获取待处理家居布局任务
const loadPendingFurnitureLayouts = async () => {
  try {
    const res = await getPendingFurnitureLayouts()
    furnitureLayouts.value = res
  } catch (error) {
    showToast.fail('加载家居任务失败')
    console.error(error)
  }
}

// 初始化加载所有数据
const initLoad = async () => {
  loading.value = true
  initialLoad.value = true

  try {
    // 并行加载两个数据源
    await Promise.all([
      loadPendingLayouts(),
      loadPendingFurnitureLayouts()
    ])
  } finally {
    loading.value = false
    initialLoad.value = false
  }
}

// 切换标签页时加载对应数据
const loadData = async () => {
  if (initialLoad.value) return  // 初始化时不执行单个加载

  loading.value = true
  try {
    if (activeTab.value === 'layout') {
      await loadPendingLayouts()
    } else {
      await loadPendingFurnitureLayouts()
    }
  } finally {
    loading.value = false
  }
}

// 切换标签页
const switchTab = async (tab) => {
  activeTab.value = tab
  await loadData()
}

// 跳转到布局详情
const goToLayoutDetail = (houseId) => {
  router.push(`/designer/layout/${houseId}`)
}

// 跳转到家居设计页面
const goToFurnitureDesign = (layoutId) => {
  router.push(`/designer/furniture/${layoutId}`)
}

// 格式化装饰类型
const formatDecorationType = (type) => {
  const types = {
    'FULL': '全包',
    'HALF': '半包',
    'LABOR_ONLY': '清包'
  }
  return types[type] || type
}

// 格式化布局类型
const formatLayoutType = (type) => {
  return type || '未知户型'
}


onMounted(() => {
  initLoad()
})
</script>


<template>
  <TopNav />

  <div class="designer-container">
    <div class="designer-content">
      <h2>设计师工作台</h2>
      <p>管理您的设计任务</p>

      <!-- 标签页切换 -->
      <div class="tabs-container">
        <div class="tabs">
          <div
            class="tab-item"
            :class="{ active: activeTab === 'layout' }"
            @click="switchTab('layout')"
          >
            <span>布局设计</span>
            <span class="count">{{ layouts.length }}</span>
          </div>
          <div
            class="tab-item"
            :class="{ active: activeTab === 'furniture' }"
            @click="switchTab('furniture')"
          >
            <span>家居设计</span>
            <span class="count">{{ furnitureLayouts.length }}</span>
          </div>
        </div>
      </div>

      <!-- 任务列表 -->
      <div class="tasks-list">
        <!-- 布局设计任务 -->
        <div v-if="activeTab === 'layout'" class="task-section">
          <div v-if="loading" class="loading">加载中...</div>

          <div v-else-if="layouts.length === 0" class="empty-state">
            <div class="empty-icon">📋</div>
            <p>暂无待处理的布局设计任务</p>
          </div>

          <div v-else class="layout-cards">
            <div
              v-for="layout in layouts"
              :key="layout.layoutId"
              class="layout-card"
              @click="goToLayoutDetail(layout.houseId)"
            >
              <div class="card-header">
                <div class="address">
                  <h3>{{ layout.communityName }}</h3>
                  <p>{{ layout.city }} | {{ layout.buildingNo }}栋{{ layout.unitNo }}单元{{ layout.roomNo }}室</p>
                </div>
                <div class="status-badge layout-status">待设计</div>
              </div>

              <div class="card-body">
                <div class="info-grid">
                  <div class="info-item">
                    <label>户型</label>
                    <span>{{ formatLayoutType(layout.layoutType) }}</span>
                  </div>
                  <div class="info-item">
                    <label>面积</label>
                    <span>{{ layout.area }}㎡</span>
                  </div>
                  <div class="info-item">
                    <label>楼层数</label>
                    <span>{{ layout.floorCount }}层</span>
                  </div>
                  <div class="info-item">
                    <label>装修类型</label>
                    <span>{{ formatDecorationType(layout.decorationType) }}</span>
                  </div>
                </div>

                <div class="client-info">
                  <div class="client-avatar">
                    <img
                      :src="`http://localhost:8181${layout.avatarUrl}`"
                      alt="客户头像"
                      @error="onImageError"
                    />
                  </div>
                  <div class="client-details">
                    <p><strong>{{ layout.userName }}</strong></p>
                    <p>{{ layout.phone }} | {{ layout.email }}</p>
                  </div>
                </div>

                <div v-if="layout.redesignNotes" class="notes">
                  <label>备注:</label>
                  <p>{{ layout.redesignNotes }}</p>
                </div>
              </div>

              <div class="card-footer">
                <button class="action-btn primary">开始设计</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 家居设计任务 -->
        <div v-if="activeTab === 'furniture'" class="task-section">
          <div v-if="loading" class="loading">加载中...</div>

          <div v-else-if="furnitureLayouts.length === 0" class="empty-state">
            <div class="empty-icon">🪑</div>
            <p>暂无待处理的家居设计任务</p>
          </div>

          <div v-else class="layout-cards">
            <div
              v-for="layout in furnitureLayouts"
              :key="layout.layoutId"
              class="layout-card"
              @click="goToFurnitureDesign(layout.layoutId)"
            >
              <div class="card-header">
                <div class="address">
                  <h3>{{ layout.communityName }}</h3>
                  <p>{{ layout.city }} | {{ layout.buildingNo }}栋{{ layout.unitNo }}单元{{ layout.roomNo }}室</p>
                </div>
                <div class="status-badge furniture-status">待设计</div>
              </div>

              <div class="card-body">
                <div class="info-grid">
                  <div class="info-item">
                    <label>户型</label>
                    <span>{{ formatLayoutType(layout.layoutType) }}</span>
                  </div>
                  <div class="info-item">
                    <label>面积</label>
                    <span>{{ layout.area }}㎡</span>
                  </div>
                  <div class="info-item">
                    <label>楼层数</label>
                    <span>{{ layout.floorCount }}层</span>
                  </div>
                  <div class="info-item">
                    <label>装修类型</label>
                    <span>{{ formatDecorationType(layout.decorationType) }}</span>
                  </div>
                </div>

                <div class="client-info">
                  <div class="client-avatar">
                    <img
                      :src="`http://localhost:8181${layout.avatarUrl}`"
                      alt="客户头像"
                      @error="onImageError"
                    />
                  </div>
                  <div class="client-details">
                    <p><strong>{{ layout.userName }}</strong></p>
                    <p>{{ layout.phone }} | {{ layout.email }}</p>
                  </div>
                </div>

                <div v-if="layout.redesignNotes" class="notes">
                  <label>备注:</label>
                  <p>{{ layout.redesignNotes }}</p>
                </div>
              </div>

              <div class="card-footer">
                <button class="action-btn secondary">开始家居设计</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.designer-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.designer-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 600px;
}

.designer-content h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: bold;
}

.designer-content p {
  color: #666;
  margin-bottom: 16px;
}

.tabs-container {
  margin-bottom: 16px;
}

.tabs {
  display: flex;
  background: #f5f7fa;
  border-radius: 6px;
  padding: 4px;
}

.tab-item {
  flex: 1;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.tab-item:not(:last-child) {
  margin-right: 2px;
}

.tab-item.active {
  background: #409eff;
  color: #fff;
}

.tab-item:hover:not(.active) {
  background: #ebedf0;
}

.count {
  background: #f0f9ff;
  color: #409eff;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: bold;
}

.tab-item.active .count {
  background: #fff;
  color: #409eff;
}

.tasks-list {
  max-width: 100%;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
}

.layout-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.layout-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.layout-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.card-header {
  padding: 12px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.address h3 {
  margin: 0 0 4px 0;
  color: #1e1e2f;
  font-size: 16px;
}

.address p {
  margin: 0;
  color: #666;
  font-size: 12px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.layout-status {
  background: #e6f7ff;
  color: #1890ff;
}

.furniture-status {
  background: #f0f9eb;
  color: #52c41a;
}

.card-body {
  padding: 12px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}

.info-item span {
  font-weight: 500;
  color: #333;
  font-size: 13px;
}

.client-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 6px;
}

.client-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
  flex-shrink: 0;
}

.client-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.client-details {
  flex: 1;
}

.client-details p:first-child {
  margin: 0 0 2px 0;
  font-weight: 500;
  color: #333;
  font-size: 13px;
}

.client-details p:last-child {
  margin: 0;
  color: #666;
  font-size: 12px;
}

.notes {
  padding: 10px;
  background: #fffbe6;
  border-left: 3px solid #faad14;
  border-radius: 4px;
}

.notes label {
  display: block;
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
}

.notes p {
  margin: 0;
  color: #666;
  line-height: 1.4;
  font-size: 12px;
}

.card-footer {
  padding: 12px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 13px;
}

.action-btn.primary {
  background: #409eff;
  color: #fff;
}

.action-btn.primary:hover {
  background: #66b1ff;
}

.action-btn.secondary {
  background: #52c41a;
  color: #fff;
}

.action-btn.secondary:hover {
  background: #73d13d;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .designer-container {
    padding: 16px;
  }

  .layout-cards {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-item:not(:last-child) {
    margin-right: 0;
    margin-bottom: 4px;
  }
}
</style>
