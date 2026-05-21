import { useMemo } from 'react'
import { Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { useTopologyStore } from '../../stores/topologyStore'
import { useUIStore } from '../../stores/uiStore'
import { useThemeColors } from '../../hooks/useThemeColors'

export function TopologyTree() {
  const nodes = useTopologyStore((s) => s.nodes)
  const groups = useTopologyStore((s) => s.groups)
  const setSelectedNodeIds = useTopologyStore((s) => s.setSelectedNodeIds)
  const openNodePanel = useUIStore((s) => s.openNodePanel)
  const openGroupPanel = useUIStore((s) => s.openGroupPanel)
  const colors = useThemeColors()

  const treeData = useMemo((): DataNode[] => {
    const groupedNodeIds = new Set<string>()
    const groupChildren: DataNode[] = []

    for (const g of groups) {
      for (const nid of g.nodeIds) groupedNodeIds.add(nid)
      const children: DataNode[] = []
      for (const nid of g.nodeIds) {
        const node = nodes.find((n) => n.id === nid)
        if (node) {
          children.push({
            key: node.id,
            title: node.name,
            icon: '\u{1F5A5}',
            isLeaf: true,
          })
        }
      }
      groupChildren.push({
        key: g.id,
        title: g.name,
        icon: '\u{1F4E6}',
        children,
      })
    }

    const ungrouped: DataNode[] = []
    for (const n of nodes) {
      if (!groupedNodeIds.has(n.id)) {
        ungrouped.push({
          key: n.id,
          title: n.name,
          icon: '\u{1F5A5}',
          isLeaf: true,
        })
      }
    }

    return [...groupChildren, ...ungrouped]
  }, [nodes, groups])

  function handleSelect(selectedKeys: React.Key[]) {
    if (selectedKeys.length === 0) return
    const id = selectedKeys[0] as string
    const isGroup = groups.some((g) => g.id === id)
    if (isGroup) {
      setSelectedNodeIds([id])
      openGroupPanel(id)
    } else {
      setSelectedNodeIds([id])
      openNodePanel(id)
    }
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        color: colors.textSecondary,
        fontSize: 10,
        textTransform: 'uppercase',
        marginBottom: 4,
        paddingLeft: 4,
      }}>
        拓扑结构 ({nodes.length} 节点, {groups.length} 分组)
      </div>
      <Tree
        treeData={treeData}
        onSelect={handleSelect}
        showIcon
        selectedKeys={[]}
        blockNode
        style={{
          background: 'transparent',
          color: colors.textPrimary,
          fontSize: 11,
        }}
      />
    </div>
  )
}
