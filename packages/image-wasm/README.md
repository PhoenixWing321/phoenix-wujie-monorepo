# pnpm 来替代 npm

使用以下命令来安装依赖和构建项目：

```bash
# 安装依赖
pnpm install

# 构建 WASM 模块
cd packages/image-wasm
pnpm build
```

使用 pnpm 的主要优势：
1. 更快的安装速度
2. 更节省磁盘空间（共享依赖）
3. 更严格的依赖管理
4. 更好的 monorepo 支持

如果您需要在 `image-app` 中使用这个库，只需要在 `image-app` 的 `package.json` 中添加依赖：

```json
{
  "dependencies": {
    "@phoenix-wujie-monorepo/image-wasm": "workspace:*"
  }
}
```

然后在 `image-app` 目录下运行 `pnpm install` 即可。

