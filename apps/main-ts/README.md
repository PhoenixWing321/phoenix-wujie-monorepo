# Vite + TypeScript 项目


---

### 1. 使用模板初始化项目
运行以下命令来创建一个基于 Vite 和 TypeScript 的纯 JavaScript 项目：

```bash
pnpm create vite@latest main-ts --template vanilla-ts
```

- `main-ts` 是你的项目名称，可以替换为你想要的名称。
- `--template vanilla-ts` 指定使用 Vite 的 **vanilla-ts** 模板。


---

### 2. 安装依赖
使用 `pnpm` 安装项目依赖：

```bash
cd main-ts

pnpm install
```

---

### 3. 运行项目
启动开发服务器：

```bash
pnpm run dev
```

Vite 会启动一个开发服务器，并自动打开浏览器访问 `http://localhost:5173`。

---

### 4. 项目结构
使用 `vanilla-ts` 模板生成的项目结构如下：

```
main-ts/
├── node_modules/
├── public/
│   └── vite.svg
├── src/
│   ├── main.ts       # 入口 TypeScript 文件
│   ├── style.css     # 全局样式文件
│   └── vite-env.d.ts # Vite 环境类型声明
├── index.html        # 入口 HTML 文件
├── package.json      # 项目依赖和脚本
├── tsconfig.json     # TypeScript 配置文件
├── vite.config.ts    # Vite 配置文件
```

---

### 5. 编写代码
- 在 `src/main.ts` 中编写 TypeScript 代码。
- 在 `index.html` 中引入生成的 JavaScript 文件。

例如，`src/main.ts` 中的默认代码：

```typescript
import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>Hello Vite + TypeScript!</h1>
`;
```

---

### 6. 构建项目
当你准备好构建项目时，运行以下命令：

```bash
pnpm run build
```

构建结果会输出到 `dist` 目录。

---

### 7. 预览构建结果
使用以下命令预览构建结果：

```bash
pnpm run preview
```

---

### 总结
通过以上步骤，你已经成功使用 `pnpm` 和 Vite 的 **vanilla-ts** 模板初始化了一个纯 TypeScript 项目。这个模板非常适合不需要前端框架（如 Vue 或 React）的场景。你可以在此基础上继续开发你的项目！