# Shawn Photography (TypeScript + Tailwind + Cloudflare Pages)

## 本地开发

```bash
npm install
npm run dev
```

> Logo 文件请放在 `public/logo.png`（已在页面头部引用，直接替换同名文件即可）。

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

## R2 图片上传（管理后台）

- 后台「图片管理」支持直接选择 JPG/JPEG/PNG/WebP 文件并上传到 R2。
- 上传接口：`POST /api/admin/upload-image`（Worker 处理），成功后返回 `url`，并写回图片 `src`。
- 图片访问路径：`/uploads/<key>`，由 Worker 从 `BUCKET` 读取并返回文件流。
- 现有图片可直接重新上传，新文件会覆盖同一路径（若当前 `src` 是 `/uploads/...`）。

### Cloudflare 运行要求

- Wrangler 必须使用 Worker 入口：`main = "worker/index.ts"`。
- 需要 R2 绑定：`BUCKET -> photography260420`（已在 `wrangler.toml` 配置）。
- 若继续保留 `GET /__diag/r2`，它用于快速检查运行时是否能访问 `env.BUCKET` 与 R2 读写。
