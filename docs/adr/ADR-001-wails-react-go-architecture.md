# ADR-001: Wails + React + Go 桌面架构

## 状态

已接受

## 决策

使用 Wails v2 作为桌面框架，后端为 Go，前端为 React 18 + TypeScript + Vite。

## 理由

- Wails 提供跨平台桌面能力，Go 后端可以调用系统级网络和命令执行。
- React Flow 提供成熟的拓扑编辑画布。
- Zustand 适合本项目的状态规模，比 Redux 更轻量。
- Ant Design 提供统一的 UI 组件库。

## 影响

- 前后端通过 Wails IPC 通信，前端不能直接访问文件系统，必须经过 Go 后端。
- 前端 Wails 绑定在 `frontend/wailsjs`，是生成代码，不应手工编辑。
- 项目数据流必须经过 `app.go` → `internal/*`，不能在浏览器侧读写文件。
- 打包由 `wails build` 完成，不部署为 Web 服务。

## 替代方案

| 方案 | 否决原因 |
| --- | --- |
| Electron + Go 子进程 | 两个进程通信复杂，包体大 |
| 纯 Web 应用 | 需要 Web 服务器，不能直接访问本地文件和命令 |
| Tauri + Rust | Go 生态更适合运维工具，Rust 学习成本高 |
