<template>
  <div class="counter-container">
    <h1>计数器应用</h1>
    <div class="counter-content">
      <p class="counter-value">当前计数: {{ count }}</p>
      <div class="counter-buttons">
        <button @click="increment">增加</button>
        <button @click="decrement">减少</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);

    const increment = () => {
      count.value++;
    };

    const decrement = () => {
      count.value--;
    };

    return {
      count,
      increment,
      decrement,
    };
  },
};
</script>

<style scoped>
.counter-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.counter-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.counter-value {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.counter-buttons {
  display: flex;
  gap: 12px;
}

button {
  padding: 8px 20px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}
</style>