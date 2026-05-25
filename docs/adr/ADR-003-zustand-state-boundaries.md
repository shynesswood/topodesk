# ADR-003: Zustand 状态边界划分

## 状态

已接受

## 决策

使用 Zustand 管理前端状态，按职责拆分为 5 个 store：`topologyStore`、`projectStore`、`uiStore`、`recentStore`、`settingsStore`。

## 理由

- 每个 store 职责单一，便于理解和 AI 辅助修改。
- `topologyStore` 专注拓扑领域数据，所有拓扑变更通过该 store action。
- `projectStore` 管理当前项目元信息和 dirty 状态，作为拓扑保存的桥接点。
- 避免在组件间传递大型状态对象。

## 边界规则

| Store | 持久化 | 依赖 Wails |
| --- | --- | --- |
| topologyStore | 经过项目 JSON | 否 |
| projectStore | 运行时内存 | 否（通过 projectService） |
| uiStore | 运行时内存 | 否 |
| recentStore | localStorage | 否 |
| settingsStore | localStorage | 否 |

## 影响

- 组件不再直接持有拓扑状态副本，依赖 store 订阅。
- 项目变更必须标记 dirty，否则保存时会静默丢弃。
- 选择状态分布在 `topologyStore.selected*` 和 `uiStore.selected*` 中，需要小心同步。

## 替代方案

| 方案 | 否决原因 |
| --- | --- |
| 单一巨型 store | 职责混乱，难以协作 |
| Context + useReducer | 性能不及 Zustand，模板代码多 |
| Redux Toolkit | 相对于本项目规模过度设计 |
