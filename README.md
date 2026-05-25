# TopoDesk

运维拓扑管理桌面工具。管理和可视化服务器节点、连接关系、软件信息、远程连接和常用命令。

## 技术栈

- **[Wails v2](https://wails.io)** — 桌面框架
- **Go** — 后端：项目持久化、SSH、RDP、本地命令执行
- **React 18 + TypeScript + Vite** — 前端
- **Ant Design** — UI 组件库
- **[React Flow](https://reactflow.dev)** — 拓扑画布
- **Zustand** — 前端状态管理

## 快速开始

### 前置条件

- Go 1.26+
- Node.js 18+
- [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### 开发

```bash
wails dev
```

### 构建

```bash
wails build
```

## 项目结构

```text
topodesk/
├── main.go                  # Wails 应用入口
├── app.go                   # Wails API 门面
├── internal/
│   ├── models/              # 领域模型（项目 JSON 格式）
│   ├── project/             # 项目创建、保存、加载
│   ├── storage/             # 文件系统辅助
│   ├── ssh/                 # SSH 连接测试与远程命令
│   ├── rdp/                 # RDP 连接测试
│   └── cmdexec/             # 本地命令执行
├── frontend/
│   └── src/
│       ├── components/      # UI 组件
│       │   ├── layout/      # 布局、工具栏、画布、终端栏
│       │   ├── topology/    # React Flow 节点、分组、连线、右键菜单
│       │   └── panels/      # 属性编辑面板
│       ├── stores/          # Zustand 状态
│       ├── services/        # 前端 API 封装
│       ├── types/           # TypeScript 类型定义
│       └── hooks/           # 自定义 hooks
└── docs/
    └── adr/                 # 架构决策记录
```

## AI 协作

本项目已适配 AI 协作，详见以下知识文件：

- `.ai/project.md` — 项目定位与技术栈
- `.ai/architecture.md` — 架构与数据流
- `.ai/coding-rules.md` — 编码规则与检查表
- `.ai/module-boundary.md` — 模块边界矩阵
- `knowledge/modules/*` — 各模块详细知识
- `docs/adr/*` — 架构决策记录

## 文件格式

项目数据保存为 `.topology.json` 文件（当前版本 1）。JSON 结构定义见 `internal/models/topology.go`。
