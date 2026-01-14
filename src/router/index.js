// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { showToast } from '@nutui/nutui'

const routes = [
    { path: '/', redirect: '/main' },
    { path: '/main', component: () => import('@/views/main/mainView.vue') },
    {
        path: '/houses',
        component: () => import('@/views/house/HouseView.vue'),
        meta: { requiresAuth: true },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    if (to.meta.requiresAuth && !userStore.token) {
        showToast.warn('未登录，请先登录')
        next('/main')
        return
    }

    next()
})

export default router
