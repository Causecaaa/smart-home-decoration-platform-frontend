<template>
  <section class="cases">
    <h2>装修案例</h2>

    <!-- 第一行 -->
    <div class="case-row">
      <div class="case-item" v-for="(c, i) in caseList.slice(0, 2)" :key="i">
        {{ c }}
      </div>
    </div>

    <!-- 第二行 -->
    <div class="case-row">
      <div class="case-item" v-for="(c, i) in caseList.slice(2, 4)" :key="i">
        {{ c }}
      </div>
    </div>
  </section>
</template>

<script setup>
const caseList = [
  '现代简约 · 三居室',
  '北欧风 · 两居室',
  '轻奢风 · 别墅',
  '日式风 · 一居室',   // 新增一个案例
]
</script>

<style scoped>
.cases h2 {
  text-align: center;
  font-size: 28px;
  margin-bottom: 24px;
}

.case-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.case-item {
  width: 200px;
  height: 140px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.case-item:hover {
  transform: translateY(-6px);
}
</style>
