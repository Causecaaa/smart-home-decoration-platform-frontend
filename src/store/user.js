import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        user: {
            userName: '',
            role: '',
            avatar_url: '',
        },
    }),
    actions: {
        login(data) {
            this.token = data.token
            this.user = data.user
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))
        },
        logout() {
            // 清空 Pinia 状态
            this.token = ''
            this.user = { userName:'', role:'', avatar_url:'' }

            // 只清理登录信息
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        }
    }
})

