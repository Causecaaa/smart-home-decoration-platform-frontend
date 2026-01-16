import { defineStore } from "pinia";

export const useUserStore = defineStore('user', {
    state: () => ({
        token: '',
        user: {
            userName: '',
            role: '',
            avatarFile: null,  // 存储头像文件
        },
    }),
    actions: {
        login(data) {
            this.token = data.token;
            this.user = { ...data.user, avatarFile: this.user.avatarFile }; // 保持用户信息的完整性
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // 假设头像是通过URL下载得到的
            if (data.user.avatar_url) {
                const avatarUrl = 'http://localhost:8181' + data.user.avatar_url;
                this.downloadAvatar(avatarUrl); // 下载头像文件
            }
        },
        logout() {
            this.token = '';
            this.user = { userName: '', role: '', avatarFile: null };
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        initFromStorage() {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            if (token) this.token = token;
            if (user) this.user = JSON.parse(user);
        },
        // 下载头像文件并存储
        async downloadAvatar(url) {
            try {
                const res = await fetch(url);
                const blob = await res.blob();
                const file = new File([blob], "avatar.jpg", { type: blob.type });
                this.user.avatarFile = file;  // 存储头像文件
            } catch (error) {
                console.error("头像下载失败", error);
            }
        },
    },
});
