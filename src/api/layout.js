import request from '@/utils/request'

/**
 * REDESIGN：创建布局草稿（选择设计师）
 */
export function createLayoutDraft(data) {
    const token = localStorage.getItem('token')
    return request.post('/house-layout/create-draft', data, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

/**
 * KEEP_ORIGINAL：创建布局（直接确认）
 */
export function createLayout(data) {
    const token = localStorage.getItem('token')
    return request.post('/house-layout/create-layout', data, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

/**
 * 根据房屋 ID 获取所有布局方案
 */
export function getLayoutsByHouse(houseId) {
    const token = localStorage.getItem('token')
    return request.get(`/house-layout/${houseId}/get-all`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

/**
 * 获取布局详情
 */
export function getLayoutDetail(layoutId) {
    const token = localStorage.getItem('token')
    return request.get(`/house-layout/get/${layoutId}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

/**
 * 更新布局信息（说明 / 需求等）
 */
export function updateLayout(layoutId, data) {
    const token = localStorage.getItem('token')
    return request.put(`/house-layout/update/${layoutId}`, data, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

/**
 * 删除布局
 */
export function deleteLayout(layoutId) {
    const token = localStorage.getItem('token')
    return request.delete(`/house-layout/delete/${layoutId}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

/**
 * 用户确认布局方案
 */
export function confirmLayoutRequest(layoutId) {
    const token = localStorage.getItem('token')
    return request.put(`/house-layout/${layoutId}/confirm`, null, {
        headers: { Authorization: `Bearer ${token}` }
    })
}

/**
 * 确认家具设计师
 */
export function confirmFurnitureDesigner(layoutId, furnitureDesignerId) {
    const token = localStorage.getItem('token')
    return request.put(
        `/house-layout/${layoutId}/confirm/furnitureDesigner`,
        { furnitureDesignerId },
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    )
}
