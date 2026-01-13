<template>
  <TopNav class="top-nav" />
  <div class="houses-page">

    <div class="header">
      <h2>我的房屋</h2>
    </div>

    <div class="house-list">
      <div
          class="house-item"
          v-for="house in houses"
          :key="house.houseId"
      >
        <h3>{{ house.layoutType }} | {{ house.area }}㎡</h3>
        <p>{{ house.city }} · {{ house.communityName }} {{ house.buildingNo }}栋{{ house.unitNo }}单元{{ house.roomNo }}</p>
        <p>装修类型：{{ house.decorationType }}</p>
        <p>楼层：{{ house.floorCount }}</p>
      </div>

      <p v-if="houses.length === 0" class="no-house">
        还没有房屋信息，快去新增吧～
      </p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TopNav from '@/layouts/TopNav.vue'
import { getHousesByUser } from '@/api/house'

// 房屋列表
const houses = ref([])

const loadHouses = async () => {
  try {
    const res = await getHousesByUser()
    houses.value = res
    console.log('房屋列表:', res)
  } catch (err) {
    console.error('加载房屋出错:', err)
  }
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
  margin-bottom: 24px;
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

.no-house {
  width: 100%;
  text-align: center;
  color: #888;
  margin-top: 40px;
}
</style>
