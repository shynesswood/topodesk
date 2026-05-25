# 测试 Prompt 模板

## 使用方式

配合具体需求生成测试用例或验证步骤。

## 前置知识加载

- `.ai/project.md`
- `.ai/architecture.md`
- `.ai/coding-rules.md`
- `.ai/module-boundary.md`
- 相关 `knowledge/modules/*.md`

## 测试范围分类

### 单元测试建议

| 模块 | 测试重点 | 验证方式 |
| --- | --- | --- |
| `internal/project` | 新建、保存、加载、无效 JSON 处理 | `go test -run TestProject` |
| `internal/ssh` | 连接参数校验、超时、认证失败 | `go test -run TestSSH` |
| `internal/cmdexec` | 正常执行、超时、命令不存在 | `go test -run TestExec` |
| `frontend/src/services/projectService.ts` | 双向转换一致性、字段完整 | 前端测试 |
| `topologyStore` | 增删移动节点/连线/分组、dirty 状态 | 前端测试 |

### 集成/验收测试建议

- 新建项目 → 添加节点 → 编辑属性 → 保存 → 关闭 → 重新打开 → 确认数据完整。
- 创建多个节点 → 添加连线 → 创建分组 → 拖入节点 → 保存 → 重新打开 → 确认拓扑一致。
- 为节点配置 SSH → 测试连接 → 配置命令 → 右键执行 → 确认终端栏输出。
- 切换暗色/明亮主题 → 确认所有组件颜色正确。
- 拖拽 `.topology.json` 文件到窗口 → 确认自动加载。

## 当前测试状态

项目当前没有自动化测试文件。新增功能时应优先补齐该功能相关的最关键测试用例。

## 具体需求

**[在此填写测试目标和范围]**
