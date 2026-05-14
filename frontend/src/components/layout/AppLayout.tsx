import { useEffect } from 'react'
import { Layout } from 'antd'
import { Toolbar } from './Toolbar'
import { Sidebar } from './Sidebar'
import { CanvasArea } from './CanvasArea'
import { NodePanel } from '../panels/NodePanel'
import { EdgePanel } from '../panels/EdgePanel'
import { useUIStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { useTopologyStore } from '../../stores/topologyStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { OnFileDrop, OnFileDropOff } from '../../../wailsjs/runtime/runtime'
import { LoadProject } from '../../services/projectService'

const { Header, Sider, Content } = Layout

export function AppLayout() {
  const activePanel = useUIStore((s) => s.activePanel)
  const colors = useThemeColors()
  const currentProject = useProjectStore((s) => s.currentProject)
  const createBlank = useProjectStore((s) => s.createBlank)
  const setProject = useProjectStore((s) => s.setProject)
  const setFilePath = useProjectStore((s) => s.setFilePath)
  const loadFromProject = useTopologyStore((s) => s.loadFromProject)

  useEffect(() => {
    if (!currentProject) {
      createBlank().then(() => {
        const project = useProjectStore.getState().currentProject
        if (project) {
          loadFromProject(project.nodes, project.edges, project.groups, project.viewport)
        }
      })
    }
  }, [])

  useEffect(() => {
    OnFileDrop((_x: number, _y: number, paths: string[]) => {
      if (paths.length === 0) return
      const path = paths[0]
      if (!path.endsWith('.topology.json') && !path.endsWith('.json')) return

      LoadProject(path).then((project) => {
        if (project) {
          loadFromProject(project.nodes, project.edges, project.groups, project.viewport)
          setProject(project)
          setFilePath(path)
        }
      })
    }, false)

    return () => {
      OnFileDropOff()
    }
  }, [loadFromProject, setProject, setFilePath])

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{
        height: 40,
        lineHeight: '40px',
        padding: '0 8px',
        background: colors.toolbarBg,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <Toolbar />
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colors.sidebarBg, borderRight: `1px solid ${colors.border}` }}>
          <Sidebar />
        </Sider>
        <Content style={{ background: colors.bgCanvas }}>
          <CanvasArea />
        </Content>
        {activePanel && (
          <Sider width={340} style={{ background: colors.panelBg, borderLeft: `1px solid ${colors.border}` }}>
            {activePanel === 'node' && <NodePanel />}
            {activePanel === 'edge' && <EdgePanel />}
          </Sider>
        )}
      </Layout>
    </Layout>
  )
}
