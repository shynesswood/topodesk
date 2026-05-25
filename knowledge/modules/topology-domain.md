# 模块知识：拓扑领域模型

## 职责

定义 TopoDesk 项目文件的核心领域对象：项目、节点、连线、分组、视口、连接信息、软件信息和命令信息。

## 主要文件

- Go 模型：`internal/models/topology.go`
- 前端节点类型：`frontend/src/types/node.ts`
- 前端连线类型：`frontend/src/types/edge.ts`
- 前端项目类型：`frontend/src/types/project.ts`
- 前端统一导出：`frontend/src/types/index.ts`

## 核心实体

| 实体 | 说明 |
| --- | --- |
| `TopologyProject` | 项目顶层结构，包含 `version`、`project`、`nodes`、`edges`、`groups`、`viewport` |
| `ProjectInfo` | 项目 ID、名称、创建时间、更新时间 |
| `Node` / `TopologyNode` | 服务器节点，包含位置、系统、连接信息、软件和命令 |
| `Edge` / `TopologyEdge` | 节点之间的连接关系 |
| `Group` | 画布分组框，使用 `nodeIds` 关联节点 |
| `Viewport` | 画布位置和缩放 |
| `SoftwareInfo` | 节点上的软件及其属性 |
| `CommandInfo` | 节点上的可执行命令 |

## 当前字段注意点

- Go `Node` 有 `OS`、`SSH`、`RDP`、`Software`、`Commands`。
- 前端 `TopologyNode` 有 `os`、`ssh`、`rdp`、`software`、`commands`。
- Go `Edge` 有 `Type`，前端 `TopologyEdge` 当前没有 `type`，但有 `sourceHandle` 和 `targetHandle`。
- 前端保存加载转换逻辑必须显式保留所有需要持久化的字段。

## 修改规则

- 新增项目 JSON 字段必须同时更新 Go 模型、前端类型、Wails 转换逻辑和相关 UI。
- 字段命名应保持 JSON 小驼峰，例如 `privateKey`、`nodeIds`、`createdAt`。
- 不要在领域模型中加入 UI 临时状态，例如选中状态、面板状态、终端输出。
- 不要在领域模型中加入运行时对象，例如 React Flow Node、连接实例、文件句柄。

## 典型修改检查

如果给节点增加字段 `environment`：

- 更新 `internal/models/topology.go` 的 `Node`。
- 更新 `frontend/src/types/node.ts` 的 `TopologyNode`。
- 更新 `frontend/src/services/projectService.ts` 的双向转换。
- 更新 `NodePanel` 或其他编辑入口。
- 更新本文件和必要 ADR。

## 验证方式

- 前端构建：`cd frontend && npm run build`
- Go 测试：`go test ./...`
- 手动验证：创建项目、编辑字段、保存、重新打开，确认字段不丢失。
