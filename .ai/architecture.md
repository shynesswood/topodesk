# 架构说明

## 总体架构

TopoDesk 使用 Wails 将 Go 后端和 React 前端打包为桌面应用。

```text
React UI
  -> Zustand stores
  -> frontend/src/services/*
  -> frontend/wailsjs/go/main/App generated bindings
  -> app.go
  -> internal/* Go services
  -> local file system / network / OS command
```

## 前端分层

- `frontend/src/components/layout`：应用布局、工具栏、侧边栏、画布容器、终端输出栏。
- `frontend/src/components/topology`：React Flow 节点、分组、连线、右键菜单、树结构展示。
- `frontend/src/components/panels`：节点、连线、分组的属性编辑面板。
- `frontend/src/stores`：Zustand 状态边界。
- `frontend/src/services`：Wails API 的前端适配层。
- `frontend/src/types`：前端领域类型定义。

## 后端分层

- `app.go`：Wails 绑定门面，负责向前端暴露可调用方法。
- `internal/models`：项目文件和拓扑领域模型。
- `internal/project`：项目创建、保存、加载。
- `internal/storage`：文件系统辅助能力。
- `internal/ssh`：SSH 连接测试和命令执行。
- `internal/rdp`：RDP 端口连接测试。
- `internal/cmdexec`：本地命令执行。

## 数据流

### 新建项目

`Toolbar` 或 `AppLayout` 调用 `projectStore.createBlank()`，再通过 `projectService.NewProject()` 进入 Wails 后端 `App.NewProject()`，由 `internal/project.ProjectService.New()` 创建 `TopologyProject`。

### 编辑拓扑

用户在画布、侧边栏或属性面板操作，最终写入 `topologyStore`。会改变项目内容的操作必须调用 `markDirty()` 标记未保存。

### 保存项目

`Toolbar` 汇总 `projectStore.currentProject` 与 `topologyStore` 的 `nodes`、`edges`、`groups`、`viewport`，通过 `projectService.SaveProject()` 转换为 Wails 模型，调用 Go 后端保存 JSON 文件。

### 加载项目

文件选择或拖拽触发 `projectService.LoadProject()`，Go 后端解析 JSON，前端转换为 `TopologyProject`，再写入 `projectStore` 和 `topologyStore`。

### 执行命令

`NodeContextMenu` 根据命令类型调用本地命令服务或 SSH 服务，执行结果写入 `uiStore.terminalBar.entries` 并显示在 `TerminalBar`。

## Wails 边界

- 前端只应调用 `frontend/src/services/*`。
- `frontend/wailsjs` 由 Wails 根据 Go 绑定生成，不承载业务逻辑。
- 新增 Go 暴露方法时，应先改 `app.go`，再重新生成 Wails 绑定，最后补前端 service 封装。

## 持久化边界

- 项目文件格式由 `internal/models/topology.go` 和 `frontend/src/types/*` 共同描述。
- JSON 顶层结构是 `TopologyProject`。
- `version` 字段用于未来迁移，当前版本为 `1`。
