# Schema / 数据模型变更 Prompt 模板

## 使用方式

当任务涉及新增、删除或修改项目 JSON 字段时，必须使用此模板确保完整同步。

## 前置知识加载

- `.ai/project.md`
- `.ai/architecture.md`
- `.ai/coding-rules.md`（模型变更检查表）
- `knowledge/modules/topology-domain.md`
- `knowledge/modules/project-persistence.md`
- `docs/adr/ADR-002-topology-json-format-versioning.md`

## 变更检查表

每次 Schema 变更必须在以下位置做出对应修改：

### 必须更新

- [ ] `internal/models/topology.go`（Go 模型）
- [ ] `frontend/src/types/node.ts` 或 `edge.ts` 或 `project.ts`（TS 类型）
- [ ] `frontend/src/types/index.ts` 如果需要重新导出
- [ ] `frontend/src/services/projectService.ts` 的 `projectToWails` 函数
- [ ] `frontend/src/services/projectService.ts` 的 `projectFromWails` 函数

### 可能需要更新

- [ ] `frontend/src/components/panels/NodePanel.tsx`（如果涉及节点字段）
- [ ] `frontend/src/components/panels/EdgePanel.tsx`（如果涉及连线字段）
- [ ] `frontend/src/components/panels/GroupPanel.tsx`（如果涉及分组字段）
- [ ] `frontend/src/components/topology/TopologyNode.tsx`（如果影响画布渲染）
- [ ] `frontend/src/stores/topologyStore.ts`（如果新增 action）
- [ ] `knowledge/modules/topology-domain.md`（同步文档）
- [ ] `docs/adr/ADR-002-topology-json-format-versioning.md`（如果是格式迁移）

### 验证

- [ ] Go 编译通过
- [ ] 前端 TypeScript 编译通过（`cd frontend && npm run build`）
- [ ] 新建包含新字段的项目并保存
- [ ] 重新打开保存的文件，确认新字段不丢失
- [ ] 检查 JSON 中字段命名与 Go/TS 一致

## 变更说明

**[在此填写变更目的、新增/修改的字段和 JSON 路径]**
