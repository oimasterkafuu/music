import { createApp } from 'vue';

import App from './app.vue';
import router from './router';

import './assets/style.css';

const app = createApp(App);
app.use(router);

const isVueDevMode = import.meta.env.MODE === 'development';
if (isVueDevMode) {
    console.log('Hello, oimasterkafuu!');
    if (import.meta.hot) {
        import.meta.hot.on('vite:beforeUpdate', () => console.clear());
    }
} else {
    console.log('Production mode detected.');
    console.log('Ni hao! This is oimasterkafuu.');
    console.log('If the app is not working, please copy the error log and send it to me.');
    console.log('-> https://github.com/oimasterkafuu/music/issues');
    console.log('Have a nice day ;)');

    console.log = () => {};
}

app.mount('#app');
