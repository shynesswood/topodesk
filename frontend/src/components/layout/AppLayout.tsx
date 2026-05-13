import { Layout } from 'antd'
import { Toolbar } from './Toolbar'
import { Sidebar } from './Sidebar'
import { CanvasArea } from './CanvasArea'
import { NodePanel } from '../panels/NodePanel'
import { EdgePanel } from '../panels/EdgePanel'
import { useUIStore } from '../../stores/uiStore'
import { useThemeColors } from '../../hooks/useThemeColors'

const { Header, Sider, Content } = Layout

export function AppLayout() {
  const activePanel = useUIStore((s) => s.activePanel)
  const colors = useThemeColors()

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
