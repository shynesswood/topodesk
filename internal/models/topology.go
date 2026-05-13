package models

import "time"

type SoftwareInfo struct {
	Name         string `json:"name"`
	InstallPath  string `json:"installPath,omitempty"`
	StartCommand string `json:"startCommand,omitempty"`
	LogPath      string `json:"logPath,omitempty"`
	ConfigPath   string `json:"configPath,omitempty"`
}

type SSHInfo struct {
	Username   string `json:"username,omitempty"`
	Password   string `json:"password,omitempty"`
	PrivateKey string `json:"privateKey,omitempty"`
	Port       int    `json:"port,omitempty"`
}

type Position struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type Node struct {
	ID       string            `json:"id"`
	Type     string            `json:"type"`
	Name     string            `json:"name"`
	IP       string            `json:"ip,omitempty"`
	Port     int               `json:"port,omitempty"`
	Position Position          `json:"position"`
	SSH      *SSHInfo          `json:"ssh,omitempty"`
	Software []SoftwareInfo    `json:"software,omitempty"`
	Tags     []string          `json:"tags,omitempty"`
	Metadata map[string]string `json:"metadata,omitempty"`
}

type Edge struct {
	ID     string `json:"id"`
	Source string `json:"source"`
	Target string `json:"target"`
	Type   string `json:"type,omitempty"`
	Label  string `json:"label,omitempty"`
}

type Group struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	NodeIDs []string `json:"nodeIds"`
}

type Viewport struct {
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
	Zoom float64 `json:"zoom"`
}

type ProjectInfo struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type TopologyProject struct {
	Version  int         `json:"version"`
	Project  ProjectInfo `json:"project"`
	Nodes    []Node      `json:"nodes"`
	Edges    []Edge      `json:"edges"`
	Groups   []Group     `json:"groups"`
	Viewport Viewport    `json:"viewport"`
}
