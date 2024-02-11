import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/login.vue')
    },
    {
        path: '/',
        name: 'favorites',
        component: () => {
            return import('../views/favorites.vue');
        }
    },
    {
        path: '/track/:id',
        name: 'track',
        component: () => {
            return import('../views/track-player.vue');
        }
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
