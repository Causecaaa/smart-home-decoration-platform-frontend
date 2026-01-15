// store
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useLayoutImageStore = defineStore('layoutImage', () => {
    const images = reactive({}) // 一定是对象，不是 null

    const setImages = (layoutId, list) => {
        if (!layoutId) return
        images[layoutId] = list || []
    }

    const addImage = (layoutId, fileObj) => {
        if (!layoutId) return
        if (!images[layoutId]) images[layoutId] = []
        images[layoutId].push(fileObj)
    }

    const removeImage = (layoutId, keyOrId) => {
        if (!layoutId || !images[layoutId]) return
        images[layoutId] = images[layoutId].filter(i => i && i.key !== keyOrId && i.id !== keyOrId)
    }

    return { images, setImages, addImage, removeImage }
})
