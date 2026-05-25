# 编码规则

## 通用规则

- 优先做最小正确修改，不做无关重构。
- 修改前先确认相关模块边界，必要时阅读 `knowledge/modules/*`。
- 不要手工编辑 `frontend/wailsjs` 生成文件。
- 不要把业务逻辑写入 Wails 生成绑定或 UI 事件回调深处，优先放到明确的 store/service/module。
- 不要引入新的持久化格式或兼容逻辑，除非有明确需求或 ADR。

## Go 规则

- Wails 对外 API 集中在 `app.go`。
- 领域模型集中在 `internal/models`。
- 后端能力按 `internal/project`、`internal/storage`、`internal/ssh`、`internal/rdp`、`internal/cmdexec` 划分。
- 返回给前端的错误应带可读上下文，保留 `%w` 包装底层错误。
- 涉及网络和命令执行必须有超时。

## React/TypeScript 规则

- 组件层负责交互和展示，不直接维护跨组件业务状态。
- 跨组件状态进入 Zustand store。
- Wails 调用必须经过 `frontend/src/services/*`。
- TypeScript 类型应从 `frontend/src/types` 统一导出。
- 不新增默认 `useMemo`/`useCallback`，除非已有性能边界或依赖第三方组件稳定引用。

## 状态规则

- `topologyStore` 管理 `nodes`、`edges`、`groups`、`viewport` 和画布选择状态。
- `projectStore` 管理当前项目、文件路径和脏状态。
- `uiStore` 管理右侧面板、终端栏等 UI 状态。
- `recentStore` 和 `settingsStore` 使用 `localStorage`，不要混入项目 JSON。
- 任何改变项目内容的操作都必须标记 dirty。

## 模型变更检查表

当新增、删除或修改项目 JSON 字段时，必须同步检查：

- `internal/models/topology.go`
- `frontend/src/types/*`
- `frontend/src/services/projectService.ts` 的 `projectToWails`
- `frontend/src/services/projectService.ts` 的 `projectFromWails`
- 相关 UI 面板和 store
- `knowledge/modules/topology-domain.md`
- `docs/adr/ADR-002-topology-json-format-versioning.md`

## Wails API 变更检查表

当新增或修改 Go 暴露给前端的方法时，必须同步检查：

- `app.go`
- 对应 `internal/*` service
- Wails 生成绑定 `frontend/wailsjs` 是否需要重新生成
- `frontend/src/services/*` 是否有封装
- 调用组件是否只依赖 service 封装
- `knowledge/modules/wails-bridge.md`

## 安全规则

- 节点 SSH/RDP 密码和私钥目前会写入项目 JSON，新增功能不得扩大该风险。
- 命令执行功能必须保留执行结果、错误和退出码展示。
- 涉及本地命令或 SSH 命令的功能，应避免静默执行。
- 不要在日志、错误消息或文档示例中写入真实凭证。

## 验证规则

- 文档类改动：至少检查新增文件路径和 `git diff`。
- Go 代码改动：运行 `go test ./...`。
- 前端代码改动：在 `frontend` 目录运行 `npm run build`。
- 同时改 Go 绑定和前端调用：优先运行 `wails dev` 或 `wails build` 做集成验证。
