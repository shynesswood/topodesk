import { useState } from 'react'
import { Button, Space, Tooltip, Input, message } from 'antd'
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
  SaveProject,
  LoadProject,
  OpenFileDialog,
  SaveFileDialog,
} from '../../services/projectService'

export function Toolbar() {
  const { currentProject, isDirty, setProject, markSaved, setFilePath, createBlank } = useProjectStore()
  const { nodes, edges, groups, viewport, loadFromProject } = useTopologyStore()
  const { theme, toggleTheme } = useSettingsStore()
  const colors = useThemeColors()

  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [saving, setSaving] = useState(false)

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
    await createBlank()
    const project = useProjectStore.getState().currentProject
    if (project) {
      loadFromProject(project.nodes, project.edges, project.groups, project.viewport)
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
    if (!currentProject) return

    const state = useProjectStore.getState()
    if (!state.isDirty) {
      message.info('项目没有改动，无需保存')
      return
    }

    setSaving(true)
    try {
      let path = state.filePath
      if (!path) {
        const defaultName = `${currentProject.project.name}.topology.json`
        path = await SaveFileDialog(defaultName)
        if (!path) { setSaving(false); return }
        setFilePath(path)
      }

      const finalProject = {
        ...currentProject,
        nodes: [...nodes],
        edges: [...edges],
        groups: [...groups],
        viewport: { ...viewport },
      }

      await SaveProject(finalProject, path)
      markSaved()
      message.success('项目已保存')
    } catch (e) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  function handleAutoLayout() {
    const updated = nodes.map((n, i) => ({
      ...n,
      position: {
        x: 100 + (i % 4) * 200,
        y: 100 + Math.floor(i / 4) * 150,
      },
    }))
    useTopologyStore.getState().setNodes(updated)
  }

  const hasProject = currentProject !== null
  const shortName = currentProject?.project.name.length
    ? (currentProject.project.name.length > 16
      ? currentProject.project.name.slice(0, 16) + '...'
      : currentProject.project.name)
    : ''

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <Space size="small">
        <Tooltip title="新建项目">
          <Button type="text" size="small" icon={<FileAddOutlined />} onClick={handleNewProject} />
        </Tooltip>
        <Tooltip title="打开项目">
          <Button type="text" size="small" icon={<FolderOpenOutlined />} onClick={handleOpenProject} />
        </Tooltip>
        <Tooltip title={isDirty ? '项目已修改，点击保存' : '项目未修改'}>
          <Button
            type="text"
            size="small"
            icon={<SaveOutlined />}
            onClick={handleSaveProject}
            disabled={!hasProject}
            loading={saving}
            style={!isDirty && hasProject ? { opacity: 0.4 } : undefined}
          />
        </Tooltip>
      </Space>
      <div style={{ borderLeft: `1px solid ${colors.border}`, height: 20, margin: '0 8px' }} />
      <Space size="small">
        <Tooltip title="自动布局">
          <Button type="text" size="small" icon={<AimOutlined />} onClick={handleAutoLayout} disabled={!hasProject} />
        </Tooltip>
        <Tooltip title="撤销">
          <Button type="text" size="small" icon={<UndoOutlined />} disabled />
        </Tooltip>
        <Tooltip title="重做">
          <Button type="text" size="small" icon={<RedoOutlined />} disabled />
        </Tooltip>
      </Space>

      {hasProject && (
        <span style={{ marginLeft: 14, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
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
              <span style={{ color: colors.textPrimary, fontWeight: 600 }}>
                {shortName}
              </span>
              <Button type="text" size="small" icon={<EditOutlined />} onClick={startEditName} />
              {isDirty && (
                <span style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#f5a623',
                  flexShrink: 0,
                }} title="有未保存的修改" />
              )}
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
