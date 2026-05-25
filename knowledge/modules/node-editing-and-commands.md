# 模块知识：节点编辑与命令

## 职责

提供节点属性编辑、SSH/RDP 连接测试、软件信息编辑、节点命令维护和右键执行命令能力。

## 主要文件

- 节点面板：`frontend/src/components/panels/NodePanel.tsx`
- 节点右键菜单：`frontend/src/components/topology/NodeContextMenu.tsx`
- 终端栏：`frontend/src/components/layout/TerminalBar.tsx`
- UI 状态：`frontend/src/stores/uiStore.ts`
- 拓扑状态：`frontend/src/stores/topologyStore.ts`
- 本地命令 service：`frontend/src/services/cmdexecService.ts`
- SSH service：`frontend/src/services/sshService.ts`
- RDP service：`frontend/src/services/rdpService.ts`

## 节点编辑范围

- 基础信息：名称、操作系统、IP、描述。
- 连接信息：Linux 默认 SSH，Windows 默认 RDP。
- 软件信息：软件名称和自定义属性。
- 命令管理：命令名称、命令内容、执行类型。

## 命令执行流程

右键节点后选择命令，`NodeContextMenu` 根据 `CommandInfo.type` 判断执行方式。

- `local`：调用 `executeLocalCommand()`，在当前本机执行。
- `ssh`：调用 `executeSSHCommand()`，在节点 IP 对应远程主机执行。

执行结果写入 `uiStore.addTerminalEntry()`，由 `TerminalBar` 显示 stdout、stderr、退出码和错误。

## 风险点

- 本地命令执行能力很强，新增快捷入口前应明确用户意图。
- SSH 命令依赖节点 IP、端口、用户名、密码或私钥。
- 当前 UI 会保存密码和私钥到项目 JSON。
- 当前执行开始和执行结束都会新增 terminal entry，可能产生两条记录。

## 禁止事项

- 不要在组件中绕过 service 直接调用 Wails command API。
- 不要在命令执行失败时吞掉 stderr、exitCode 或 error。
- 不要将命令结果写入项目 JSON。
- 不要在示例命令中包含真实生产凭证。

## 验证方式

- 编辑节点后 dirty 状态正确。
- 保存加载后节点连接信息、软件信息、命令不丢失。
- 本地命令执行后终端栏显示输出。
- SSH 配置缺失时显示明确错误。
