import { defineStore } from "pinia";

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        user: {
            userId: 0,
            userName: '',
            email: '',
            phone: '',
            role: '',
            status: '',
            avatar_url: '',
            createdAt: '',
            updatedAt: '',
            avatarFile: null
        },
    }),
    actions: {
        login(data) {
            this.token = data.token;

            // 保存完整用户信息，同时保留原有的 avatarFile
            this.user = {
                ...data.user,
                avatarFile: this.user.avatarFile
            };

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(this.user));

            // 下载头像文件
            if (data.user.avatar_url) {
                const avatarUrl = 'http://localhost:8181' + data.user.avatar_url;
                this.downloadAvatar(avatarUrl);
            }
        },
        logout() {
            this.token = '';
            this.user = {
                userId: 0,
                userName: '',
                email: '',
                phone: '',
                role: '',
                status: '',
                avatar_url: '',
                createdAt: '',
                updatedAt: '',
                avatarFile: null
            };
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        initFromStorage() {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');

            if (token) this.token = token;
            if (user) this.user = JSON.parse(user);
        },
        async downloadAvatar(url) {
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                const file = new File([blob], "avatar.jpg", { type: blob.type });
                this.user.avatarFile = file;
            } catch (error) {
                console.error("头像下载失败", error);
            }
        },
        // 更新用户信息
        updateUserInfo(userInfo) {
            this.user = { ...this.user, ...userInfo };
            localStorage.setItem('user', JSON.stringify(this.user));
        }
    },
});
