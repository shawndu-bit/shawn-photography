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

## Neon Postgres 内容持久化

- 站点内容读取接口：`GET /api/site-content`
- 管理后台保存接口：`PUT /api/admin/site-content`
- Worker 运行时使用环境变量 `DATABASE_URL`。
- 迁移/导入建议使用 `DATABASE_URL_UNPOOLED` 在 Neon SQL Editor（或你自己的 psql）中执行。

### 初始化数据库 schema

在 Neon SQL Editor 连接到 `DATABASE_URL_UNPOOLED` 对应的数据库后，执行：

- `db/migrations/0001_site_content.sql`

### 导入现有 localStorage 数据（推荐唯一方案）

**请用：SQL for Neon SQL Editor**（最简单、最安全、一次性可重复执行）。

执行步骤：

1. 打开 Neon Console → SQL Editor，连接到 `DATABASE_URL_UNPOOLED` 对应数据库。
2. 先执行 `db/migrations/0001_site_content.sql`（仅需一次）。
3. 再执行 `db/import_initial_site_content.sql`（可重复执行；会覆盖 `site_content` 单例并重建 `site_photos` 顺序数据）。
4. 验证：
   - `SELECT id, updated_at FROM site_content;`
   - `SELECT id, title, position FROM site_photos ORDER BY position;`

> 项目已保留前端 localStorage 兜底读取逻辑（只作迁移过渡用），Neon 是主数据源。

## R2 图片上传（管理后台）

- 后台「图片管理」支持直接选择 JPG/JPEG/PNG/WebP 文件并上传到 R2。
- 上传接口：`POST /api/admin/upload-image`（Worker 处理），成功后返回 `url`，并写回图片 `src`。
- 图片访问路径：`/uploads/<key>`，由 Worker 从 `BUCKET` 读取并返回文件流。
- 现有图片可直接重新上传，新文件会覆盖同一路径（若当前 `src` 是 `/uploads/...`）。

### Cloudflare 运行要求

- Wrangler 必须使用 Worker 入口：`main = "worker/index.ts"`。
- 需要 R2 绑定：`BUCKET -> photography260420`（已在 `wrangler.toml` 配置）。
- 若继续保留 `GET /__diag/r2`，它用于快速检查运行时是否能访问 `env.BUCKET` 与 R2 读写。
