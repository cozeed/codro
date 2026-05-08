<div align="center">
  <img align="center" src="./apps/web/public/app-icon.png" width="120" height="120" />
</div>

<h2 align="center"/>Codro</h2>
<div align='center'>
  <br>
  <em>思考与绘制的 AI 工作空间。</em>
  <br>
  <br>
</div>

<div align="center">

[![GitHub Repo stars](https://img.shields.io/github/stars/cozeed/codro)](https://github.com/cozeed/codro)
[![应用版本][version-badge]][release]
[![下载量][downloads-badge]][release]
[![已关闭问题][issues-closed]](https://github.com/cozeed/codro/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aclosed) <br/>
[![TypeScript 版本][typescript-version-icon]](https://www.typescriptlang.org/)
[![Rust 版本][rust-version-icon]](https://www.rust-lang.org/)
[![许可证][license-badge]][license]

<br/>
</div>

<h4 align="center"><strong>English</strong> | <a href="./README_JA.md">日本語</a> | <a href="./README_CN.md">简体中文</a> | <a href="./README_TW.md">繁体中文</a></h4>

<img src="./apps/web/public/app-screenshot.png" alt="截图" />

## 在线体验

- 用户名：`test@test.com`
- 密码：`11111111`

## Codro 目前处于 Beta 阶段 ⚠️

目前 Codro 处于 beta 阶段，建议在有数据备份的情况下使用。

## 功能特性

- 🖥️ **本地优先(Local-first)：** 所有数据存储在本地，支持离线使用，并可同步到不同设备。
- 🎨 **应用场景：** 白板与自由绘制图表；流程图、时序图、架构图、示意图、思维导图等；结构化笔记与文档编辑。
- 🤖 **AI Chat：** 支持通过聊天与 AI 助手进行交互。支持 OpenAI、Anthropic、Google、DeepSeek 等大模型。
- 📊 **图表类型：** 支持 Excalidraw、tldraw、draw.io、Mindmap、Note 等图表类型。
- ⚡ **轻量级：** 基于 Tauri，安装体积小于 20MB，性能得到提升。
- 🌍 **多语言支持：** 支持英文、日文、中文、中文繁体等多种语言。
- 💻 **平台支持：** 支持 Web、Windows、macOS、Linux 等多个平台。

## 技术栈

### 前端技术

- **React 19** — 最新版本的 React
- **Vite 8** — 高速构建工具和开发服务器
- **TypeScript 6** — 全覆盖的类型安全 JavaScript
- **Tailwind CSS v4** — 实用优先的 CSS 框架
- **Radix UI** — 无障碍访问的组件原语
- **tRPC** — 端到端类型安全的 API 通信
- **TanStack React Query** — 服务端状态管理与数据缓存
- **Jotai** — 原子化轻量级状态管理
- **assistant-ui** — AI 聊天界面组件

### 后端技术

- **Hono** — 轻量级高性能 Web 框架
- **tRPC Server** — 类型安全的 API 端点
- **AI SDK (Vercel)** — 统一的大模型调用接口（OpenAI、Anthropic、Gemini、DeepSeek）
- **Better Auth** — 现代身份认证和授权
- **Drizzle ORM** — 类型安全的数据库工具包
- **PostgreSQL** — 强大的关系型数据库
- **PGlite** — 嵌入式 PostgreSQL，支持离线本地数据
- **Cloudflare R2 / AWS S3** — 对象存储

### 桌面端

- **Tauri v2** — 基于 Rust 的轻量级桌面应用框架

### 基础设施与工具

- **TurboRepo** — 单体仓库（Monorepo）构建编排
- **pnpm** — 快速高效的包管理器
- **Vite** — 前端构建工具
- **Rust** — Tauri 后端系统级语言

## 文档

- [快速开始](https://cozeed.com/zh/docs/quickstart)
- [项目架构](https://cozeed.com/zh/docs/architecture)
- [项目结构](https://cozeed.com/zh/docs/development/project-structure)
- [配置管理](https://cozeed.com/zh/docs/development/configuration)
- [Docker 部署](https://cozeed.com/zh/docs/deployment/docker)

## 如何贡献

当前的 Codro 仍处于初期阶段，可能存在一些不好的体验或 bug。欢迎所有感兴趣的伙伴或遇到问题的用户提交 [issues](https://github.com/cozeed/codro/issues/new) 或 [PR](https://github.com/cozeed/codro/compare) 来参与这个项目。

## 支持

Codro 完全且永久开源，如果你想支持 Codro，可以给这个项目点个 `star`。如果需要特别支持，可以通过 [email](mailto:cozeed9@gmail.com) 联系我。

<!-- badges -->

[downloads-badge]: https://img.shields.io/github/downloads/cozeed/codro/total?label=downloads&style=flat-square&labelColor=black
[license-badge]: https://img.shields.io/badge/license-AGPL-purple.svg?style=flat-square&labelColor=black
[license]: https://opensource.org/licenses/AGPL-3.0?labelColor=black
[release]: https://github.com/cozeed/codro/releases?labelColor=black
[version-badge]: https://img.shields.io/github/v/release/cozeed/codro?color=%239accfe&label=version&style=flat-square&labelColor=black
[rust-version-icon]: https://img.shields.io/badge/Rust-1.95.0-dea584?style=flat-square&labelColor=black
[typescript-version-icon]: https://img.shields.io/github/package-json/dependency-version/cozeed/codro/dev/typescript?label=TypeScript&style=flat-square&labelColor=black
[issues-closed]: https://img.shields.io/github/issues-closed/cozeed/codro.svg?style=flat-square&labelColor=black

## 许可证

Codro 许可采用 [AGPL-3.0](LICENSE)，所有权归 [Cozeed.com](https://cozeed.com)。

## Star 历史

[![Star History Chart](https://api.star-history.com/chart?repos=cozeed/codro&type=date&legend=top-left)](https://www.star-history.com/?repos=cozeed%2Fcodro&type=date&legend=top-left)
