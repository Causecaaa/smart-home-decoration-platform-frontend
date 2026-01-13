<template>
  <div class="register-card">

    <!-- 邮箱 -->
    <div class="input-row">
      <span class="label">邮箱</span>
      <div class="input-col">
        <nut-input
            v-model="form.email"
            placeholder="请输入邮箱"
            clearable
            @blur="validateEmail"
        />
        <div v-if="errors.email" class="error-text">× {{ errors.email }}</div>
      </div>
    </div>

    <!-- 密码 -->
    <div class="input-row">
      <span class="label">密码</span>
      <div class="input-col">
        <nut-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            clearable
            @blur="validatePassword"
        />
        <div v-if="errors.password" class="error-text">× {{ errors.password }}</div>
      </div>
    </div>

    <!-- 确认密码 -->
    <div class="input-row">
      <span class="label">确认密码</span>
      <div class="input-col">
        <nut-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            clearable
            @blur="validateConfirmPassword"
        />
        <div v-if="errors.confirmPassword" class="error-text">× {{ errors.confirmPassword }}</div>
      </div>
    </div>

    <!-- 用户名 -->
    <div class="input-row">
      <span class="label">用户名</span>
      <div class="input-col">
        <nut-input
            v-model="form.username"
            placeholder="请输入用户名"
            clearable
            @blur="validateUsername"
        />
        <div v-if="errors.username" class="error-text">× {{ errors.username }}</div>
      </div>
    </div>

    <!-- 手机 -->
    <div class="input-row">
      <span class="label">手机号</span>
      <div class="input-col">
        <nut-input
            v-model="form.phone"
            placeholder="请输入手机号"
            clearable
            @blur="validatePhone"
        />
        <div v-if="errors.phone" class="error-text">× {{ errors.phone }}</div>
      </div>
    </div>



    <StandardButton @click="submit">注册</StandardButton>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { showToast } from '@nutui/nutui'
import StandardButton from '@/components/button/StandardButton.vue'
import { registerUser } from '@/api/user'

const emit = defineEmits(['success'])

const form = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// ==== 验证函数 ====
const validateUsername = () => {
  if (!form.username) {
    errors.username = '用户名不能为空'
    return false
  } else if (form.username.length < 5 || form.username.length > 50) {
    errors.username = '长度应在5-50个字符'
    return false
  }
  errors.username = ''
  return true
}

const validateEmail = () => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email) {
    errors.email = '邮箱不能为空'
    return false
  } else if (!re.test(form.email)) {
    errors.email = '邮箱格式不正确'
    return false
  }
  errors.email = ''
  return true
}

const validatePhone = () => {
  if (!form.phone) {
    errors.phone = '手机号不能为空'
    return false
  } else if (form.phone.length < 10 || form.phone.length > 20) {
    errors.phone = '电话长度应在10-20字符'
    return false
  }
  errors.phone = ''
  return true
}

const validatePassword = () => {
  const re = /^(?=.*[A-Za-z])(?=.*[0-9!@#$%^&*()_+\-=]).+$/
  if (!form.password) {
    errors.password = '密码不能为空'
    return false
  } else if (form.password.length < 8) {
    errors.password = '密码长度至少8位'
    return false
  } else if (!re.test(form.password)) {
    errors.password = '密码必须包含字母和数字'
    return false
  }
  errors.password = ''
  return true
}

const validateConfirmPassword = () => {
  if (!form.confirmPassword) {
    errors.confirmPassword = '请再次输入密码'
    return false
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = '两次输入不一致'
    return false
  }
  errors.confirmPassword = ''
  return true
}

// ==== 提交 ====
const submit = async () => {
  const valid = [
    validateUsername(),
    validateEmail(),
    validatePhone(),
    validatePassword(),
    validateConfirmPassword()
  ].every(v => v)

  if (!valid) {
    showToast.fail('请检查表单')
    return
  }

  try {
    await registerUser(form)
    showToast.success('注册成功')
    emit('success', { from: 'register' })
  } catch (err) {
    const msg = err.response?.data?.message || '注册失败'
    showToast.fail(msg)
  }
}
</script>

<style scoped>
.register-card {
  width: 100%;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
}
.input-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 8px;
  align-items: start;
}
.label {
  font-weight: bold;
  white-space: nowrap;
  padding-top: 6px;
}
.input-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.error-text {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
}
</style>
