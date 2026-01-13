<template>
  <section class="advantages">
    <h2>平台优势</h2>

    <!-- 第一行 -->
    <div class="adv-row">
      <div class="adv-item" v-for="adv in advList.slice(0, 2)" :key="adv.text">
        <div class="icon">{{ adv.icon }}</div>
        <p>{{ adv.text }}</p>
      </div>
    </div>

    <!-- 第二行 -->
    <div class="adv-row">
      <div class="adv-item" v-for="adv in advList.slice(2, 4)" :key="adv.text">
        <div class="icon">{{ adv.icon }}</div>
        <p>{{ adv.text }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const advList = [
  { icon: '🛠', text: '装修过程可视化' },
  { icon: '📊', text: '预算与进度透明' },
  { icon: '🧱', text: '专业施工标准' },
  { icon: '🔒', text: '合同与数据保障' },
]
</script>

<style scoped>
.advantages h2 {
  text-align: center;
  font-size: 28px;
  margin-bottom: 24px;
}

.adv-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.adv-item {
  width: 150px;
  height: 150px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.adv-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.12);
}

.adv-item .icon {
  font-size: 32px;
  margin-bottom: 12px;
}
</style>
