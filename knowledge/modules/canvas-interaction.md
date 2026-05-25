# 模块知识：画布交互

## 职责

通过 React Flow 展示和编辑拓扑，包括节点、连线、分组、拖拽、选择、删除、右键菜单和小地图。

## 主要文件

- 画布容器：`frontend/src/components/layout/CanvasArea.tsx`
- 普通节点：`frontend/src/components/topology/TopologyNode.tsx`
- 分组节点：`frontend/src/components/topology/GroupNode.tsx`
- 连线组件：`frontend/src/components/topology/TopologyEdge.tsx`
- 右键菜单：`frontend/src/components/topology/NodeContextMenu.tsx`
- 拓扑树：`frontend/src/components/topology/TopologyTree.tsx`
- 拓扑状态：`frontend/src/stores/topologyStore.ts`

## React Flow 映射

- 业务节点 `TopologyNode` 映射为 React Flow node type `topology-node`。
- 业务分组 `Group` 映射为 React Flow node type `topology-group`。
- 业务连线 `TopologyEdge` 映射为 React Flow edge type `topology-edge`。

## 关键交互

- 点击节点打开 `NodePanel`。
- 点击分组打开 `GroupPanel`。
- 点击连线打开 `EdgePanel`。
- 拖动节点更新节点位置并根据中心点加入或离开分组。
- 拖动分组会同步移动组内节点。
- 调整分组大小后重新计算成员节点。
- Delete 或 Backspace 删除选中节点、分组或连线。
- 右键普通节点打开命令和编辑菜单。

## 注意点

- `CanvasArea` 是画布交互的集中点，容易变大，新增逻辑时尽量保持边界清晰。
- React Flow 的节点 ID 同时用于业务节点和分组，需要通过 `groups` 判断 ID 类型。
- 分组成员关系是 `Group.nodeIds`，不是 React Flow 父子节点。
- 连线 handle 字段如果要持久化，必须纳入 Go/TS 模型和转换逻辑。

## 禁止事项

- 不要在 React Flow 节点 data 中保存唯一权威数据，权威数据必须在 store 中。
- 不要直接修改 `nodes`、`edges`、`groups` 数组对象，应通过 store action。
- 不要让拓扑组件直接保存文件。

## 验证方式

- 新增、移动、删除节点后树和画布一致。
- 节点拖入拖出分组后 `Group.nodeIds` 正确变化。
- 保存重新打开后节点、连线、分组位置不丢失。
