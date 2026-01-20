<template>
  <div class="layout-card">

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

    <div class="form-footer">
      <StandardButton @click="submit">登录</StandardButton>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { showToast } from '@nutui/nutui'
import StandardButton from '@/components/button/StandardButton.vue'
import { loginUser } from '@/api/user'
import { useUserStore } from '@/stores/userStore'

const emit = defineEmits(['success'])
const userStore = useUserStore()

const form = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

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

const validatePassword = () => {
  if (!form.password) {
    errors.password = '密码不能为空'
    return false
  }
  errors.password = ''
  return true
}

let isSubmitting = false
const submit = async () => {
  if (isSubmitting) return
  if (![validateEmail(), validatePassword()].every(v => v)) {
    showToast.fail('请检查表单')
    return
  }

  isSubmitting = true
  try {
    const res = await loginUser(form) // res 已经是 { token, user }
    console.log('res =', res)

    userStore.login(res)   // ✅ 直接传 res 就行
    showToast.success('登录成功')
    emit('success')

  } catch (err) {
    console.error(err)
    showToast.fail(err.response?.data?.message || '网络异常')
  } finally {
    isSubmitting = false
  }
}

</script>

<style scoped>
.layout-card {
  width: 480px; /* PC端加宽 */
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
}
.input-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
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
}
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}
</style>
