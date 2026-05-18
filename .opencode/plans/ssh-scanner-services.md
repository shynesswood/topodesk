# SSH 服务和 Scanner 服务实现计划

## 概述
实现 TopoDesk 的两个核心后端服务：SSH 远程连接服务和服务器扫描服务。

---

## 一、SSH 服务实现

### 1.1 功能清单
- SSH 连接测试（验证节点 SSH 配置）
- 远程命令执行（支持超时控制）
- 远程文件读取（通过 cat 命令）
- 大文件读取（支持 tail 限制行数）
- 命令流式输出（实时回调）
- 支持密码认证和私钥认证

### 1.2 数据结构
```go
type SSHResult struct {
    Success bool   `json:"success"`
    Message string `json:"message"`
}

type CommandResult struct {
    Stdout   string `json:"stdout"`
    Stderr   string `json:"stderr"`
    ExitCode int    `json:"exitCode"`
    Error    string `json:"error,omitempty"`
}
```

### 1.3 API 方法
| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `TestConnection` | host, port, username, password, privateKey | `SSHResult` | 测试 SSH 连接 |
| `ExecuteCommand` | host, port, username, password, privateKey, command, timeout | `CommandResult` | 执行远程命令 |
| `ReadFile` | host, port, username, password, privateKey, filePath | `(string, error)` | 读取远程文件 |
| `ReadLargeFile` | host, port, username, password, privateKey, filePath, maxLines | `(string, error)` | 读取大文件（tail） |
| `ExecuteCommandWithOutput` | host, port, username, password, privateKey, command, timeout | `(string, error)` | 简化版命令执行 |
| `StreamCommand` | host, port, username, password, privateKey, command, timeout, callback | `error` | 流式命令输出 |

### 1.4 技术要点
- 使用 `golang.org/x/crypto/ssh`（已在 go.mod 中）
- `HostKeyCallback` 使用 `ssh.InsecureIgnoreHostKey()`（本地工具可接受）
- 默认超时 10 秒，命令执行可自定义超时
- 私钥解析使用 `ssh.ParsePrivateKey`

---

## 二、Scanner 服务实现

### 2.1 功能清单
- 快速端口扫描（预定义 50+ 常用端口）
- 自定义端口扫描（用户指定端口列表）
- 端口范围扫描（如 1-1024）
- 服务识别（端口→服务名映射）
- 系统信息采集（OS、CPU、内存、磁盘）
- Docker 检测（是否安装 + 容器列表）

### 2.2 数据结构
```go
type PortInfo struct {
    Port    int    `json:"port"`
    Open    bool   `json:"open"`
    Service string `json:"service"`
}

type SystemInfo struct {
    OS        string `json:"os"`
    Hostname  string `json:"hostname"`
    Kernel    string `json:"kernel"`
    CPU       string `json:"cpu"`
    MemTotal  string `json:"memTotal"`
    MemUsed   string `json:"memUsed"`
    MemPercent float64 `json:"memPercent"`
    DiskTotal string `json:"diskTotal"`
    DiskUsed  string `json:"diskUsed"`
    DiskPercent float64 `json:"diskPercent"`
}

type ContainerInfo struct {
    ID     string `json:"id"`
    Name   string `json:"name"`
    Image  string `json:"image"`
    Status string `json:"status"`
    Ports  string `json:"ports"`
}

type DockerInfo struct {
    Installed  bool            `json:"installed"`
    Version    string          `json:"version"`
    Containers []ContainerInfo `json:"containers"`
}

type ScanResult struct {
    Host        string        `json:"host"`
    Ports       []PortInfo    `json:"ports"`
    ScanTime    time.Time     `json:"scanTime"`
    OpenCount   int           `json:"openCount"`
}
```

### 2.3 常用端口列表
```
22: SSH, 80: HTTP, 443: HTTPS, 3306: MySQL, 5432: PostgreSQL,
6379: Redis, 8080: HTTP-Alt, 8443: HTTPS-Alt, 9090: Prometheus,
27017: MongoDB, 9200: Elasticsearch, 5672: RabbitMQ, 15672: RabbitMQ-Management,
11211: Memcached, 2181: ZooKeeper, 9092: Kafka, 6443: Kubernetes,
2379: etcd, 8000: HTTP-Dev, 3000: Grafana/Node, 4000: Docker-Registry,
5000: Docker-Registry, 8888: Jupyter, 9999: Custom, 10000: Custom,
68: DHCP, 53: DNS, 25: SMTP, 110: POP3, 143: IMAP, 993: IMAPS, 995: POP3S,
135: MS-RPC, 139: NetBIOS, 445: SMB, 1433: MSSQL, 1521: Oracle,
3389: RDP, 5900: VNC, 6000: X11, 8081: HTTP-Alt, 8088: HTTP-Alt,
8888: HTTP-Alt, 9000: PHP-FPM, 9001: ETCD, 9090: Prometheus,
11211: Memcached, 27017: MongoDB
```

### 2.4 API 方法
| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `QuickScanPorts` | host, timeout | `[]PortInfo` | 扫描常用端口 |
| `CustomScanPorts` | host, ports, timeout | `[]PortInfo` | 扫描指定端口 |
| `RangeScanPorts` | host, startPort, endPort, timeout | `[]PortInfo` | 扫描端口范围 |
| `IdentifyService` | port | `string` | 端口→服务名 |
| `GetSystemInfo` | host, port, username, password, privateKey | `(SystemInfo, error)` | 获取系统信息 |
| `CheckDocker` | host, port, username, password, privateKey | `(DockerInfo, error)` | 检测 Docker |
| `FullScan` | host, port, username, password, privateKey, timeout | `(ScanResult, SystemInfo, DockerInfo, error)` | 完整扫描 |

### 2.5 技术要点
- 端口扫描使用 `net.DialTimeout` 并发执行
- 使用 goroutine + channel 实现并发扫描
- 系统信息通过 SSH 执行系统命令获取
- Docker 检测通过 `docker info` 和 `docker ps` 命令

---

## 三、app.go 暴露方法

### 3.1 SSH 相关
```go
func (a *App) SSHTestConnection(host string, port int, username, password, privateKey string) SSHResult
func (a *App) SSHExecuteCommand(host string, port int, username, password, privateKey, command string, timeout int) CommandResult
func (a *App) SSHReadFile(host string, port int, username, password, privateKey, filePath string) (string, error)
```

### 3.2 Scanner 相关
```go
func (a *App) ScannerQuickScanPorts(host string, timeout int) []PortInfo
func (a *App) ScannerCustomScanPorts(host string, ports []int, timeout int) []PortInfo
func (a *App) ScannerGetSystemInfo(host string, port int, username, password, privateKey string) (SystemInfo, error)
func (a *App) ScannerCheckDocker(host string, port int, username, password, privateKey string) (DockerInfo, error)
```

---

## 四、实现步骤

1. **实现 `internal/ssh/ssh_service.go`**
   - 连接测试
   - 命令执行
   - 文件读取
   - 流式输出

2. **实现 `internal/scanner/scanner_service.go`**
   - 端口扫描（快速/自定义/范围）
   - 服务识别
   - 系统信息采集
   - Docker 检测

3. **更新 `app.go`**
   - 添加 SSH 桥接方法
   - 添加 Scanner 桥接方法

4. **更新 `go.mod`**
   - 确保 `golang.org/x/crypto` 为 direct dependency

5. **编译验证**
   - `go build` 检查编译
   - `go mod tidy` 清理依赖

---

## 五、风险与注意事项

1. **SSH 私钥格式** - 支持 PEM 格式，不支持加密私钥
2. **端口扫描速度** - 大量端口扫描可能较慢，需合理设置超时
3. **防火墙干扰** - 某些端口可能被防火墙拦截，扫描结果可能不准确
4. **权限问题** - 某些系统命令可能需要 sudo 权限
5. **安全性** - `InsecureIgnoreHostKey` 不适用于生产环境，但本地工具可接受
