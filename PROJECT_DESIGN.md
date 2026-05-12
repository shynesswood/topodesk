# 运维拓扑管理工具（Topology Manager）

## 一、项目背景

当前维护多个项目环境，每个项目涉及大量服务器、数据库、中间件、第三方接口等资源。

这些资源之间存在复杂的调用关系和依赖关系，随着项目数量增加，逐渐出现以下问题：

- 服务器信息分散
- 环境关系混乱
- 项目交接困难
- 运维知识缺失
- 缺乏统一可视化管理
- 服务调用链难以梳理
- 服务器软件部署信息不透明

因此需要开发一套：

# 本地化、轻量级、可视化的运维拓扑管理工具

用于：

- 管理服务器资产
- 绘制服务依赖关系
- 保存运维信息
- 统一维护项目拓扑结构

---

# 二、项目定位

本项目定位：

# “轻量级运维拓扑与资产管理工具”

不是：

- Kubernetes 平台
- 云原生运维平台
- 自动化 CMDB
- 微服务治理平台
- 实时监控系统

核心目标：

# “帮助开发/运维人员快速理解项目结构”

---

# 三、核心功能需求

## 3.1 项目管理

支持：

- 创建项目
- 编辑项目
- 删除项目
- 项目导入导出
- 最近打开项目
- 项目快照备份

### 项目结构

一个项目包含：

- 拓扑节点
- 节点关系
- 节点详情
- 分组信息
- 画布布局信息

---

# 四、拓扑编辑器功能

## 4.1 节点管理

支持：

- 创建节点
- 删除节点
- 编辑节点
- 拖拽节点
- 缩放节点
- 复制节点
- 节点分组

---

## 4.2 节点类型

第一版支持：

- Server（服务器）
- Database（数据库）
- Redis
- MQ
- Gateway
- API
- External Service

后续支持：

- Docker
- Kubernetes
- Nginx
- LVS
- MinIO
- Elasticsearch

---

## 4.3 节点信息

每个节点包含：

### 基础信息

- 节点名称
- 节点类型
- IP地址
- 端口
- 环境
- 标签
- 描述

### SSH信息

- 用户名
- 密码
- 私钥
- SSH端口

### 软件信息

- 软件名称
- 安装目录
- 启动命令
- 日志目录
- 配置文件目录

### 自定义扩展字段

支持动态Key-Value扩展。

---

## 4.4 连线管理

支持：

- 创建连线
- 删除连线
- 修改连线
- 连线方向
- 连线标签
- 连线类型

### 连线类型

包括：

- HTTP
- HTTPS
- TCP
- MySQL
- Redis
- MQ
- RPC
- SSH
- Custom

---

## 4.5 画布能力

支持：

- 缩放
- 平移
- 小地图
- 自动布局
- 框选
- 多选
- 对齐
- 网格吸附

---

# 五、资产管理功能

## 5.1 服务器资产

支持：

- 服务器列表
- 搜索过滤
- 环境分类
- 标签分类
- 状态颜色

---

## 5.2 环境分类

支持：

- dev
- test
- staging
- prod

---

## 5.3 标签系统

支持：

- 按系统分类
- 按项目分类
- 按部门分类
- 按环境分类

---

# 六、文件存储设计

## 6.1 第一阶段

采用：

# JSON 文件存储

优势：

- 零部署
- 可移植
- 易调试
- 易备份
- Git友好

---

## 6.2 工程文件格式

扩展名：

```text
.topology.json
```

示例：

```json
{
  "project": {
    "id": "project-001",
    "name": "水利监测系统"
  },
  "nodes": [],
  "edges": [],
  "groups": [],
  "viewport": {}
}
```

---

# 七、数据库设计（第二阶段）

第二阶段引入：

# SQLite

用于：

- 历史记录
- 最近项目
- 缓存
- 配置管理

不作为核心拓扑存储。

---

# 八、技术架构

## 8.1 技术栈

### 桌面框架

- Wails v2

### 后端

- Go 1.24+

### 前端

- React
- TypeScript
- Vite

### 图编辑器

- React Flow

### 状态管理

- Zustand

### UI组件

- Ant Design

### 数据存储

- JSON
- SQLite（后续）

---

# 九、整体架构

```text
+------------------------------------------------+
|                    Wails                       |
|                                                |
|  +----------------+    +-------------------+   |
|  | React Frontend |    |   Go Backend      |   |
|  |                |    |                   |   |
|  | React Flow     |    | SSH Manager       |   |
|  | Zustand        |    | Project Manager   |   |
|  | Ant Design     |    | File Manager      |   |
|  | Canvas Editor  |    | Scanner           |   |
|  +----------------+    +-------------------+   |
|                                                |
+------------------------------------------------+
```

---

# 十、模块划分

## 前端模块

### topology-editor

负责：

- 节点绘制
- 连线绘制
- 拖拽
- 缩放
- 编辑交互

---

### project-manager

负责：

- 工程管理
- 导入导出
- 最近项目

---

### asset-panel

负责：

- 节点详情展示
- 编辑面板

---

### toolbar

负责：

- 工具栏
- 快捷操作

---

## 后端模块

### project_service

负责：

- 工程读写
- JSON序列化
- 项目保存

---

### ssh_service

负责：

- SSH连接
- 命令执行
- 文件读取

---

### scanner_service

负责：

- 端口检测
- 服务扫描
- 环境识别

---

### storage_service

负责：

- 文件管理
- SQLite管理

---

# 十一、数据结构设计

## 11.1 Node

```ts
export interface TopologyNode {
  id: string
  type: string
  name: string
  ip?: string
  port?: number

  position: {
    x: number
    y: number
  }

  ssh?: {
    username?: string
    password?: string
    privateKey?: string
    port?: number
  }

  software?: SoftwareInfo[]

  tags?: string[]

  metadata?: Record<string, any>
}
```

---

## 11.2 Edge

```ts
export interface TopologyEdge {
  id: string
  source: string
  target: string
  type?: string
  label?: string
}
```

---

# 十二、项目目录规范

```text
topodesk/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   └── types/
│   └── package.json
│
├── internal/
│   ├── project/
│   ├── ssh/
│   ├── storage/
│   ├── scanner/
│   └── models/
│
├── app.go
├── main.go
│
├── docs/
├── examples/
└── README.md
```

---

# 十三、开发规范

## 13.1 前端规范

### 必须：

- 使用 TypeScript
- 禁止 any
- 组件单一职责
- Hooks优先
- Zustand统一状态管理

---

## 13.2 后端规范

### 必须：

- 使用 Go Modules
- internal目录隔离
- 错误统一处理
- 日志统一封装
- 禁止循环依赖

---

## 13.3 命名规范

### 前端

- 文件名：kebab-case
- 组件名：PascalCase

### Go

- package 小写
- 导出结构体 PascalCase
- 私有函数 camelCase

---

# 十四、UI规范

整体风格：

# 深色运维风格

要求：

- 信息密度高
- 弱装饰
- 强可读性
- 支持大拓扑图

---

## 颜色规范

### 状态颜色

- 正常：绿色
- 异常：红色
- 未知：灰色
- 警告：黄色

---

# 十五、第一阶段开发目标（MVP）

## 必须完成

### 项目管理

- 新建项目
- 保存项目
- 打开项目

---

### 拓扑编辑

- 创建节点
- 删除节点
- 创建连线
- 拖拽节点
- 保存布局

---

### 节点详情

- 编辑节点信息
- SSH信息
- 软件目录

---

### 文件管理

- JSON导入导出

---

# 十六、第二阶段规划

## 自动化能力

支持：

- SSH连接测试
- 端口扫描
- Docker识别
- Linux信息采集

---

# 十七、第三阶段规划

## 智能能力

支持：

- 自动拓扑生成
- AI关系分析
- 故障影响分析
- 自动依赖识别

---

# 十八、明确禁止事项

第一阶段禁止开发：

- 微服务架构
- 分布式系统
- 云同步
- 多人协作
- 实时监控
- Kubernetes集成
- WebSocket推送
- 消息队列
- DDD/CQRS过度设计

目标：

# 保持系统轻量化

---

# 十九、核心设计原则

## 原则1：轻量优先

优先简单方案。

---

## 原则2：本地优先

优先本地存储。

---

## 原则3：可维护优先

代码必须易读。

---

## 原则4：JSON优先

优先保证数据可迁移。

---

## 原则5：功能聚焦

只解决：

# “运维拓扑与资产管理”

不做泛化平台。

---

# 二十、最终目标

打造一个：

# “轻量级本地运维拓扑管理工具”

用于：

- 项目交接
- 环境梳理
- 运维知识沉淀
- 服务关系可视化
- 资产统一管理

核心优势：

- 单文件部署
- 本地运行
- 零依赖
- 低学习成本
- 可扩展