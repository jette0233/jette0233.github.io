# 计算所实习复盘进度看板

用于跟踪《计算所实习：传统全栈复盘任务清单》的学习进度。前端托管在 GitHub Pages，Flask API 和 SQLite 部署在独立服务器上。

页面包含三类信息：

- 69 个可勾选的学习与输出任务；
- 按主题组织的复盘路线；
- 不计入完成率的事实边界、面试红线和使用规则公告。

## 更新清单

1. 编辑 `content/计算所实习_传统全栈复盘任务清单.md`，使用 Markdown 任务格式 `- [ ]` 或 `- [x]`。
2. 运行 `npm run build`，生成 `data/study-plan.js`。
3. 提交并推送到 `main`。GitHub Actions 会重新生成数据并部署页面。

任务和公告都由 Markdown 生成。公告使用普通列表，任务使用 `- [ ]` 或 `- [x]`，只有任务计入完成率。

## 进度保存

前端采用 local-first 模式：

1. 勾选后立即写入浏览器 `localStorage`；
2. 配置同步密钥后，异步写入 Flask/SQLite；
3. 重新打开页面或换设备时，从服务器拉取最新进度；
4. 后端不可用时，本地勾选仍可继续使用，恢复后可再次同步。

同步密钥只保存在浏览器和服务器环境变量中，不进入 Git。导入、导出可用于手动迁移或备份进度。

## 本地预览

在仓库目录启动任意静态文件服务器，例如：

```powershell
python -m http.server 4173
```

访问 `http://localhost:4173`。

## 技术边界

GitHub Pages 只发布 `_site` 中的 HTML、CSS、JavaScript 和静态资源。Flask 后端不由 GitHub Pages 执行，而是通过 `https://39.97.37.59/progress-api` 提供 API。

- Gunicorn 仅监听 Docker 网桥 `172.17.0.1:5010`；
- Nginx 是唯一公网入口；
- Bearer 同步密钥使用 SHA-256 摘要存储；
- CORS 仅允许 `https://jette0233.github.io`；
- SQLite 使用 WAL，并通过在线备份保留最近 30 天副本；
- IP HTTPS 证书由 Let's Encrypt 签发，每 4 小时检查续期。

## 服务端部署文件

- `backend/`：Flask API、SQLite 初始化、备份和测试；
- `deploy/start-backend.sh`：在 `screen` 中启动 Gunicorn；
- `deploy/nginx.server.conf`：现有域名站点和进度 API 的 Nginx 配置；
- `deploy/renew-ip-certificate.sh`：IP 证书续期和 Nginx 热加载；
- `deploy/*.cron`：数据库备份与证书续期计划。

服务器密钥和 `backend/.env` 必须单独配置。仓库中的 `.env.example` 只描述变量名，不包含真实凭据。
