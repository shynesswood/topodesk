# 模块知识：前端状态

## 职责

使用 Zustand 管理跨组件状态，将拓扑状态、项目状态、UI 状态、最近项目和设置分离。

## 主要文件

- 拓扑状态：`frontend/src/stores/topologyStore.ts`
- 项目状态：`frontend/src/stores/projectStore.ts`
- UI 状态：`frontend/src/stores/uiStore.ts`
- 最近项目：`frontend/src/stores/recentStore.ts`
- 设置状态：`frontend/src/stores/settingsStore.ts`

## Store 边界

| Store | 管理内容 | 持久化位置 |
| --- | --- | --- |
| `topologyStore` | 节点、连线、分组、视口、选择状态 | 项目 JSON 中的拓扑数据 |
| `projectStore` | 当前项目、文件路径、dirty 状态 | 运行时内存 |
| `uiStore` | 属性面板、终端栏、终端记录 | 运行时内存 |
| `recentStore` | 最近打开项目 | `localStorage` |
| `settingsStore` | 主题设置 | `localStorage` |

## Dirty 规则

- 新增、删除、移动、编辑节点需要 dirty。
- 新增、删除、编辑连线需要 dirty。
- 新增、删除、移动、调整分组需要 dirty。
- 修改视口当前不标记 dirty，除非需求明确要求保存视口变化。
- 修改项目名称需要 dirty。

## 选择状态

- 节点和分组共用 `selectedNodeIds`，分组 ID 也会进入该数组。
- 连线选择使用 `selectedEdgeIds`。
- 右侧面板当前选中项由 `uiStore` 管理。

## 禁止事项

- `topologyStore` 不应调用 Wails 或执行命令。
- `uiStore` 不应保存到项目 JSON。
- `recentStore` 和 `settingsStore` 不应依赖 Wails 后端。
- 不要在组件中复制一份长期存在的拓扑状态。

## 典型修改

新增一种 UI 弹窗状态时，优先放在 `uiStore`。

新增项目内容字段时，优先放在 `topologyStore` 或 `projectStore`，并确认保存加载链路。

新增用户本地偏好时，优先放在 `settingsStore` 并使用 `localStorage`。

## 验证方式

- 操作后 dirty 指示符合预期。
- 保存后 dirty 清除。
- 加载项目后画布、树、面板状态一致。
