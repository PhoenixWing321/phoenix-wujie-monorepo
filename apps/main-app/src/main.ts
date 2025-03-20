import { createApp } from 'vue';
import App from './App.vue';
import { setupApp } from 'wujie';

const app = createApp(App);

// 配置子应用
setupApp({
  name: 'counter-app',
  url: '//localhost:5173',
  el: '#counter-app',
});

setupApp({
  name: 'image-app',
  url: '//localhost:5174',
  el: '#image-app',
});

app.mount('#app');