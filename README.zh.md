# X-SUB-Store

X-SUB-Store 是一个以 Docker 为核心、面向安全的 V2Ray 订阅聚合与管理系统。

## 功能特性
- **集中式中心**：将多个订阅源（Hiddify、Xray 等）合并为一个输出。
- **管理后台**：管理用户、上游订阅源和静态节点。
- **安全性**：每用户独立密钥令牌、无公开注册、令牌加密存储。
- **性能**：缓存、并发抓取、去重。
- **Docker First**：结合 Nginx 与 SSL 自动化，部署简单。

## 快速开始（开发环境）

1. 克隆仓库。
2. 复制并编辑 `.env`：
   ```bash
   cp .env.example .env
   ```
3. 启动服务栈（首次会构建镜像，后续复用）：
   ```bash
   docker compose -f compose.dev.yml up -d
   ```
4. 在 `app` 容器中手动启动 Nuxt 开发服务：
   ```bash
   docker exec -it ss-app ash
   bun dev
   ```
5. 创建管理员账号（在另一个终端）：
   ```bash
   docker compose -f compose.dev.yml exec app bun run scripts/create-admin.ts --email admin@example.com --password secret
   ```
6. 访问地址：
   - `https://localhost/admin`（通过 Nginx + 本地证书）
   - `http://localhost:3000/admin`（直连 Nuxt 开发服务）

## 本地 HTTPS（接近生产）

使用独立的开发栈：

```bash
docker compose -f compose.dev.yml up -d
```

该方式会启动单独的开发编排（`app`、`mongo`、`nginx`），并使用 `nginx/cert-local` 中的本地证书。
`DEV_DOMAIN` 默认值为 `localhost`（可覆盖，例如 `DEV_DOMAIN=api.localhost`）。
Nuxt 源码已挂载以支持热更新。依赖缓存、Nuxt/Nitro 缓存与 MongoDB 数据通过 Docker 命名卷持久化。
手动启动开发服务：
```bash
docker exec -it ss-app ash
bun dev
```

访问：
- `https://localhost/admin`

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
6. 应用可通过 `https://your-domain.com` 访问。

## 管理

### 用户管理
- 登录后台管理面板。
- 创建用户。每位用户都会获得唯一的订阅 URL。
- 将该 URL 提供给用户的 V2Ray 客户端（v2rayNG、V2Box 等）。

### 上游源管理
- **Global**：对所有用户生效。
- **User**：仅对指定用户生效。
- 支持原始文本列表或 base64 订阅链接。

### 令牌轮换
- 在用户详情页点击 “Rotate Token”，旧 URL 会立刻失效并生成新 URL。

## 开发

- 运行 `bun install`
- 运行 `bun dev` 启动本地开发服务（需要本地 Mongo）
- 运行 `bun test` 执行单元测试

## 架构

- **后端**：Nuxt 3（Nitro）
- **数据库**：MongoDB（Mongoose）
- **前端**：Nuxt UI（Tailwind）
- **安全**：Argon2 哈希、AES-256-GCM 令牌加密、H3 会话
