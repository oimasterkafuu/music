import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/',
        name: 'favorites',
        component: () => {
            return import('../views/Favorites.vue');
        }
    },
    {
        path: '/track/:id',
        name: 'track',
        component: () => {
            return import('../views/TrackPlayer.vue');
        }
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

export default router;
