# 新功能开发 Prompt 模板

## 使用方式

将此模板配合具体需求发给 AI，要求 AI 先按照前置步骤阅读项目知识，再做实现。

## 前置知识加载

在执行任何代码改动之前，请先阅读以下文件以建立项目全局理解：

- `.ai/project.md`
- `.ai/architecture.md`
- `.ai/coding-rules.md`
- `.ai/module-boundary.md`
- `.ai/glossary.md`

并根据需求涉及的模块，选择性阅读：

- `knowledge/modules/topology-domain.md`（涉及项目数据模型）
- `knowledge/modules/project-persistence.md`（涉及保存加载）
- `knowledge/modules/wails-bridge.md`（涉及前后端通信）
- `knowledge/modules/frontend-state.md`（涉及 Zustand store）
- `knowledge/modules/canvas-interaction.md`（涉及画布操作）
- `knowledge/modules/node-editing-and-commands.md`（涉及节点面板或命令）
- `knowledge/modules/remote-services.md`（涉及 SSH/RDP/本地命令）
- `knowledge/modules/theme-layout.md`（涉及主题和布局）

## 任务要求

1. 阅读上述文件中与该需求相关的部分。
2. 确认理解当前实现和模块边界。
3. 给出最小修改方案，只做需求相关的改动，不重构不相关代码。
4. 如果涉及数据模型变更，必须阅读 `schema-change.prompt.md` 和执行检查表。
5. 如果涉及新增 Go 方法暴露给前端，必须同时处理 Wails 绑定、前端 service 封装和对应 UI 组件。

## 预期输出

- 变更的文件列表及其原因。
- 关键代码修改。
- 验证方式说明。

## 需求

**[在此填写具体需求]**
