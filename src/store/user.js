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
        initFromStorage() {
            const token = localStorage.getItem('token')
            if (token) {
                this.token = token
            }
        },
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
    }
})
