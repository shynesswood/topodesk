package models

import "time"

type OSType string

const (
	OSLinux   OSType = "linux"
	OSWindows OSType = "windows"
)

type SoftwareInfo struct {
	Name  string            `json:"name"`
	Props map[string]string `json:"props,omitempty"`
}

type SSHInfo struct {
	Username   string `json:"username,omitempty"`
	Password   string `json:"password,omitempty"`
	PrivateKey string `json:"privateKey,omitempty"`
	Port       int    `json:"port,omitempty"`
}

type RDPInfo struct {
	Username string `json:"username,omitempty"`
	Password string `json:"password,omitempty"`
	Domain   string `json:"domain,omitempty"`
	Port     int    `json:"port,omitempty"`
}

type CmdType string

const (
	CmdLocal CmdType = "local"
	CmdSSH   CmdType = "ssh"
)

type CommandInfo struct {
	Name    string  `json:"name"`
	Command string  `json:"command"`
	Type    CmdType `json:"type,omitempty"`
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
	Width       float64        `json:"width,omitempty"`
	Height      float64        `json:"height,omitempty"`
	OS          OSType         `json:"os,omitempty"`
	SSH         *SSHInfo       `json:"ssh,omitempty"`
	RDP         *RDPInfo       `json:"rdp,omitempty"`
	Software    []SoftwareInfo `json:"software,omitempty"`
	Commands    []CommandInfo  `json:"commands,omitempty"`
}

type Edge struct {
	ID           string `json:"id"`
	Source       string `json:"source"`
	Target       string `json:"target"`
	Type         string `json:"type,omitempty"`
	Label        string `json:"label,omitempty"`
	SourceHandle string `json:"sourceHandle,omitempty"`
	TargetHandle string `json:"targetHandle,omitempty"`
}

type Group struct {
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	Color    string   `json:"color,omitempty"`
	NodeIDs  []string `json:"nodeIds"`
	Position Position `json:"position"`
	Width    float64  `json:"width"`
	Height   float64  `json:"height"`
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
