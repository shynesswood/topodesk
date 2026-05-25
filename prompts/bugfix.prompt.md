# Bug 修复 Prompt 模板

## 使用方式

将此模板配合 bug 描述发给 AI，要求 AI 先理解上下文再定位修复。

## 前置知识加载

在执行任何代码改动之前，请先阅读：

- `.ai/project.md`
- `.ai/architecture.md`
- `.ai/coding-rules.md`

并根据 bug 涉及的模块，选择性阅读对应的 `knowledge/modules/*.md`。

## 任务要求

1. 复述 bug 现象和预期行为。
2. 定位根因，说明涉及的文件和行号。
3. 给出最小修复方案。
4. 如果有类似模式存在多处的风险，说明并给出处理方案。
5. 修复后说明验证方法。

## 常见检查项

- 保存加载链路是否丢失字段（检查 `projectToWails` 和 `projectFromWails`）。
- 前端 state 更改是否遗漏 `markDirty()`。
- Go 方法是否有错误返回未被前端处理。
- 命令执行是否有超时或错误吞没。
- 主题切换后是否有组件硬编码颜色。

## Bug 描述

**[在此填写具体 bug 描述、复现步骤和环境]**
