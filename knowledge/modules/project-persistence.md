# 模块知识：项目持久化

## 职责

负责项目的新建、保存、加载、文件选择、最近打开记录和备份保存。

## 主要文件

- 后端项目服务：`internal/project/project_service.go`
- 后端文件辅助：`internal/storage/file_manager.go`
- Wails 门面：`app.go`
- 前端项目 service：`frontend/src/services/projectService.ts`
- 前端项目状态：`frontend/src/stores/projectStore.ts`
- 最近项目状态：`frontend/src/stores/recentStore.ts`
- 保存打开 UI：`frontend/src/components/layout/Toolbar.tsx`
- 拖拽打开入口：`frontend/src/components/layout/AppLayout.tsx`

## 数据流

### 新建

`projectStore.createBlank()` 调用 `NewProject('未命名项目')`，后端生成 `TopologyProject`，前端加载到 `projectStore` 和 `topologyStore`。

### 保存

`Toolbar.handleSaveProject()` 汇总当前项目元信息和拓扑运行时状态，调用 `SaveProject(finalProject, path)`，前端转换为 Wails 模型后交给 Go 后端写文件。

### 加载

`LoadProject(path)` 由 Go 后端读取 JSON，前端转换为 TypeScript 类型，再调用 `loadFromProject()` 更新拓扑 store。

### 备份

`BackupProject()` 复用保存逻辑，但不改变当前项目路径和 dirty 状态。

## 文件格式

- 约定扩展名：`.topology.json`
- 顶层结构：`TopologyProject`
- 当前版本：`version: 1`

## API

后端 `app.go` 暴露：

- `NewProject(name string)`
- `SaveProject(p *models.TopologyProject, path string)`
- `LoadProject(path string)`
- `OpenFileDialog()`
- `SaveFileDialog(defaultName string)`
- `FileExists(path string)`

前端 `projectService.ts` 暴露：

- `NewProject(name)`
- `SaveProject(project, path)`
- `LoadProject(path)`
- `OpenFileDialog()`
- `SaveFileDialog(defaultName)`
- `BackupProject(project, path)`

## 已知风险

- `projectService.ts` 的 `projectToWails` 和 `projectFromWails` 是字段丢失的高风险点。
- 如果新增字段只改了前端类型或 Go 模型，保存加载后可能静默丢失。
- 当前凭证字段会进入项目 JSON。

## 禁止事项

- 不要让 UI 组件直接使用 `os.WriteFile` 或浏览器下载来保存项目。
- 不要绕过 `projectService.ts` 调用 Wails 生成绑定。
- 不要把最近打开记录写入项目 JSON。
- 不要把 `isDirty`、选中状态、终端输出写入项目文件。

## 验证方式

- 保存后重新加载同一个文件，确认节点、连线、分组、视口字段保留。
- 检查 JSON 中是否只包含项目数据，不包含 UI 运行时状态。
- 涉及 schema 变更时，执行前端构建和 Go 测试。
