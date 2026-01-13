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
            this.token = ''
            this.user = { userName:'', role:'', avatar_url:'' }
            localStorage.clear()
        },
        loadFromStorage() {
            this.token = localStorage.getItem('token') || ''
            const userStr = localStorage.getItem('user')
            this.user = userStr ? JSON.parse(userStr) : { userName:'', role:'', avatar_url:'' }
        }
    }
})
