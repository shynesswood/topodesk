# 模块知识：Wails 桥接层

## 职责

连接 React 前端和 Go 后端。前端通过 Wails 生成绑定调用 `app.go` 中的方法。

## 主要文件

- Wails 配置：`wails.json`
- Go 绑定门面：`app.go`
- 应用启动：`main.go`
- 生成绑定：`frontend/wailsjs/go/main/App.*`
- 生成模型：`frontend/wailsjs/go/models.ts`
- 运行时 API：`frontend/wailsjs/runtime/*`
- 前端 service 封装：`frontend/src/services/*`

## 暴露 API

项目与文件：

- `NewProject`
- `SaveProject`
- `LoadProject`
- `OpenFileDialog`
- `SaveFileDialog`
- `FileExists`

远程连接与命令：

- `SSHTestConnection`
- `RDPTestConnection`
- `ExecuteLocalCommand`
- `SSHExecuteCommand`

应用信息：

- `GetVersion`

## 修改流程

新增后端能力时：

1. 在合适的 `internal/*` service 实现能力。
2. 在 `app.go` 增加简洁的 Wails 暴露方法。
3. 重新生成或构建 Wails 绑定。
4. 在 `frontend/src/services/*` 增加前端封装。
5. UI 组件只调用前端 service，不直接调用 `frontend/wailsjs`。

## 禁止事项

- 不要手工编辑 `frontend/wailsjs` 生成文件。
- 不要在 `app.go` 中写复杂业务流程，除非只是编排内部 service。
- 不要从组件直接导入 `frontend/wailsjs/go/main/App`，现有少量调用应逐步收敛到 services。
- 不要把 Wails runtime 事件处理和项目业务逻辑混在同一个大型函数中。

## 验证方式

- 前端能成功导入 service 封装。
- Wails 绑定生成后 TypeScript 构建通过。
- 运行相关 UI 功能验证调用链是否可达。
