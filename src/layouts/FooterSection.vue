<template>
  <footer class="footer">
    <div class="links">
      <span class="link">关于我们</span>
      <span class="separator">|</span>
      <span class="link">联系方式</span>
      <span class="separator">|</span>
      <span class="link">平台声明</span>
    </div>
    <div class="copyright">
      © 2026 Home Decoration Platform
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  text-align: center;
  padding:  0;
  color: #666; /* 保持文字可读 */
  font-size: 14px;
  max-height: 50px;
}

/* 链接样式 */
.footer .links {
  margin-bottom: 8px;
}

.footer .link {
  cursor: pointer;
  margin: 0 6px;
  transition: color 0.2s;
}

.footer .link:hover {
  color: #1677ff; /* hover 高亮即可 */
}

.footer .separator {
  margin: 0 6px;
  color: #999;
}
</style>
