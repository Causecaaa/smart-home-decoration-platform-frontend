import { defineStore } from 'pinia'
import { reactive } from 'vue'

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



    return {
        form,
        errors,
        resetForm
    }
})
