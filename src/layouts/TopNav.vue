<template>
  <header class="top-nav">
    <div class="nav-left">
      <img src="../assets/logo.jpg" class="logo" />
    </div>

    <nav class="nav-center">
      <div class="menu-item" @click="$router.push('/')">首页</div>
      <div class="menu-item" @click="$router.push('/houses')">我的房屋</div>
      <div class="menu-item" @click="$router.push('/')">个人信息</div>
      <div class="menu-item" @click="$router.push('/')">联系客服</div>
    </nav>

    <div class="nav-right">
      <template v-if="!userStore.token">
        <span class="login-btn" @click="showAuthDialog = true">登录</span>
      </template>
      <template v-else>
        <div class="user-info">
          <img
              v-if="userStore.user.avatar_url"
              :src="`http://localhost:8181${userStore.user.avatar_url}`"
              class="avatar"
          />
          <span class="user-name">{{ userStore.user.userName }}</span>
        </div>

        <button class="logout-btn" @click="handleLogout">退出</button>
      </template>
    </div>
  </header>

  <div v-if="toastMsg" class="toast">{{ toastMsg }}</div>

  <!-- 登录 / 注册悬浮窗 -->
  <div v-if="showAuthDialog" class="overlay" @click.self="showAuthDialog = false">
    <div class="modal">
      <div class="modal-header">
        <span>{{ isLogin ? '登录' : '注册' }}</span>
        <span class="close" @click="showAuthDialog = false">×</span>
      </div>

      <div class="modal-body">
        <Transition name="form-switch" mode="out-in">
          <LoginForm
              v-if="isLogin"
              key="login"
              @success="onAuthSuccess"
          />
          <RegisterForm
              v-else
              key="register"
              @success="onAuthSuccess"
          />
        </Transition>
      </div>

      <div class="switch-link">
        <span v-if="isLogin" @click="isLogin = false">没有账号？去注册</span>
        <span v-else @click="isLogin = true">已有账号？去登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import LoginForm from '@/components/login/LoginForm.vue'
import RegisterForm from '@/components/register/RegisterForm.vue'
import router from '@/router'

const userStore = useUserStore()

// 登录 / 注册弹窗
const showAuthDialog = ref(false)
const isLogin = ref(true)

// 自制 toast
const toastMsg = ref('')
const showToast = (msg, duration = 2000) => {
  toastMsg.value = msg
  setTimeout(() => toastMsg.value = '', duration)
}

// 退出（浏览器 confirm + toast）
const handleLogout = () => {
  const confirmed = window.confirm('确定要退出当前账号吗？')
  if (confirmed) {
    userStore.logout()
    showToast('退出成功')
    router.replace('/main')
  }
}

// 登录/注册成功回调
const onAuthSuccess = (payload) => {
  if (payload?.from === 'register') {
    isLogin.value = true
  } else {
    showAuthDialog.value = false
  }
}
</script>

<style scoped>
/* === TopNav === */
.top-nav {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 32px;
  border-bottom: 1px solid #eee;
  background: #fff;
  color: #1e1e2f;
}

.nav-left {
  width: 160px;
}

.logo {
  height: 36px;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: space-around;
}

.menu-item {
  cursor: pointer;
  font-weight: 500;
}

.nav-right {
  width: 160px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.login-btn {
  cursor: pointer;
  color: #1677ff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
}

.logout-btn {
  margin-left: 4px;
  padding: 2px 8px;
  font-size: 13px;
}

/* === 悬浮窗 === */
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
  width: 660px;
  padding: 24px;
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  position: relative;
  margin-bottom: 16px;
}

.close {
  position: absolute;
  right: 0;
  cursor: pointer;
  font-size: 28px;
  color: #999;
}

.close:hover {
  color: #333;
}

.modal-body {
  display: flex;
  justify-content: center;
}

.switch-link {
  text-align: right;
  margin-top: 16px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}

.switch-link span:hover {
  color: #1677ff;
}

/* 表单切换动画 */
.form-switch-enter-active,
.form-switch-leave-active {
  transition: all 0.25s ease;
}

.form-switch-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.form-switch-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.form-switch-leave-from {
  opacity: 1;
}

.form-switch-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 简单 toast */
.toast {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  z-index: 1000;
}
</style>
