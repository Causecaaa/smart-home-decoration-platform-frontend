import { createRouter, createWebHistory } from 'vue-router'

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
    console.log('🛡 beforeEach:', from.fullPath, '->', to.fullPath)
    next()
})

export default router
