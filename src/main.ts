import { createApp } from 'vue';
import router from './router';
import store from './store';
import './assets/tailwind.css';
import App from './App.vue';
import ArcoVue from '@arco-design/web-vue';
import '@arco-design/web-vue/dist/arco.css';
import { Message } from '@arco-design/web-vue';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(ArcoVue);

app.mount('#app');

// 必须在 mount 之后设置，确保 app._context 已完整初始化
Message._context = app._context;
