<template>
  <router-view></router-view>
</template>

<script setup>

</script>

<style>
/* 给整个应用设置背景 */
#app {
  min-height: 100vh;           /* 让背景铺满整个屏幕高度 */
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2); /* 示例渐变背景 */
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
/* 去掉默认 margin/padding */
html, body, #app {
  min-height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


</style>
