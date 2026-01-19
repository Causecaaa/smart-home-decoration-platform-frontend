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

// 获取当前用户信息
export function getCurrentUserInfo() {
    return request.get('/user/userInfo')
}

// 上传头像
export function uploadUserAvatar(formData) {
    return request.post('/user/upload-avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 更新用户资料
export function updateUserProfile(data) {
    return request.put('/user/update-profile', data)
}

export function changeUserPassword(data) {
    return request.put('/user/change-password', data)
}
