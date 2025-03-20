<template>
  <div>
    <h1>图片显示应用</h1>
    <input type="file" @change="handleFileUpload" accept="image/*" />
    <div v-if="imageUrl">
      <h2>上传的图片：</h2>
      <img :src="imageUrl" alt="Uploaded Image" style="max-width: 100%;" />
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
  setup() {
    const imageUrl = ref<string | null>(null);

    const handleFileUpload = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        imageUrl.value = URL.createObjectURL(file);
      }
    };

    return {
      imageUrl,
      handleFileUpload,
    };
  },
};
</script>