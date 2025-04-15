# Node Code Analyzer

一个用于分析 Git 仓库中 Node.js 项目的工具，自动识别前端框架、Node 版本、包管理器和运行命令，自动生成Dockerfile，适用于自动部署、CI/CD 等场景。

## ✨ 功能特性

- 🚀 支持从 Git 仓库拉取代码
- 🔍 自动识别以下信息：
  - 使用的前端框架（如：Nuxt, Next, Vue, React 等）
  - Node.js 版本（来自 `.nvmrc` 或 `package.json` 中的 `engines` 字段）
  - 包管理工具（npm, yarn, pnpm）
  - 启动脚本（例如 `start`, `dev`, `build`, `export`, `generate` 等）

## 📦 安装

```bash
npm install
npm start
```

## Http 调用
```bash
# POST请求示例
curl -X POST -H "Content-Type: application/json" -d '{"repoUrl":"https://github.com/your-repo-url"}' http://localhost:3000/analyze
```

## 命令行调用
```bash
npm link # 全局安装
deploy-analyzer analyze ./path/to/your/project
```

## 输出实例
```json
{
  "framework": "vue",
  "packageManager": "npm",
  "nodeVersion": "18",
  "commands": {
    "build": "vue-cli-service build",
    "start": "npm run serve"
  },
  "dockerfile": "FROM node:18-alpine\nWORKDIR /app\n..."
}
```