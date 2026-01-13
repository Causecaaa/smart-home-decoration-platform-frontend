<template>
  <section class="hero">
    <h1>一站式房屋装修管理平台</h1>
    <p>从毛坯到入住，全流程可视化管理，让装修更简单、更透明</p>
    <div class="hero-btns">
      <button class="primary-btn" @click="$router.push('/houses')">立即开始</button>
      <button class="secondary-btn">查看装修案例</button>
    </div>
  </section>
</template>

<script setup>
// 如果需要响应登录状态，可以通过 props 或 Pinia
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 10px 0 50px;
  background: linear-gradient(135deg, #4f8ef7, #6ac2ff);
  color: white;
  border-radius: 12px;
}

.hero h1 {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 16px;
}

.hero p {
  font-size: 18px;
  margin-bottom: 24px;
}

.hero-btns button {
  margin: 0 12px;
  padding: 12px 32px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
}

.primary-btn {
  background-color: #1677ff;
  color: #fff;
}

.primary-btn:hover {
  background-color: #0f5acc;
}

.secondary-btn {
  background-color: #fff;
  color: #1677ff;
}

.secondary-btn:hover {
  background-color: #e6f0ff;
}
</style>
