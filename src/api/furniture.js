import request from '@/utils/request'

/**
 * 获取布局详情
 */
export function getUserFurnitureLayoutById(layoutId) {
    return request.get(`/house-layout/user/furniture/${layoutId}`)
}

export function getDesignerFurnitureLayoutById(layoutId) {
    return request.get(`/house-layout/designer/furniture/${layoutId}`)
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
 * 创建房间
 */
export function createRoom(data) {
    return request.post('/room/create', data)
}

/**
 * 获取房间详情
 */
export function getRoomById(roomId) {
    return request.get(`/room/${roomId}/get`)
}

/**
 * 更新房间信息
 */
export function updateRoom(roomId, data) {
    return request.put(`/room/${roomId}/update`, data)
}

/**
 * 删除房间
 */
export function deleteRoom(roomId) {
    return request.delete(`/room/${roomId}`)
}


/**
 * 获取布局下的所有房间
 */
export function getRoomsByLayout(layoutId) {
    return request.get(`/room/${layoutId}/get-all`)
}

/**
 * 创建家具方案
 */
/**
 * 创建家具方案
 */
export function createFurnitureScheme(roomId, file, schemeData) {
    const formData = new FormData();
    formData.append('file', file);

    // 添加方案数据
    Object.keys(schemeData).forEach(key => {
        if (schemeData[key] !== null && schemeData[key] !== undefined) {
            formData.append(key, schemeData[key]);
        }
    });

    return request.post(`/furniture-scheme/room/${roomId}/create`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}


/**
 * 更新方案图片
 */
export function updateSchemeImage(schemeId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return request.post(`/furniture-scheme/${schemeId}/update-image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

/**
 * 获取方案详情
 */
export function getFurnitureSchemeById(schemeId) {
    return request.get(`/furniture-scheme/${schemeId}/get`)
}

/**
 * 删除家具方案
 */
export function deleteFurnitureScheme(schemeId) {
    return request.delete(`/furniture-scheme/${schemeId}`)
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
