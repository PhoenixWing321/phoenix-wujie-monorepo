# phoenix-wujie-monorepo
---

### 1. 初始化 Monorepo 项目

1. **安装 `pnpm`**：
   如果尚未安装 `pnpm`，可以通过以下命令安装：
   ```bash
   npm install -g pnpm
   ```

2. **创建项目目录**：
   ```bash
   mkdir phoenix-wujie-monorepo
   cd phoenix-wujie-monorepo
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

### 2. 创建应用

- 创建计数器子应用
- 创建图片显示子应用
- 创建主应用

最终的项目结构如下：
```
phoenix-wujie-monorepo/
├── apps/                    # 应用目录
│   ├── counter-app/        # 计数器应用
│   ├── image-app/         # 图片处理应用
│   └── main-app/          # 主应用
│
├── packages/               # 共享包目录
│   ├── image-wasm/        # WASM 图片处理库
│   └── ui/                # 共享 UI 组件库
├── pnpm-workspace.yaml
├── package.json
└── pnpm-lock.yaml
```

---

### 5. 运行项目
 
```bash
# 在 main-app 目录下
pnpm dev    # 将在 8310 端口启动

# 在 counter-app 目录下
pnpm dev    # 将在 8311 端口启动

# 在 image-app 目录下
pnpm dev    # 将在 8312 端口启动
```

- **访问主应用**：
   打开浏览器访问 `http://localhost:8310`，点击按钮加载子应用。

- 一键启动：

`pnpm apps`
- 一键安装：

`pnpm installAll`


# 启动原理

本项目使用 wujie 微前端框架来管理子应用。启动过程分为两个主要阶段：

### 1. 预配置阶段 (setupApp)

在 `main-app/src/main.ts` 中，通过 `setupApp` 预先注册所有子应用的基本配置：

```typescript
// 预注册所有子应用的基本配置
config.apps.forEach(appConfig => {
  setupApp({
    name: appConfig.name,  // 子应用标识
    url: appConfig.url,    // 子应用访问地址
    el: appConfig.el,      // 子应用挂载点
  });
});
```

这个阶段：
- 在主应用启动时就执行
- 只是注册配置，不会实际加载应用
- 相当于"注册表"，告诉主应用有哪些子应用可用

### 2. 实际加载阶段 (startApp)

在 `main-app/src/App.vue` 中，通过 `startApp` 实现子应用的实际加载：

```typescript
startApp({
  ...appConfig,           // 使用预配置的基本信息
  url: appConfig.url,     // 子应用地址
  beforeLoad: () => {},   // 加载前钩子
  afterMount: () => {},   // 挂载后钩子
  props: {}              // 传递给子应用的数据
});
```

这个阶段：
- 在用户点击按钮时才执行
- 真正加载和渲染子应用
- 可以使用 setupApp 中的基本配置
- 可以添加更多运行时配置（props、生命周期钩子等）

### 3. 配置管理

所有子应用的配置统一在 `main-app/src/config.json` 中管理：

```json
{
  "apps": [
    {
      "name": "counter-app",
      "url": "//localhost:8311",
      "el": "#counter-app",
      "alive": true,
      "props": {
        "message": "hello from main app"
      }
    },
    // ... 其他子应用配置
  ]
}
```

这种设计的优势：
1. 分离配置和运行时逻辑，便于维护
2. 可以预先注册所有可能用到的子应用
3. 按需加载子应用，提高性能
4. 运行时可以传入更多配置，更灵活

### 4. 启动顺序

1. 主应用启动（8310端口）
2. 子应用独立启动：
   - counter-app（8311端口）
   - image-app（8312端口）
3. 用户通过主应用界面控制子应用的加载和卸载

可以通过以下命令一键启动所有应用：
```bash
pnpm apps
```

