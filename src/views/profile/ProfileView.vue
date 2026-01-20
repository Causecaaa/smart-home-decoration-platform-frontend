<script setup>
import {ref, onMounted, computed} from 'vue';
import TopNav from "@/layouts/TopNav.vue";
import { useUserStore } from '@/stores/userStore';
import { getCurrentUserInfo, uploadUserAvatar, updateUserProfile, changeUserPassword } from '@/api/user';

const userStore = useUserStore();
const userInfo = ref(null);
const loading = ref(true);
const editMode = ref(false);
const tempUserInfo = ref({});
const showPasswordModal = ref(false);
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});
const confirmPasswordError = ref('');

const initializePage = async () => {
  try {
    // 获取当前用户信息
    const userData = await getCurrentUserInfo();
    userInfo.value = userData;

    // 同步到用户store
    userStore.user.userName = userData.userName;
    userStore.user.role = userData.role;

    // 如果有头像URL，尝试下载头像文件
    if (userData.avatar_url) {
      await userStore.downloadAvatar('http://localhost:8181' + userData.avatar_url);
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
  } finally {
    loading.value = false;
  }
};

const startEdit = () => {
  // 复制当前用户信息到临时对象
  tempUserInfo.value = { ...userInfo.value };
  editMode.value = true;
};

const cancelEdit = () => {
  editMode.value = false;
  tempUserInfo.value = {};
};

const saveChanges = async () => {
  try {
    // 确保 tempUserInfo.value 不为空
    if (!tempUserInfo.value) {
      console.error('临时用户信息为空');
      return;
    }

    // 更新用户资料
    await updateUserProfile(tempUserInfo.value);

    // 更新本地用户信息
    Object.assign(userInfo.value, tempUserInfo.value);

    editMode.value = false;
    alert('资料更新成功');
  } catch (error) {
    console.error('更新用户资料失败:', error);
    alert('更新失败，请重试');
  }
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append('file', file);

    // 上传头像
    const response = await uploadUserAvatar(formData);

    // 更新用户信息和store
    userInfo.value.avatar_url = response.avatar_url;
    userStore.user.avatarFile = file;

    alert('头像上传成功');
  } catch (error) {
    console.error('上传头像失败:', error);
    alert('上传失败，请重试');
  }
};

// 密码确认验证
const validateConfirmPassword = () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmNewPassword) {
    confirmPasswordError.value = '两次输入的密码不一致';
    return false;
  }
  confirmPasswordError.value = '';
  return true;
};

// 检查表单是否有效
const isPasswordFormValid = computed(() => {
  return passwordForm.value.oldPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmNewPassword &&
         passwordForm.value.newPassword === passwordForm.value.confirmNewPassword &&
         !confirmPasswordError.value;
});

// 处理密码修改
const handleChangePassword = async () => {
  if (!validateConfirmPassword()) return;

  try {
    await changeUserPassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    });

    alert('密码修改成功');
    closePasswordModal();
  } catch (error) {
    console.error('密码修改失败:', error);
    alert('密码修改失败，请检查原密码是否正确');
  }
};

// 打开/关闭密码修改模态框
const openPasswordModal = () => {
  showPasswordModal.value = true;
  // 重置表单
  passwordForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };
  confirmPasswordError.value = '';
};

const closePasswordModal = () => {
  showPasswordModal.value = false;
  confirmPasswordError.value = '';
};

onMounted(() => {
  initializePage();
});
</script>

<template>
  <TopNav class="top-nav" />

  <div class="profile-container">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="profile-content">
      <div class="profile-card">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <img
              v-if="userInfo && userInfo.avatar_url"
              :src="`http://localhost:8181${userInfo.avatar_url}`"
              alt="头像"
              class="avatar-img"
            >
            <div v-else class="default-avatar">头像</div>

            <label v-if="editMode" for="avatar-upload" class="upload-label">
              更换头像
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              @change="handleAvatarUpload"
              class="hidden-input"
            >
          </div>
        </div>

        <div class="info-section">

          <div class="info-item">
            <span class="label">邮箱:</span>
            <span v-if="!editMode" class="value">{{ userInfo.email }}</span>
            <input
              v-else
              v-model="tempUserInfo.email"
              class="edit-input"
              disabled
            >
          </div>

          <div class="info-item">
            <span class="label">用户名:</span>
            <span v-if="!editMode" class="value">{{ userInfo.userName }}</span>
            <input
                v-else
                v-model="tempUserInfo.userName"
                class="edit-input"
            >
          </div>
          <div class="info-item">
            <span class="label">电话:</span>
            <span v-if="!editMode" class="value">{{ userInfo.phone }}</span>
            <input
              v-else
              v-model="tempUserInfo.phone"
              class="edit-input"
            >
          </div>

          <div class="info-item">
            <span class="label">角色:</span>
            <span class="value">{{ userInfo.role }}</span>
          </div>

          <div class="info-item">
            <span class="label">状态:</span>
            <span class="value">{{ userInfo.status === 'ACTIVE' ? '活跃' : '非活跃' }}</span>
          </div>

          <div class="info-item">
            <span class="label">注册时间:</span>
            <span class="value">{{ new Date(userInfo.createdAt).toLocaleString() }}</span>
          </div>

          <div class="info-item">
            <span class="label">最后更新:</span>
            <span class="value">{{ new Date(userInfo.updatedAt).toLocaleString() }}</span>
          </div>
        </div>

        <div class="action-buttons">
          <button v-if="!editMode" @click="startEdit" class="edit-btn">
            编辑资料
          </button>
          <button v-if="!editMode" @click="openPasswordModal" class="password-btn">
            修改密码
          </button>
          <div v-else class="edit-controls">
            <button @click="saveChanges" class="save-btn">
              保存
            </button>
            <button @click="cancelEdit" class="cancel-btn">
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 密码修改模态框 -->
  <div v-if="showPasswordModal" class="password-modal">
    <div class="modal-content">
      <h3>修改密码</h3>
      <form @submit.prevent="handleChangePassword">
        <div class="form-group">
          <label>原密码:</label>
          <input
            v-model="passwordForm.oldPassword"
            type="password"
            required
          >
        </div>
        <div class="form-group">
          <label>新密码:</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            required
            minlength="8"
          >
        </div>
        <div class="form-group">
          <label>确认新密码:</label>
          <input
            v-model="passwordForm.confirmNewPassword"
            type="password"
            required
            @blur="validateConfirmPassword"
          >
          <span v-if="confirmPasswordError" class="error-msg">
            {{ confirmPasswordError }}
          </span>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="!isPasswordFormValid">修改密码</button>
          <button type="button" @click="closePasswordModal">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.profile-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.avatar-section {
  text-align: center;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e0e0e0;
}

.default-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}

.upload-label {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #409eff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transform: translate(20%, 20%);
}

.hidden-input {
  display: none;
}

.info-section {
  width: 100%;
  max-width: 400px;
}

.info-item {
  display: flex;
  margin-bottom: 16px;
  align-items: center;
}

.label {
  width: 100px;
  font-weight: bold;
  color: #333;
}

.value {
  flex: 1;
  color: #666;
}

.edit-input {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.edit-input[disabled] {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.action-buttons {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.edit-btn, .password-btn, .save-btn, .cancel-btn {
  padding: 8px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 0 8px;
}

.edit-btn {
  background: #409eff;
  color: white;
}

.edit-btn:hover {
  background: #66b1ff;
}

.password-btn {
  background: #e6a23c;
  color: white;
}

.password-btn:hover {
  background: #ebb563;
}

.save-btn {
  background: #67c23a;
  color: white;
}

.save-btn:hover {
  background: #85ce61;
}

.cancel-btn {
  background: #909399;
  color: white;
}

.cancel-btn:hover {
  background: #b1b3b8;
}

.edit-controls {
  display: flex;
  justify-content: center;
}

.password-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.error-msg {
  color: red;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
</style>
