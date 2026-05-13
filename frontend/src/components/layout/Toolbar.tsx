import { useState } from 'react'
import { Button, Space, Tooltip, Input } from 'antd'
import {
  SaveOutlined,
  FolderOpenOutlined,
  FileAddOutlined,
  UndoOutlined,
  RedoOutlined,
  AimOutlined,
  SunOutlined,
  MoonOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { useProjectStore } from '../../stores/projectStore'
import { useTopologyStore } from '../../stores/topologyStore'
import { useSettingsStore } from '../../stores/settingsStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import {
  NewProject,
  SaveProject,
  LoadProject,
  OpenFileDialog,
  SaveFileDialog,
} from '../../services/projectService'

export function Toolbar() {
  const { currentProject, isDirty, setProject, markSaved, setFilePath } = useProjectStore()
  const { nodes, edges, groups, viewport, loadFromProject } = useTopologyStore()
  const { theme, toggleTheme } = useSettingsStore()
  const colors = useThemeColors()

  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState('')

  function startEditName() {
    if (!currentProject) return
    setTempName(currentProject.project.name)
    setEditingName(true)
  }

  function confirmEditName() {
    if (!currentProject || !tempName.trim()) return
    setProject({
      ...currentProject,
      project: { ...currentProject.project, name: tempName.trim() },
    })
    useProjectStore.getState().markDirty()
    setEditingName(false)
  }

  function cancelEditName() {
    setEditingName(false)
  }

  async function handleNewProject() {
    const name = prompt('请输入项目名称:')
    if (!name) return
    const project = await NewProject(name)
    if (project) {
      loadFromProject(project.nodes, project.edges, project.groups, project.viewport)
      setProject(project)
      setFilePath(null)
    }
  }

  async function handleOpenProject() {
    const path = await OpenFileDialog()
    if (!path) return
    const project = await LoadProject(path)
    if (project) {
      loadFromProject(project.nodes, project.edges, project.groups, project.viewport)
      setProject(project)
      setFilePath(path)
    }
  }

  async function handleSaveProject() {
    const project = currentProject
    if (!project) return

    let path = useProjectStore.getState().filePath
    if (!path) {
      path = await SaveFileDialog()
      if (!path) return
      setFilePath(path)
    }

    const finalProject = {
      ...project,
      nodes: [...nodes],
      edges: [...edges],
      groups: [...groups],
      viewport: { ...viewport },
    }

    await SaveProject(finalProject, path)
    markSaved()
  }

  function handleAutoLayout() {
    const updated = nodes.map((n, i) => ({
      ...n,
      position: {
        x: 100 + (i % 4) * 200,
        y: 100 + Math.floor(i / 4) * 150,
      },
    }))
    useTopologyStore.setState({ nodes: updated })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <Space size="small">
        <Tooltip title="新建项目">
          <Button type="text" size="small" icon={<FileAddOutlined />} onClick={handleNewProject} />
        </Tooltip>
        <Tooltip title="打开项目">
          <Button type="text" size="small" icon={<FolderOpenOutlined />} onClick={handleOpenProject} />
        </Tooltip>
        <Tooltip title="保存项目">
          <Button type="text" size="small" icon={<SaveOutlined />} onClick={handleSaveProject} />
        </Tooltip>
      </Space>
      <div style={{ borderLeft: `1px solid ${colors.border}`, height: 20, margin: '0 8px' }} />
      <Space size="small">
        <Tooltip title="自动布局">
          <Button type="text" size="small" icon={<AimOutlined />} onClick={handleAutoLayout} />
        </Tooltip>
        <Tooltip title="撤销">
          <Button type="text" size="small" icon={<UndoOutlined />} disabled />
        </Tooltip>
        <Tooltip title="重做">
          <Button type="text" size="small" icon={<RedoOutlined />} disabled />
        </Tooltip>
      </Space>

      {currentProject && (
        <span style={{ marginLeft: 16, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          {editingName ? (
            <>
              <Input
                size="small"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onPressEnter={confirmEditName}
                style={{ width: 160, height: 24 }}
                autoFocus
              />
              <Button type="text" size="small" icon={<CheckOutlined />} onClick={confirmEditName} />
              <Button type="text" size="small" icon={<CloseOutlined />} onClick={cancelEditName} />
            </>
          ) : (
            <>
              <span style={{ color: colors.textPrimary }}>
                {currentProject.project.name}
              </span>
              <Button type="text" size="small" icon={<EditOutlined />} onClick={startEditName} />
              {isDirty && <span style={{ color: colors.textSecondary, marginLeft: 4 }}>(未保存)</span>}
            </>
          )}
        </span>
      )}

      <div style={{ flex: 1 }} />
      <Tooltip title={theme === 'dark' ? '切换明亮模式' : '切换暗黑模式'}>
        <Button
          type="text"
          size="small"
          icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
        />
      </Tooltip>
    </div>
  )
}
