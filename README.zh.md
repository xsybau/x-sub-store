# 文档语言切换: [English](README.md) | [فارسی](README.fa.md) | [Русский](README.ru.md) | [中文](README.zh.md)

# X-SUB-Store

X-SUB-Store 是一个以 Docker 为核心、面向安全的 V2Ray 订阅聚合与管理系统。

## 功能特性

- **集中式中心**：将多个订阅源（Hiddify、Xray 等）合并为一个输出。
- **管理后台**：管理用户、标签、上游订阅源和静态节点。
- **基于标签分发**：支持用户多标签、新用户默认标签、按标签绑定源。
- **运维体验**：可快速复制用户订阅链接，并实时测试上游抓取状态。
- **安全性**：每用户独立密钥令牌、无公开注册、令牌加密存储。
- **性能**：缓存、并发抓取、去重。
- **Docker First**：结合 Nginx 与 SSL 自动化，部署简单。

## UI 国际化

- 支持语言：`en`（默认）、`fa`、`ru`、`zh`
- 路由不使用语言前缀（`/admin/...` 保持不变）
- 语言切换器位置：
  - 管理后台布局侧边栏
  - 管理员登录页
- 波斯语（`fa`）启用 `RTL`，并镜像后台壳层布局行为。
- 当前阶段仅本地化 UI 文本，后端/API 返回信息不做翻译。

## Nuxt 4 App Directory 结构

- Nuxt 前端目录位于 `app/`：
  - `app/pages`、`app/layouts`、`app/components`、`app/composables`、`app/middleware`、`app/plugins`、`app/assets`
- 领域和后端目录保持在仓库根目录：
  - `modules/`、`i18n/`、`server/`、`scripts/`、`tests/`、`public/`
- 兼容别名保留，以下导入继续可用：
  - `~/modules/*`、`~/i18n/*`、`~/server/*`

## 快速开始（开发环境）

1. 克隆仓库。
2. 复制并编辑 `.env`：
   ```bash
   cp .env.example .env
   ```
3. 启动开发栈：
   ```bash
   docker compose -f compose.dev.yml up -d
   ```
4. `ss-app` 容器默认不会自动运行 Nuxt dev。
5. 在容器内手动安装依赖并启动开发服务：
   ```bash
   docker exec -it ss-app ash
   bun install
   bun dev
   ```
6. 创建管理员账号（在另一个终端）：
   ```bash
   docker compose -f compose.dev.yml exec app bun run scripts/create-admin.ts --email admin@example.com --password secret
   ```
7. 访问地址：
   - `https://localhost/admin`
   - `http://localhost:3000/admin`
   - `http://localhost/subs/<token>`

## 本地 HTTPS（接近生产）

```bash
docker compose -f compose.dev.yml up -d
```

该模式会启动 `app`、`mongo`、`nginx`，并使用 `nginx/cert-local` 本地证书。
`DEV_DOMAIN` 默认是 `localhost`。

手动启动开发服务：

```bash
docker exec -it ss-app ash
bun install
bun dev
```

说明：
- 本地证书可能被客户端视为 `UntrustedRoot`。
- 本地导入订阅可使用 `http://localhost/subs/<token>`，或设置 `NUXT_PUBLIC_SUBSCRIPTION_BASE_URL=http://localhost`。

## 生产部署

1. 在 `.env` 中设置 `DOMAIN` 和 `EMAIL`。
2. 初始化 SSL 证书：
   ```bash
   chmod +x ops/ssl/init.sh
   ./ops/ssl/init.sh
   ```
3. 构建并启动生产栈：
   ```bash
   docker compose -f compose.yml up -d --build
   ```
4. 日常重启无需重新构建：
   ```bash
   docker compose -f compose.yml up -d
   ```
5. MongoDB 数据通过 Docker 命名卷持久化保存。

## 管理

### 用户管理

- 登录后台管理面板。
- 创建用户后，每位用户都会获得唯一订阅 URL。
- 可为用户分配多个标签。
- 在用户列表中使用 “Copy Subscription URL” 快速复制链接。
- 将链接提供给 V2Ray 客户端（v2rayNG、V2Box 等）。
- 默认输出为 raw URL 行（`vless://`、`vmess://` 等）。
- 如需 base64 输出，可追加 `?format=base64`。

### 上游源管理

- **Global**：对所有用户生效。
- **User**：仅对指定用户生效。
- **Tag**：对包含指定标签的用户生效。
- 支持原始文本列表与 base64 订阅链接。
- “Test Fetch” 会更新 `Last Status` 与 `Last Check`。

### 标签管理

- 创建、编辑、删除标签。
- 可设置多个默认标签用于新用户。
- 在标签详情页管理该标签作用域下的 upstream 与 static node。
- 标签可批量应用到选中用户或所有用户。
- 可对标签下用户执行批量操作：
  - 禁用账号
  - 轮换令牌
  - 删除用户

### 令牌轮换

- 在用户详情页点击 “Rotate Token”，旧链接会立即失效并生成新链接。

## 开发

推荐在 `ss-app` 容器中执行：

- lint + typecheck:
  ```bash
  docker exec ss-app bun run lint
  ```
- 完整 lint（不使用 ESLint 缓存）+ typecheck:
  ```bash
  docker exec ss-app bun run lint:full
  ```
- build:
  ```bash
  docker exec ss-app bun run build
  ```
- 测试:
  ```bash
  docker exec ss-app bun test
  ```

## 架构

- **后端**：Nuxt 4（Nitro）
- **数据库**：MongoDB（Mongoose）
- **前端**：Nuxt UI（Tailwind）
- **运行时**：Bun
- **安全**：Argon2 哈希、AES-256-GCM 令牌加密、H3 会话
