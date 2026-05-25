# ADR-004: Wails 生成绑定策略

## 状态

已接受

## 决策

`frontend/wailsjs` 由 Wails 根据 `app.go` 绑定自动生成，不手工编辑。前端业务代码通过 `frontend/src/services/*` 封装访问 Wails API。

## 理由

- 生成代码变更频繁且不包含业务语义，手工编辑会被覆盖或破坏契约。
- Service 层提供业务含义清晰的函数名和返回类型，方便组件调用和测试。
- Service 层可以在调用前后统一处理错误和状态，对上层组件透明。

## 影响

- 新增 Go 方法后必须同步补充前端 service 封装。
- 现有少量直接导入 `frontend/wailsjs/go/main/App` 的组件应逐步迁移到 service。
- 共享的 Wails 模型（如 `TopologyProject`）通过 `projectService` 的双向转换函数处理。

## 当前状态

- `Toolbar.tsx` 直接调用了 `GetVersion` 和 `SaveFileDialog`，需逐步收敛。
- `AppLayout.tsx` 通过 runtime 使用 `OnFileDrop`，这是 Wails 运行时事件，不是绑定方法，可以保留。

## 替代方案

| 方案 | 否决原因 |
| --- | --- |
| 组件直接调用 Wails 绑定 | 业务逻辑散落、类型不安全、难以测试 |
| 在 store action 中调用 Wails | store 不应依赖 Wails |
