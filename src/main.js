import { createApp } from 'vue';

const isVueDevMode = import.meta.env.MODE === 'development';
if (isVueDevMode) {
    localStorage.setItem('debug', 'leancloud*');
}

console.log('isVueDevMode', isVueDevMode);

import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
