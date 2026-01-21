// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
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
        path: '/designer/layout/:houseId',
        name: 'DesignerLayout',
        component: () => import('@/views/designer/DesignerLayoutView.vue'),
        meta: { requiresAuth: true, role: 'DESIGNER' }
    },
    {
        path: '/designer/furniture/:layoutId',
        name: 'DesignerFurniture',
        component: () => import('@/views/designer/DesignerFurnitureView.vue'),
        meta: { requiresAuth: true, role: 'DESIGNER' }
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
    {
        path: '/contact',
        component: () => import('@/views/contact/ContactView.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/design',
        component: () => import('@/views/designer/DesignerView.vue'),
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
