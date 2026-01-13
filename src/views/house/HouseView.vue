<template>
  <TopNav class="top-nav" />
  <div class="houses-page">

    <div class="header">
      <h2>我的房屋</h2>
      <!-- 新增按钮常驻 -->
      <button class="add-btn" @click="openDialog('add')">新增房屋</button>
    </div>

    <div class="house-list">
      <div
          class="house-item"
          v-for="house in houses"
          :key="house.houseId"
      >
        <h3>{{ house.city }} * {{ house.communityName }}</h3>
        <p> {{ house.layoutType }} | {{ house.area }}㎡</p>
        <p>{{ house.buildingNo }}栋 · {{ house.unitNo }}单元 · {{ house.roomNo }}</p>
        <p>装修类型：{{ DECORATION_MAP[house.decorationType] || house.decorationType }}</p>
        <p>楼层：{{ house.floorCount }}</p>

        <!-- 编辑/删除按钮 -->
        <div class="actions">
          <button @click="openDialog('edit', house)">编辑</button>
          <button @click="confirmDelete(house.houseId)">删除</button>
        </div>
      </div>

      <!-- 房屋列表为空时显示 -->
      <p v-if="houses.length === 0" class="no-house">
        还没有房屋信息，快去新增吧～
      </p>
    </div>

    <!-- 弹窗 -->
    <div v-if="showDialog" class="overlay" @click.self="closeDialog">
      <div class="modal">
        <div class="modal-header">
          <span>{{ dialogMode === 'edit' ? '编辑房屋' : '新增房屋' }}</span>
          <span class="close" @click="closeDialog">×</span>
        </div>

        <div class="modal-body">
          <HouseForm
              v-if="showDialog"
              :house="currentHouse"
              @success="onFormSuccess"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { showToast } from '@nutui/nutui'
import TopNav from '@/layouts/TopNav.vue'
import HouseForm from '@/components/house/HouseForm.vue'
import { getHousesByUser, deleteHouse } from '@/api/house'

const DECORATION_MAP = { FULL: '全包', HALF: '半包', LOOSE: '散装' }

const houses = ref([])
const showDialog = ref(false)
const dialogMode = ref('add')
const currentHouse = ref(null)

// 加载房屋列表
const loadHouses = async () => {
  try {
    const res = await getHousesByUser()
    houses.value = res
    showToast.success('房屋列表加载成功')
  } catch (err) {
    houses.value = []
    showToast.fail('加载房屋失败，请重试')
  }
}

// 打开弹窗
const openDialog = (mode, house = null) => {
  dialogMode.value = mode
  currentHouse.value = house
  showDialog.value = true
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
  currentHouse.value = null
}

// 删除房屋
const confirmDelete = async (houseId) => {
  if (confirm('确定要删除该房屋吗？')) {
    try {
      await deleteHouse(houseId)
      houses.value = houses.value.filter(h => h.houseId !== houseId)
      showToast.success('删除成功')
    } catch (err) {
      const msg = err.response?.data?.message || '删除失败，请重试'
      showToast.fail(msg)
    }
  }
}

// 表单提交成功回调
const onFormSuccess = async () => {
  await loadHouses()
  closeDialog()
  showToast.success('操作成功')
}

onMounted(() => {
  loadHouses()
})
</script>



<style scoped>
.houses-page {
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

.house-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.house-item {
  width: 280px;
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
  margin-top: 8px;
}

.actions button {
  padding: 4px 10px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: #f0f0f0;
}

.actions button:hover {
  background: #e0e0e0;
}

.no-house {
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
