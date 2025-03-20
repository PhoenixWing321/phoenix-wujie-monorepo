<template>
  <div class="container">
    <h1>Wujie Monorepo Frontend - 无界微前端 Monorepo 主应用</h1>
    <div class="buttons">
      <Button type="primary" :onClick="loadCounterApp">
        {{ counterAppVisible ? '隐藏' : '显示' }} Counter App
      </Button>
      <Button type="primary" :onClick="loadImageApp">
        {{ imageAppVisible ? '隐藏' : '显示' }} Image App
      </Button>
    </div>
    <div class="apps-container">
      <div v-if="counterAppVisible" class="sub-app">
        <h2>Counter App</h2>
        <div id="counter-app"></div>
      </div>
      <div v-if="imageAppVisible" class="sub-app">
        <h2>Image App</h2>
        <div id="image-app"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { startApp } from 'wujie';
import { Button } from '@phoenix-wujie-monorepo/ui';
import config from './config.json';

export default defineComponent({
  name: 'App',
  components: {
    Button
  },
  data() {
    return {
      counterAppVisible: false,
      imageAppVisible: false
    }
  },
  methods: {
    // 实际加载子应用的方法
    // 这里的 startApp 会真正地加载和渲染子应用
    // 它使用了在 main.ts 中通过 setupApp 预先注册的配置
    // 同时可以传入额外的运行时配置（props、生命周期钩子等）
    loadApp(appName: string) {
      const appConfig = config.apps.find(app => app.name === appName);
      if (!appConfig) return;

      // 切换应用的显示状态
      if (appName === 'counter-app') {
        this.counterAppVisible = !this.counterAppVisible;
      } else if (appName === 'image-app') {
        this.imageAppVisible = !this.imageAppVisible;
      }

      // 只有在显示状态时才加载应用
      if ((appName === 'counter-app' && this.counterAppVisible) ||
        (appName === 'image-app' && this.imageAppVisible)) {
        startApp({
          ...appConfig,
          url: appConfig.url.replace('//', 'http://'),
          beforeLoad: () => console.log(`${appName} is loading...`),
          afterMount: () => console.log(`${appName} mounted`)
        });
      }
    },
    loadCounterApp() {
      this.loadApp('counter-app');
    },
    loadImageApp() {
      this.loadApp('image-app');
    }
  }
});
</script>

<style scoped>
/* 布局容器 */
.container {
  height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* 按钮区域 */
.buttons {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

/* 应用容器区域 */
.apps-container {
  height: 70vh;
  margin-top: 20px;
  padding-right: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  overflow-y: auto;
}

.sub-app {
  height: auto;
  min-height: 400px;
  max-height: 600px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.sub-app h2 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 1.5em;
  flex-shrink: 0;
}

/* 子应用容器 */
#counter-app,
#image-app {
  flex: 1;
  height: 100%;
  min-height: 0;
  margin: -20px;
  margin-top: 0;
}

/* 微前端框架生成的元素 */
:deep(wujie-app),
:deep(.wujie_iframe) {
  width: 100% !important;
  height: 100% !important;
  display: block !important;
  overflow: hidden !important;
}

/* 滚动条样式 */
.apps-container::-webkit-scrollbar {
  width: 6px;
}

.apps-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.apps-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.apps-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>