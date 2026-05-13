import { Form, Input, Select, Button } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { useProjectStore } from '../../stores/projectStore'
import { EDGE_TYPES } from '../../types'

export function EdgePanel() {
  const selectedEdgeId = useUIStore((s) => s.selectedEdgeId)
  const closePanel = useUIStore((s) => s.closePanel)
  const edges = useTopologyStore((s) => s.edges)
  const nodes = useTopologyStore((s) => s.nodes)
  const updateEdge = useTopologyStore((s) => s.updateEdge)
  const removeEdge = useTopologyStore((s) => s.removeEdge)
  const markDirty = useProjectStore((s) => s.markDirty)

  const edge = edges.find((e) => e.id === selectedEdgeId)
  if (!edge) return null

  const sourceNode = nodes.find((n) => n.id === edge.source)
  const targetNode = nodes.find((n) => n.id === edge.target)

  function handleChange(field: string, value: unknown) {
    updateEdge(edge!.id, { [field]: value })
    markDirty()
  }

  function handleDelete() {
    removeEdge(edge!.id)
    closePanel()
  }

  return (
    <div style={{ padding: 12, overflow: 'auto', height: '100%', fontSize: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 13 }}>连线详情</h4>
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={handleDelete} />
      </div>

      <div style={{ opacity: 0.7, marginBottom: 12, lineHeight: 1.6 }}>
        {sourceNode?.name || edge.source} → {targetNode?.name || edge.target}
      </div>

      <Form layout="vertical" size="small">
        <Form.Item label="连线类型" style={{ marginBottom: 8 }}>
          <Select
            value={edge.type || 'Custom'}
            onChange={(v) => handleChange('type', v)}
            options={EDGE_TYPES.map((t) => ({ label: t, value: t }))}
          />
        </Form.Item>
        <Form.Item label="标签" style={{ marginBottom: 8 }}>
          <Input
            value={edge.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="HTTP / RPC / 数据库..."
          />
        </Form.Item>
      </Form>
    </div>
  )
}
