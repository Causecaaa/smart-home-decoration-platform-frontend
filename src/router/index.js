// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from '@nutui/nutui'

const routes = [
    { path: '/', redirect: '/main' },
    { path: '/main', component: () => import('@/views/main/mainView.vue') },
    {
        path: '/houses',
        component: () => import('@/views/step1/house/HouseView.vue'),
        meta: { requiresAuth: true },
    },
    { path: '/test', component: () => import('@/views/testView.vue') },
    {
        path: '/layout/:houseId',
        component: () => import('@/views/step1/layout/LayoutView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/furniture/:layoutId',
        component: () => import('@/views/step1/furniture/FurnitureView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/profile',
        component: () => import('@/views/profile/ProfileView.vue'),
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
