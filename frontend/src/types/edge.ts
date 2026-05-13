export interface TopologyEdge {
  id: string
  source: string
  target: string
  type?: string
  label?: string
}

export const EDGE_TYPES = [
  'HTTP',
  'HTTPS',
  'TCP',
  'MySQL',
  'Redis',
  'MQ',
  'RPC',
  'SSH',
  'Custom',
] as const

export type EdgeType = (typeof EDGE_TYPES)[number]
