import axios from 'axios'
import { useUserStore } from '@/stores/user'

const request = axios.create({
    baseURL: 'http://localhost:8181', // 改成你的后端地址
    timeout: 10000
})

// 请求拦截器：自动带 token
request.interceptors.request.use(config => {
    const userStore = useUserStore()
    if (userStore.token) {
        config.headers.Authorization = `Bearer ${userStore.token}` // 必须加 Bearer
    }
    return config
})


// 响应拦截器：统一拆 ApiResponse
request.interceptors.response.use(
    res => {
        const { code, data, message } = res.data
        if (code !== 200) {
            return Promise.reject(message)
        }
        return data
    },
    err => Promise.reject(err)
)

export default request
