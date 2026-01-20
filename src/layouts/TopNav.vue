<template>
  <header class="top-nav">
    <div class="nav-left">
      <img src="../assets/logo.jpg" class="logo" />
    </div>

    <nav class="nav-center">
      <div class="menu-item" @click="goPage('/')">首页</div>
      <div class="menu-item" @click="goPage('/houses')">我的房屋</div>
      <div class="menu-item" @click="goPage('/profile')">个人信息</div>
      <div class="menu-item" @click="goPage('/contact')">联系</div>
    </nav>

    <div class="nav-right">
      <template v-if="!userStore.token">
        <span class="login-btn" @click="openLogin">登录</span>
      </template>
      <template v-else>
        <div class="user-info">
          <!-- 显示存储在 Pinia 的头像 -->
          <img
              v-if="userStore.user.avatarFile"
              :src="avatarUrl"
              class="avatar"
          />
          <span class="user-name">{{ userStore.user.userName }}</span>
        </div>
        <nut-button type="primary" size="small" class="logout-btn" @click="logout">退出</nut-button>
      </template>
    </div>
  </header>

  <!-- 自制悬浮窗 -->
  <div v-if="showDialog" class="overlay" @click.self="showDialog=false">
    <div class="modal">
      <div class="modal-header">
        <span>{{ isLogin ? '登录' : '注册' }}</span>
        <span class="close" @click="showDialog=false">×</span>
      </div>

      <div class="modal-body">
        <Transition name="form-switch" mode="out-in">
          <LoginForm
              v-if="isLogin"
              key="login"
              @success="onSuccess"
          />
          <RegisterForm
              v-else
              key="register"
              @success="onSuccess"
          />
        </Transition>
      </div>

      <div class="switch-link">
        <span v-if="isLogin" @click="isLogin=false">没有账号？去注册</span>
        <span v-else @click="isLogin=true">已有账号？去登录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import LoginForm from '@/components/login/LoginForm.vue';
import RegisterForm from '@/components/register/RegisterForm.vue';
import { showToast } from '@nutui/nutui';
import router from '@/router';

const userStore = useUserStore();
const showDialog = ref(false);
const isLogin = ref(true);

const openLogin = () => { showDialog.value = true; isLogin.value = true };

// 登出
const logout = () => {
  userStore.logout();
  showDialog.value = false;
  router.push('/');
};

// 页面跳转处理，首页不限，其他页面未登录提示
const goPage = (path) => {
  if (path === '/') {
    router.push(path);
    return;
  }

  if (!userStore.token) {
    showToast.warn('未登录,请登陆后再次尝试');
    return;
  }

  router.push(path);
};

// 登录 / 注册成功回调
const onSuccess = (payload) => {
  if (payload?.from === 'register') {
    isLogin.value = true;
  } else {
    showDialog.value = false;
  }
};

// 获取头像的临时URL
const avatarUrl = computed(() => {
  if (userStore.user.avatarFile) {
    return URL.createObjectURL(userStore.user.avatarFile);
  }
  return '';
});
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
.nav-left { width: 160px; }
.logo { height: 36px; }
.nav-center { flex: 1; display: flex; justify-content: space-around; }
.menu-item { cursor: pointer; font-weight: 500; }
.nav-right { width: 160px; text-align: right; display: flex; align-items: center; justify-content: flex-end; }
.login-btn { cursor: pointer; color: #1677ff; }
.user-info { display: flex; align-items: center; gap: 8px; margin-right: 8px; }
.avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.user-name { font-weight: 500; }
.logout-btn { margin-left: 4px; padding: 2px 8px; font-size: 13px; }

/* === 自制悬浮窗 === */
.overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
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
  overflow: visible;
  transition: width 0.25s ease;
}

.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  font-weight: bold;
  position: relative;
  margin-bottom: 16px;
}

.close {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 28px;
  color: #999;
  transition: color 0.2s;
}

.close:hover { color: #333; }

.modal-body { display: flex; justify-content: center; }
.switch-link { text-align: right; margin-top: 16px; font-size: 13px; color: #666; cursor: pointer; }
.switch-link span:hover { color: #1677ff; }

/* 表单切换动画 */
.form-switch-enter-active,
.form-switch-leave-active { transition: all 0.25s ease; }
.form-switch-enter-from { opacity: 0; transform: translateY(10px); }
.form-switch-enter-to { opacity: 1; transform: translateY(0); }
.form-switch-leave-from { opacity: 1; transform: translateY(0); }
.form-switch-leave-to { opacity: 0; transform: translateY(-10px); }
</style>
