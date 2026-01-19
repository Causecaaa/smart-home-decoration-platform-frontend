import request from '@/utils/request'

/**
 * 获取布局详情
 */
export function getFurnitureLayoutById(layoutId) {
    return request.get(`/house-layout/furniture/${layoutId}`)
}

/**
 * 分配家具设计师
 */
export function assignFurnitureDesigner(layoutId, designerId) {
    return request.put(`/house-layout/${layoutId}/confirm/furnitureDesigner`, {
        furnitureDesignerId: designerId
    })
}

/**
 * 获取布局下的所有房间
 */
export function getRoomsByLayout(layoutId) {
    return request.get(`/room/${layoutId}/get-all`)
}

/**
 * 获取房间的所有方案
 */
export function getSchemesByRoom(roomId) {
    return request.get(`/furniture-scheme/${roomId}/get-all`)
}

/**
 * 确认家具方案
 * @param {number} schemeId - 方案ID
 * @returns {Promise} 确认后的方案数据
 */
export function confirmFurnitureScheme(schemeId) {
    return request.put(`/furniture-scheme/${schemeId}/confirm`)
}
