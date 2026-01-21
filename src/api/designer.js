// src/api/designer.js
import request from '@/utils/request'

// 获取设计师列表
export function getDesignerList(params = {}) {
    return request({
        url: '/designer/list',
        method: 'get',
        params
    })
}

// 获取设计师布局信息
export function getDesignerForLayout(designerId) {
    return request({
        url: `/designer/${designerId}/layout`,
        method: 'get'
    })
}

// 申请成为设计师
export function applyDesigner(data) {
    return request({
        url: '/designer/apply',
        method: 'post',
        data
    })
}

// 获取当前登录设计师信息
export function getMyDesignerInfo() {
    return request({
        url: '/designer/get',
        method: 'get'
    })
}

// 更新设计师个人信息
export function updateDesignerProfile(data) {
    return request({
        url: '/designer/update',
        method: 'put',
        data
    })
}

// 根据设计师ID获取信息
export function getDesignerById(designerId) {
    return request({
        url: `/designer/${designerId}/get`,
        method: 'get'
    })
}

// 获取设计师待处理的布局任务
export function getPendingLayouts() {
    return request({
        url: '/designer/layouts',
        method: 'get'
    })
}

// 获取设计师待处理的家具布局任务
export function getPendingFurnitureLayouts() {
    return request({
        url: '/designer/furniture/layouts',
        method: 'get'
    })
}
