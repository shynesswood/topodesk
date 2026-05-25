# 模块知识：远程服务与命令执行

## 职责

封装后端的 SSH、RDP 和本地命令执行能力，并通过前端 service 给 UI 使用。

## 主要文件

- SSH 后端：`internal/ssh/ssh_service.go`
- RDP 后端：`internal/rdp/rdp_service.go`
- 本地命令后端：`internal/cmdexec/cmdexec_service.go`
- Wails 门面：`app.go`
- SSH 前端 service：`frontend/src/services/sshService.ts`
- RDP 前端 service：`frontend/src/services/rdpService.ts`
- 本地命令前端 service：`frontend/src/services/cmdexecService.ts`

## 后端能力

| 服务 | 能力 | 超时 |
| --- | --- | --- |
| `SSHService` | TCP 连接、SSH 握手、测试连接、执行命令 | 连接 10 秒 |
| `RDPService` | TCP 连接并读取 RDP 握手响应 | 连接 10 秒，读取 5 秒 |
| `CmdExecService` | 根据系统调用本地 shell 执行命令 | 30 秒 |

## 前端返回结构

- 连接测试返回 `success` 和 `message`。
- 命令执行返回 `success`、`stdout`、`stderr`、`exitCode` 和可选 `error`。

## 安全风险

- `ssh.InsecureIgnoreHostKey()` 当前会跳过主机密钥校验。
- 本地命令通过 shell 执行，命令字符串具备注入风险。
- SSH 密码、私钥和 RDP 密码当前由节点字段承载并随项目保存。
- RDP 当前只是端口和协议探测，不是完整登录验证。

## 禁止事项

- 不要移除超时。
- 不要将凭证写入日志或错误提示。
- 不要在无用户动作的生命周期函数中自动执行命令。
- 不要把远程 service 和项目保存逻辑耦合。

## 未来改进方向

- 增加 SSH known_hosts 校验或用户确认机制。
- 支持凭证加密或系统钥匙串存储。
- 为本地和 SSH 命令增加执行确认和危险命令提示。
- 将执行中状态和最终结果合并为同一 terminal entry。

## 验证方式

- 使用不可达 IP 测试超时和错误提示。
- 使用错误凭证测试 SSH 错误返回。
- 使用简单本地命令验证 stdout、stderr、exitCode。
