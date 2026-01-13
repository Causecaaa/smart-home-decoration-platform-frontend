import request from '@/utils/request'

// 获取当前登录用户的房屋列表
export function getHousesByUser() {
    const token = localStorage.getItem('token')
    return request.get('/house/get-all', {
        headers: { Authorization: `Bearer ${token}` }
    })
}

// 获取单个房屋信息
export function getHouseById(houseId) {
    const token = localStorage.getItem('token')
    return request.get(`/house/${houseId}/find`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

// 新增房屋
export function createHouse(data) {
    const token = localStorage.getItem('token')
    return request.post('/house/create-house', data, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

// 更新房屋
export function updateHouse(houseId, data) {
    const token = localStorage.getItem('token')
    return request.put(`/house/${houseId}/update`, data, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

// 删除房屋
export function deleteHouse(houseId) {
    const token = localStorage.getItem('token')
    return request.delete(`/house/${houseId}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}
