
import {createRouter, createWebHistory} from "vue-router";

export const routes = [
    {
        path: '/',
        redirect: '/main'
    },
    {
        path: '/main',
        component: () => import('@/views/main/mainView.vue')
    },
    {
        path: '/houses',
        component: () => import('@/views/house/HouseView.vue')
    },
]

export default createRouter({
    history: createWebHistory(),
    routes
})