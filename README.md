使用 `wujie` 微前端框架和 `pnpm` 的 Monorepo 架构来建立一个主应用并集成子应用（计数器应用和图片显示应用），可以按照以下步骤进行：

---

### 1. 初始化 Monorepo 项目

1. **安装 `pnpm`**：
   如果尚未安装 `pnpm`，可以通过以下命令安装：
   ```bash
   npm install -g pnpm
   ```

2. **创建项目目录**：
   ```bash
   mkdir wujie-monorepo
   cd wujie-monorepo
   ```

3. **初始化 `pnpm` 工作区**：
   在项目根目录下创建 `pnpm-workspace.yaml` 文件，定义工作区：
   ```yaml
   packages:
     - 'packages/*'
   ```

4. **初始化 `package.json`**：
   运行以下命令初始化 `package.json`：
   ```bash
   pnpm init
   ```

---

### 2. 创建子应用

#### 2.1 创建计数器子应用
1. **创建子应用目录**：
   ```bash
   mkdir -p packages/counter-app
   cd packages/counter-app
   ```

2. **初始化 Vue 3 + TypeScript + Vite 项目**：
   运行以下命令：
   ```bash
   pnpm create vite@latest . --template vue-ts
   ```

3. **安装依赖**：
   ```bash
   pnpm install
   ```

4. **修改 `src/App.vue`**：
   实现一个简单的计数器：
   ```vue
   <template>
     <div>
       <h1>计数器应用</h1>
       <p>当前计数: {{ count }}</p>
       <button @click="increment">增加</button>
       <button @click="decrement">减少</button>
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
   ```

5. **运行计数器子应用**：
   ```bash
   pnpm run dev
   ```

---

#### 2.2 创建图片显示子应用
1. **创建子应用目录**：
   ```bash
   cd ../..
   mkdir -p packages/image-app
   cd packages/image-app
   ```

2. **初始化 Vue 3 + TypeScript + Vite 项目**：
   运行以下命令：
   ```bash
   pnpm create vite@latest . --template vue-ts
   ```

3. **安装依赖**：
   ```bash
   pnpm install
   ```

4. **修改 `src/App.vue`**：
   实现图片上传和显示功能：
   ```vue
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
   ```

5. **运行图片显示子应用**：
   ```bash
   pnpm run dev
   ```

---

### 3. 创建主应用

1. **创建主应用目录**：
   ```bash
   cd ../..
   mkdir -p packages/main-app
   cd packages/main-app
   ```

2. **初始化 Vue 3 + TypeScript + Vite 项目**：
   运行以下命令：
   ```bash
   pnpm create vite@latest . --template vue-ts
   ```

3. **安装依赖**：
   ```bash
   pnpm install
   ```

4. **安装 `wujie`**：
   ```bash
   pnpm add wujie -w
   ```

5. **修改 `src/main.ts`**：
   配置 `wujie` 微前端：
   ```typescript
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
   ```

6. **修改 `src/App.vue`**：
   实现主应用的布局和路由：
   ```vue
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
   ```

7. **运行主应用**：
   ```bash
   pnpm run dev
   ```

---

### 4. 项目结构
最终的项目结构如下：
```
wujie-monorepo/
├── packages/
│   ├── counter-app/
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── image-app/
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── main-app/
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   └── main.ts
│   │   ├── package.json
│   │   └── vite.config.ts
├── pnpm-workspace.yaml
├── package.json
└── pnpm-lock.yaml
```

---

### 5. 运行项目

1. **运行计数器子应用**：
   ```bash
   cd packages/counter-app
   pnpm run dev
   ```

2. **运行图片显示子应用**：
   ```bash
   cd ../image-app
   pnpm run dev
   ```

3. **运行主应用**：
   ```bash
   cd ../main-app
   pnpm run dev
   ```

4. **访问主应用**：
   打开浏览器访问 `http://localhost:5175`，点击按钮加载子应用。

---

通过以上步骤，你可以成功使用 `wujie` 微前端框架和 `pnpm` 的 Monorepo 架构建立一个主应用，并集成两个子应用（计数器应用和图片显示应用）。