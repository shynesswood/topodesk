import { TopologyNode } from './node'
import { TopologyEdge } from './edge'

export interface Group {
  id: string
  name: string
  color?: string
  nodeIds: string[]
}

export interface Viewport {
  x: number
  y: number
  zoom: number
}

export interface TopologyProject {
  version: number
  project: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
  nodes: TopologyNode[]
  edges: TopologyEdge[]
  groups: Group[]
  viewport: Viewport
}
