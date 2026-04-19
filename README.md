# Shawn Photography (TypeScript + Tailwind + Cloudflare Pages)

## 本地开发

```bash
npm install
npm run dev
```

> Logo 文件请放在 `public/logo.png`（已在页面头部引用）。

## 构建

```bash
npm run build
npm run preview
```

> 当前 `build` 采用 `vite build`（不在构建阶段执行全量 `tsc`），以避免仓库中未接入页面的实验文件导致 Cloudflare Pages 构建失败。

## 部署到 Cloudflare Pages

### 方式一：Cloudflare 控制台
1. 将仓库连接到 Cloudflare Pages。
2. Build command 填：`npm run build`
3. Build output directory 填：`dist`
4. 环境变量可按需添加。

### 方式二：Wrangler

```bash
npm run build
npx wrangler deploy
```

`wrangler.toml` 已配置 `[assets] directory = "./dist"`，用于 `wrangler deploy` 直接发布静态产物。
仓库还提供了 `worker/index.ts` 作为最小 Worker 入口（仅转发到 `ASSETS`），避免 Wrangler 在自动推断入口时引用到非预期脚本。
