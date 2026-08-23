# 计算所实习复盘进度看板

纯静态 GitHub Pages 站点，用于跟踪《计算所实习：传统全栈复盘任务清单》的学习进度。

## 更新清单

1. 编辑 `content/计算所实习_传统全栈复盘任务清单.md`，使用 Markdown 任务格式 `- [ ]` 或 `- [x]`。
2. 运行 `npm run build`，生成 `data/study-plan.js`。
3. 提交并推送到 `main`。GitHub Actions 会重新生成数据并部署页面。

网页勾选状态保存在浏览器 `localStorage`，不会回写仓库。导入、导出按钮可在浏览器之间迁移进度；Markdown 中的 `[x]` 是公开的默认完成状态。

## 本地预览

在仓库目录启动任意静态文件服务器，例如：

```powershell
python -m http.server 4173
```

访问 `http://localhost:4173`。

## 技术边界

GitHub Pages 只能托管构建后的 HTML、CSS、JavaScript 和静态资源，不能持续运行 Node.js 服务端。Node.js 可以用于构建这个站点；需要服务端 API 时，应部署到独立的云函数或应用托管平台，并单独配置鉴权和 CORS。
