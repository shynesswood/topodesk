# 模块边界

| 模块 | 职责 | 可以依赖 | 禁止事项 |
| --- | --- | --- | --- |
| `app.go` | Wails API 门面、文件对话框、服务编排 | `internal/*`、Wails runtime | 承载复杂业务逻辑、直接操作前端状态 |
| `internal/models` | 拓扑项目 JSON 模型 | Go 标准库 | 引入 UI、Wails、网络或文件 IO 逻辑 |
| `internal/project` | 新建、保存、加载项目 | `internal/models`、文件系统 | 处理 UI 选择、远程连接、命令执行 |
| `internal/storage` | 文件系统辅助能力 | Go 标准库、Wails context | 保存拓扑业务语义 |
| `internal/ssh` | SSH 连接测试和远程命令执行 | `golang.org/x/crypto/ssh`、网络 | 保存凭证、修改项目文件 |
| `internal/rdp` | RDP 端口连通性测试 | Go 网络库 | 实现完整 RDP 登录或保存凭证 |
| `internal/cmdexec` | 本地命令执行 | OS shell、context timeout | 无超时执行、持久化输出 |
| `frontend/src/services` | 前端 Wails API 适配 | `frontend/wailsjs`、前端类型 | 维护 UI 状态、直接渲染组件 |
| `frontend/src/stores/topologyStore.ts` | 拓扑运行时状态和拓扑修改方法 | 前端类型、`projectStore.markDirty` | 调用 Wails、读写文件、执行命令 |
| `frontend/src/stores/projectStore.ts` | 当前项目、路径、脏状态 | `projectService` | 管理节点拖拽细节、终端输出 |
| `frontend/src/stores/uiStore.ts` | 面板、终端栏、选择类 UI 状态 | 无业务 service | 保存项目文件、执行网络请求 |
| `frontend/src/components/layout` | 应用布局和全局操作入口 | stores、services、UI 组件 | 放置底层数据转换规则 |
| `frontend/src/components/topology` | 画布元素、右键菜单、树视图 | stores、services、React Flow | 直接读写文件、绕过 store 修改拓扑 |
| `frontend/src/components/panels` | 属性编辑面板 | stores、services、Ant Design | 保存项目文件、维护跨组件状态 |

## 关键边界原则

- 项目 JSON 字段的权威定义来自 Go 模型和前端类型，转换逻辑必须完整。
- 画布交互可以复杂，但最终拓扑变更必须落入 `topologyStore`。
- 文件保存加载只能经过 `projectService` 和 Go 后端 `internal/project`。
- 远程连接和命令执行只能经过对应 service，不要在组件中直接拼接底层执行逻辑。
