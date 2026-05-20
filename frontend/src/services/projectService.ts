import { models } from '../../wailsjs/go/models'
import {
  NewProject as WailsNewProject,
  SaveProject as WailsSaveProject,
  LoadProject as WailsLoadProject,
  OpenFileDialog as WailsOpenFileDialog,
  SaveFileDialog as WailsSaveFileDialog,
} from '../../wailsjs/go/main/App'
import { TopologyProject } from '../types'

function projectToWails(p: TopologyProject): models.TopologyProject {
  const wp = new models.TopologyProject()
  wp.version = p.version
  wp.project = new models.ProjectInfo()
  wp.project.id = p.project.id
  wp.project.name = p.project.name
  wp.project.createdAt = p.project.createdAt || new Date().toISOString()
  wp.project.updatedAt = p.project.updatedAt || new Date().toISOString()

  wp.nodes = p.nodes.map((n) => {
    const wn = new models.Node()
    wn.id = n.id
    wn.name = n.name
    wn.ip = n.ip
    wn.description = n.description
    wn.position = new models.Position()
    wn.position.x = n.position.x
    wn.position.y = n.position.y
    if (n.ssh) {
      wn.ssh = new models.SSHInfo()
      wn.ssh.username = n.ssh.username
      wn.ssh.password = n.ssh.password
      wn.ssh.privateKey = n.ssh.privateKey
      wn.ssh.port = n.ssh.port
    }
    wn.software = (n.software || []).map((s) => {
      const ws = new models.SoftwareInfo()
      ws.name = s.name
      ws.installPath = s.installPath
      ws.dataPath = s.dataPath
      ws.logPath = s.logPath
      ws.startCommand = s.startCommand
      ws.stopCommand = s.stopCommand
      ws.restartCommand = s.restartCommand
      return ws
    })
    return wn
  })

  wp.edges = p.edges.map((e) => {
    const we = new models.Edge()
    we.id = e.id
    we.source = e.source
    we.target = e.target
    we.label = e.label
    return we
  })

  wp.groups = p.groups.map((g) => {
    const wg = new models.Group()
    wg.id = g.id
    wg.name = g.name
    wg.color = g.color
    wg.nodeIds = Array.isArray(g.nodeIds) ? g.nodeIds : []
    wg.position = new models.Position()
    wg.position.x = g.position?.x ?? 0
    wg.position.y = g.position?.y ?? 0
    wg.width = g.width || 300
    wg.height = g.height || 200
    return wg
  })

  wp.viewport = new models.Viewport()
  wp.viewport.x = p.viewport.x
  wp.viewport.y = p.viewport.y
  wp.viewport.zoom = p.viewport.zoom

  return wp
}

function projectFromWails(wp: models.TopologyProject): TopologyProject {
  return {
    version: wp.version,
    project: {
      id: wp.project.id,
      name: wp.project.name,
      createdAt: String(wp.project.createdAt || ''),
      updatedAt: String(wp.project.updatedAt || ''),
    },
    nodes: wp.nodes.map((n) => ({
      id: n.id,
      name: n.name,
      ip: n.ip,
      description: n.description,
      position: { x: n.position.x, y: n.position.y },
      ssh: n.ssh ? {
        username: n.ssh.username,
        password: n.ssh.password,
        privateKey: n.ssh.privateKey,
        port: n.ssh.port,
      } : undefined,
      software: n.software?.map((s) => ({
        name: s.name,
        installPath: s.installPath,
        dataPath: s.dataPath,
        logPath: s.logPath,
        startCommand: s.startCommand,
        stopCommand: s.stopCommand,
        restartCommand: s.restartCommand,
      })),
    })),
    edges: wp.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
    })),
    groups: wp.groups.map((g) => ({
      id: g.id,
      name: g.name,
      color: g.color,
      nodeIds: g.nodeIds,
      position: { x: g.position?.x || 0, y: g.position?.y || 0 },
      width: g.width || 300,
      height: g.height || 200,
    })),
    viewport: {
      x: wp.viewport.x,
      y: wp.viewport.y,
      zoom: wp.viewport.zoom,
    },
  }
}

export async function NewProject(name: string): Promise<TopologyProject> {
  const wp = await WailsNewProject(name)
  return projectFromWails(wp)
}

export async function SaveProject(project: TopologyProject, path: string): Promise<void> {
  const wp = projectToWails(project)
  await WailsSaveProject(wp, path)
}

export async function LoadProject(path: string): Promise<TopologyProject> {
  const wp = await WailsLoadProject(path)
  return projectFromWails(wp)
}

export async function OpenFileDialog(): Promise<string> {
  return WailsOpenFileDialog()
}

export async function SaveFileDialog(defaultName?: string): Promise<string> {
  return WailsSaveFileDialog(defaultName || 'project.topology.json')
}

export async function BackupProject(project: TopologyProject, path: string): Promise<void> {
  const wp = projectToWails(project)
  await WailsSaveProject(wp, path)
}
