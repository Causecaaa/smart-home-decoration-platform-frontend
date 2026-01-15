import request from '@/utils/request'

export function getDesignerList(params = {}) {
    return request({
        url: '/designer/list',
        method: 'get',
        params
    })
}

export function getDesignerForLayout(designerId) {
    return request({
        url: `/designer/${designerId}/layout`,
        method: 'get'
    })
}
