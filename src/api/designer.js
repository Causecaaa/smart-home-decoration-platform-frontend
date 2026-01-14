import request from '@/utils/request'

export function getDesignerList(params = {}) {
    return request({
        url: '/designer/list',
        method: 'get',
        params
    })
}
