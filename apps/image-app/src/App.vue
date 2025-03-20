<template>
  <div class="image-container">
    <h2>图片显示应用</h2>
    <div class="upload-button">
      <Button type="primary" :onClick="handleUpload">选择图片</Button>
    </div>
    <input
      type="file"
      ref="fileInput"
      style="display: none"
      accept="image/*"
      @change="onFileSelected"
    />
    <div class="image-preview">
      <img :src="imageUrl || '/phoenixwing.png'" :alt="imageUrl ? '上传的图片' : '默认图片'" />
      <Button v-if="imageUrl" type="secondary" :onClick="clearImage">清除图片</Button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Button } from '@phoenix-wujie-monorepo/ui';

export default defineComponent({
  name: 'ImageApp',
  components: {
    Button
  },
  data() {
    return {
      imageUrl: ''
    }
  },
  methods: {
    handleUpload() {
      (this.$refs.fileInput as HTMLInputElement).click();
    },
    onFileSelected(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        this.imageUrl = URL.createObjectURL(file);
      }
    },
    clearImage() {
      this.imageUrl = '';
    }
  }
});
</script>

<style scoped>
.image-container {
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-button :deep(.ui-button) {
  width: 120px;
}

.image-preview {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}
</style>