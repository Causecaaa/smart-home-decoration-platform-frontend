import request from '@/utils/request'

/**
 * 上传布局图片
 * 支持：
 * 1️⃣ 本地文件上传
 * 2️⃣ 直接传 imageUrl
 */
export function uploadLayoutImage(layoutId, options = {}) {
    const token = localStorage.getItem('token')
    const formData = new FormData()

    if (options.file) {
        formData.append('file', options.file)
    }

    if (options.imageType) {
        formData.append('imageType', options.imageType)
    }

    if (options.imageDesc) {
        formData.append('imageDesc', options.imageDesc)
    }

    if (options.imageUrl) {
        formData.append('imageUrl', options.imageUrl)
    }

    return request.post(
        `/house-layout-image/${layoutId}/create`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    )
}

/**
 * 获取某个 layout 下的所有图片
 */
export function getLayoutImages(layoutId) {
    const token = localStorage.getItem('token')
    return request.get(
        `/house-layout-image/${layoutId}/get`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    )
}

/**
 * 删除图片
 */
export function deleteLayoutImage(imageId) {
    const token = localStorage.getItem('token')
    return request.delete(
        `/house-layout-image/${imageId}/delete`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    )
}

/**
 * 更新图片信息（描述 / 类型）
 */
export function updateLayoutImage(imageId, data) {
    const token = localStorage.getItem('token')
    return request.put(
        `/house-layout-image/${imageId}/update`,
        data,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    )
}
