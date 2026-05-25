# 术语表

| 术语 | 含义 |
| --- | --- |
| TopoDesk | 当前桌面应用，面向运维拓扑管理 |
| Project | 一个拓扑项目，对应一个 `.topology.json` 文件 |
| TopologyProject | 项目 JSON 的顶层结构，包含项目信息、节点、连线、分组和视口 |
| Node | 服务器节点，包含名称、IP、系统、连接信息、软件信息和命令 |
| Edge | 节点之间的连线，表示关系或链路 |
| Group | 画布分组框，可包含多个节点 ID |
| Viewport | React Flow 画布视口位置和缩放 |
| Wails Binding | Wails 根据 Go 方法生成的前端调用代码，位于 `frontend/wailsjs` |
| Service | 前端 `services` 或后端 `internal/*` 中封装能力的模块 |
| Store | Zustand 状态模块 |
| Dirty | 项目存在未保存修改的状态 |
| Terminal Entry | 命令执行结果记录，显示在底部终端栏 |
| Local Command | 在当前桌面系统本地 shell 中执行的命令 |
| SSH Command | 通过节点 SSH 配置在远程主机执行的命令 |
| ADR | Architecture Decision Record，架构决策记录 |
