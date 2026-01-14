import {defineStore} from "pinia";

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
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },
        initFromStorage() {
            const token = localStorage.getItem('token')
            const user = localStorage.getItem('user')
            if (token) this.token = token
            if (user) this.user = JSON.parse(user)
        },
    },
})
