import { createApp } from 'vue';
import App from './App.vue';
import { setupApp } from 'wujie';
import config from './config.json';

const app = createApp(App);

app.mount('#app');

// 预注册所有子应用的基本配置
// setupApp 只是注册配置，不会实际加载应用
// 实际加载会在用户点击按钮时通过 startApp 执行
config.apps.forEach(appConfig => {
  setupApp({
    name: appConfig.name,
    url: appConfig.url,
    el: appConfig.el,
  });
});