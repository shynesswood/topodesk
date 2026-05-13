import { ConfigProvider, theme } from 'antd'
import { ReactFlowProvider } from '@xyflow/react'
import { AppLayout } from './components/layout/AppLayout'
import { useSettingsStore } from './stores/settingsStore'
import './App.css'

function App() {
  const themeMode = useSettingsStore((s) => s.theme)

  return (
    <ConfigProvider
      theme={{
        algorithm: themeMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          borderRadius: 4,
        },
      }}
    >
      <ReactFlowProvider>
        <AppLayout />
      </ReactFlowProvider>
    </ConfigProvider>
  )
}

export default App
