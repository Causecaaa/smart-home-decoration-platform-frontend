<script setup>
import TopNav from "@/layouts/TopNav.vue";
import HeroSection from "@/components/main/HeroSection.vue";
import Advantages from "@/components/main/AdvantagesComponent.vue";
import Cases from "@/components/main/CasesComponent.vue";
import FooterSection from "@/layouts/FooterSection.vue";
</script>

<template>
  <div class="main-container">
    <!-- 顶部导航 -->
    <TopNav class="top-nav" />

    <!-- 页面主体按比例分配 -->
    <HeroSection class="hero" />
    <div class="middle-section">
      <Advantages class="advantages" />
      <Cases class="cases" />
    </div>


    <!-- 页脚 -->
    <FooterSection class="footer" />
  </div>
</template>

<style scoped>

/* 整个页面占满可视区 */
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 100% 可视区 */
}

/* TopNav 固定高度 */
.top-nav {
  flex: 0 0 64px; /* 高度固定 64px */
}

/* Footer 固定高度 */
.footer {
  flex: 0 0 80px; /* 高度固定 80px */
}

/* 中间三个模块按比例分配剩余高度 */
.hero {
  flex: 2; /* 占剩余高度的 2/6 */
}

.advantages {
  flex: 1; /* 占 1/6 */
}

.cases {
  flex: 3; /* 占 3/6 */
}

/* 防止模块太小，可以加最小高度 */
.hero,
.advantages,
.cases {
  min-height: 100px;
}

.middle-section {
  display: flex;
  flex: 1;       /* 占剩余高度 */
  gap: 24px;
  padding: 0 24px;
}

.advantages,
.cases {
  flex: 1;       /* 左右各占一半 */
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden; /* 防止滚动条 */
}

</style>
