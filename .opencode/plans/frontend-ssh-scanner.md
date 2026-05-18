# SSH 和 Scanner 前端功能实现计划

## 概述
为 TopoDesk 前端添加 SSH 远程操作和服务器扫描功能。

---

## 一、服务层实现

### 1.1 SSH 服务 (`services/sshService.ts`)
封装 Wails 后端 SSH 方法：
- `testConnection(host, port, username, password, privateKey)` - 测试连接
- `executeCommand(host, port, username, password, privateKey, command, timeout)` - 执行命令
- `readFile(host, port, username, password, privateKey, filePath)` - 读取文件
- `readLargeFile(host, port, username, password, privateKey, filePath, maxLines)` - 读取大文件

### 1.2 Scanner 服务 (`services/scannerService.ts`)
封装 Wails 后端 Scanner 方法：
- `quickScanPorts(host, timeout)` - 快速扫描
- `customScanPorts(host, ports, timeout)` - 自定义扫描
- `rangeScanPorts(host, startPort, endPort, timeout)` - 范围扫描
- `getSystemInfo(host, port, username, password, privateKey)` - 系统信息
- `checkDocker(host, port, username, password, privateKey)` - Docker 检测

---

## 二、UI 组件实现

### 2.1 NodePanel 增强
在现有节点详情面板的 SSH 信息区域添加：
- SSH 连接测试按钮
- 远程命令执行区域
- 远程文件读取区域

### 2.2 ScannerPanel 新建
新建扫描面板，包含：
- 端口扫描区域（快速/自定义/范围）
- 扫描结果表格
- 系统信息展示
- Docker 信息展示

### 2.3 状态管理更新
更新 `uiStore.ts`：
- 添加 `scanner` 面板类型
- 添加 `openScannerPanel(nodeId)` 方法

### 2.4 节点组件增强
更新 `TopologyNode.tsx`：
- 添加 SSH 连接状态指示器（可选）

### 2.5 侧边栏增强
更新 `Sidebar.tsx`：
- 添加扫描工具入口

---

## 三、实现步骤

1. 创建 `services/sshService.ts`
2. 创建 `services/scannerService.ts`
3. 更新 `stores/uiStore.ts`
4. 创建 `components/panels/ScannerPanel.tsx`
5. 更新 `components/panels/NodePanel.tsx`
6. 更新 `components/layout/AppLayout.tsx`
7. 更新 `components/layout/Sidebar.tsx`
8. 更新 `wailsjs` 模型（运行 `wails generate module`）
