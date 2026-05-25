# TopoDesk 项目说明

## 项目定位

TopoDesk 是一个面向运维场景的桌面拓扑管理工具，用于维护服务器节点、连接关系、分组、软件信息、远程连接信息和常用命令。

当前应用是本地优先的桌面应用，不是 Web 服务端应用。项目数据通过 `.topology.json` 文件保存和加载。

## 技术栈

- 桌面框架：Wails v2
- 后端：Go
- 前端：React 18 + TypeScript + Vite
- UI：Ant Design
- 拓扑画布：`@xyflow/react`
- 前端状态：Zustand
- 文件格式：JSON，扩展名约定为 `.topology.json`

## 主要入口

- Wails 后端入口：`main.go`
- Wails 暴露给前端的应用 API：`app.go`
- Go 领域模型：`internal/models/topology.go`
- 前端应用入口：`frontend/src/App.tsx`
- 前端布局入口：`frontend/src/components/layout/AppLayout.tsx`
- 前端服务封装：`frontend/src/services/*`
- 前端状态：`frontend/src/stores/*`

## 常用命令

- 开发运行：`wails dev`
- 打包构建：`wails build`
- 前端构建：在 `frontend` 目录运行 `npm run build`
- Go 测试：`go test ./...`

## 当前约束

- `frontend/wailsjs` 是 Wails 生成代码，除非重新生成绑定，否则不要手工编辑。
- 前端组件不要直接调用 `wailsjs/go/main/App`，应经过 `frontend/src/services/*`。
- 拓扑数据的运行时状态以 `frontend/src/stores/topologyStore.ts` 为主。
- 项目文件元信息和脏状态以 `frontend/src/stores/projectStore.ts` 为主。
- 节点凭证当前会随项目 JSON 保存，属于明确的安全风险。

## 已知重点风险

- Go 模型、TypeScript 类型、Wails 转换器和保存加载逻辑必须同步维护。
- 当前 `projectService.ts` 转换逻辑容易遗漏字段，例如节点 `os`、`rdp`、`commands` 以及连线 `sourceHandle`、`targetHandle`。
- 本地命令执行和 SSH 命令执行具备高风险能力，新增功能时必须优先考虑确认、日志和错误展示。
