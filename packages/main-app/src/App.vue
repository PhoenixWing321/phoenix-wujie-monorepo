<template>
  <div>
    <h1>主应用</h1>
    <nav>
      <button @click="loadCounterApp">加载计数器应用</button>
      <button @click="loadImageApp">加载图片显示应用</button>
    </nav>
    <div id="counter-app"></div>
    <div id="image-app"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { startApp } from 'wujie';

export default defineComponent({
  methods: {
    loadCounterApp() {
      startApp({ name: 'counter-app' });
    },
    loadImageApp() {
      startApp({ name: 'image-app' });
    },
  },
});
</script>