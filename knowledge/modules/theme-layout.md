# 模块知识：主题与布局

## 职责

管理应用整体布局、明暗主题、工具栏、侧边栏、画布区域、右侧属性面板和底部终端栏。

## 主要文件

- 应用入口：`frontend/src/App.tsx`
- 主布局：`frontend/src/components/layout/AppLayout.tsx`
- 工具栏：`frontend/src/components/layout/Toolbar.tsx`
- 侧边栏：`frontend/src/components/layout/Sidebar.tsx`
- 画布区域：`frontend/src/components/layout/CanvasArea.tsx`
- 终端栏：`frontend/src/components/layout/TerminalBar.tsx`
- 主题颜色：`frontend/src/hooks/useThemeColors.ts`
- 主题状态：`frontend/src/stores/settingsStore.ts`

## 布局结构

```text
App
  -> ConfigProvider
  -> ReactFlowProvider
  -> AppLayout
       -> Header / Toolbar
       -> Sider / Sidebar
       -> Content / CanvasArea
       -> optional right Sider / NodePanel | EdgePanel | GroupPanel
```

## 主题规则

- Ant Design 主题算法由 `settingsStore.theme` 控制。
- 业务自定义颜色通过 `useThemeColors()` 获取。
- 主题目前只支持 `dark` 和 `light`。
- 主题偏好保存在 `localStorage` 的 `topodesk-theme`。

## UI 状态

- 右侧面板是否显示由 `uiStore.activePanel` 决定。
- 终端栏高度、可见性和输出记录由 `uiStore.terminalBar` 决定。
- 最近项目列表由 `recentStore` 决定。

## 禁止事项

- 不要在多个组件中复制维护颜色常量，优先扩展 `useThemeColors()`。
- 不要把主题、最近项目、终端栏状态写入项目 JSON。
- 不要让 layout 组件承担底层数据转换逻辑。

## 验证方式

- 切换明暗主题后工具栏、侧边栏、画布、节点和面板颜色一致。
- 打开和关闭右侧面板不影响拓扑数据。
- 终端栏调整高度、隐藏、清空输出正常。
