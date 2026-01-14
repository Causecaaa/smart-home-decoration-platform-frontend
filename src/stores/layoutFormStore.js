import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { createLayout, uploadLayoutImage } from '@/api/layout'

export const useLayoutFormStore = defineStore('layoutForm', () => {
    const form = reactive({
        houseId: null,
        layoutIntent: 'KEEP_ORIGINAL', // 默认保留现有户型
        redesignNotes: '',
        images: [], // 每个 { file, url, key }
        designerId: ''
    })

    const errors = reactive({
        layoutIntent: '',
        designerId: ''
    })

    const resetForm = () => {
        form.houseId = null
        form.layoutIntent = 'KEEP_ORIGINAL'
        form.redesignNotes = ''
        form.images = []
        form.designerId = ''
        errors.layoutIntent = ''
        errors.designerId = ''
    }

    /**
     * 提交 KEEP_ORIGINAL 布局
     * 1️⃣ 创建 layout
     * 2️⃣ 上传 images（可选）
     */
    const submitKeepOriginal = async () => {
        try {
            console.log('start submitKeepOriginal')

            const layoutData = {
                houseId: form.houseId,
                layoutIntent: form.layoutIntent,
                redesignNotes: form.redesignNotes || null
            }

            const res = await createLayout(layoutData)
            console.log('createLayout 返回', res)  // ✅ res 就是 data

            const layoutId = res.layoutId           // ✅ 直接用 layoutId
            console.log('layoutId', layoutId)

            // 上传图片
            for (const img of form.images) {
                await uploadLayoutImage(layoutId, {
                    file: img.file,
                    imageDesc: '',
                    imageType: 'STRUCTURE'
                })
            }

            return layoutId
        } catch (err) {
            console.error('提交 KEEP_ORIGINAL layout 出错', err)
            throw err
        }
    }



    return {
        form,
        errors,
        resetForm,
        submitKeepOriginal
    }
})
