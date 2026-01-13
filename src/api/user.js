import request from '@/utils/request'

// ================= 用户相关 =================
// 注册
export function registerUser(data) {
    return request.post('/user/create', data)
}

// 登录
export function loginUser(data) {
    return request.post('/user/login', data)
}
