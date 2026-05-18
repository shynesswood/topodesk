package models

import "time"

type SoftwareInfo struct {
	Name           string `json:"name"`
	InstallPath    string `json:"installPath,omitempty"`
	DataPath       string `json:"dataPath,omitempty"`
	LogPath        string `json:"logPath,omitempty"`
	StartCommand   string `json:"startCommand,omitempty"`
	StopCommand    string `json:"stopCommand,omitempty"`
	RestartCommand string `json:"restartCommand,omitempty"`
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
	ID          string         `json:"id"`
	Name        string         `json:"name"`
	IP          string         `json:"ip,omitempty"`
	Description string         `json:"description,omitempty"`
	Position    Position       `json:"position"`
	SSH         *SSHInfo       `json:"ssh,omitempty"`
	Software    []SoftwareInfo `json:"software,omitempty"`
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
	Color   string   `json:"color,omitempty"`
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
