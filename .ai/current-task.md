# 当前任务

## 任务目标

将 TopoDesk 建设为适合 AI 协作的项目，并修复当前已知的安全和工程问题。

## 当前状态

- [x] 修复 `frontend/src/services/projectService.ts` 中模型保存加载不同步问题
  - Node 新增 `os`、`rdp`、`commands` 字段的双向转换
  - Edge 新增 `sourceHandle`、`targetHandle` 字段的双向转换
  - Go 模型 `Edge` 新增 `SourceHandle`、`TargetHandle` 字段
  - Wails 生成模型 `models.ts` 同步更新
- [x] 补充项目 README，替换 Wails 模板说明
- [x] 增加验证脚本 `verify.ps1`（go test + npm build）
- [x] 评估 SSH/RDP 凭证存储风险，产出 `docs/credential-storage-assessment.md`
  - 落地快速缓解：文件权限 0600、`.gitignore` 屏蔽 `*.topology.json`
- [x] `Toolbar.tsx` 中直接调用 wailsjs 的 `GetVersion` 收敛到 `services/appService.ts`
- [x] SSH `InsecureIgnoreHostKey` 回退（不需要 IP 可信校验，由运维人员自己控制）

## 下一步建议

- [ ] 补充关键功能的 Go 单元测试（`internal/project`、`internal/ssh`）
- [ ] 前端 projectService 双向转换的一致性测试
- [ ] 引入项目文件 AES-GCM 加密（凭证评估阶段 2）
- [ ] 新建项目时添加凭证安全提示弹窗

## 更新规则

每次 AI 开始一个较大的功能任务时，应更新本文件的任务目标、当前状态和下一步建议。
