package main

import (
	"context"

	"topodesk/internal/models"
	"topodesk/internal/project"
	"topodesk/internal/scanner"
	"topodesk/internal/ssh"
	"topodesk/internal/storage"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx             context.Context
	projectService  *project.ProjectService
	fileManager     *storage.FileManager
	sshService      *ssh.SSHService
	scannerService  *scanner.ScannerService
}

func NewApp() *App {
	return &App{
		projectService: project.NewProjectService(),
		fileManager:    storage.NewFileManager(),
		sshService:     ssh.NewSSHService(),
		scannerService: scanner.NewScannerService(),
	}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.fileManager.SetContext(ctx)
}

func (a *App) NewProject(name string) (*models.TopologyProject, error) {
	return a.projectService.New(name), nil
}

func (a *App) SaveProject(p *models.TopologyProject, path string) error {
	return a.projectService.Save(p, path)
}

func (a *App) LoadProject(path string) (*models.TopologyProject, error) {
	return a.projectService.Load(path)
}

func (a *App) OpenFileDialog() (string, error) {
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{})
}

func (a *App) SaveFileDialog(defaultName string) (string, error) {
	if defaultName == "" {
		defaultName = "project.topology.json"
	}
	return runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: defaultName,
	})
}

func (a *App) FileExists(path string) bool {
	return a.fileManager.Exists(path)
}

// SSH Methods

func (a *App) SSHTestConnection(host string, port int, username, password, privateKey string) ssh.SSHResult {
	return a.sshService.TestConnection(host, port, username, password, privateKey)
}

func (a *App) SSHExecuteCommand(host string, port int, username, password, privateKey, command string, timeout int) ssh.CommandResult {
	return a.sshService.ExecuteCommand(host, port, username, password, privateKey, command, timeout)
}

func (a *App) SSHReadFile(host string, port int, username, password, privateKey, filePath string) (string, error) {
	return a.sshService.ReadFile(host, port, username, password, privateKey, filePath)
}

func (a *App) SSHReadLargeFile(host string, port int, username, password, privateKey, filePath string, maxLines int) (string, error) {
	return a.sshService.ReadLargeFile(host, port, username, password, privateKey, filePath, maxLines)
}

// Scanner Methods

func (a *App) ScannerQuickScanPorts(host string, timeout int) []scanner.PortInfo {
	return a.scannerService.QuickScanPorts(host, timeout)
}

func (a *App) ScannerCustomScanPorts(host string, ports []int, timeout int) []scanner.PortInfo {
	return a.scannerService.CustomScanPorts(host, ports, timeout)
}

func (a *App) ScannerRangeScanPorts(host string, startPort, endPort, timeout int) []scanner.PortInfo {
	return a.scannerService.RangeScanPorts(host, startPort, endPort, timeout)
}

func (a *App) ScannerGetSystemInfo(host string, port int, username, password, privateKey string) (scanner.SystemInfo, error) {
	return a.scannerService.GetSystemInfo(host, port, username, password, privateKey)
}

func (a *App) ScannerCheckDocker(host string, port int, username, password, privateKey string) (scanner.DockerInfo, error) {
	return a.scannerService.CheckDocker(host, port, username, password, privateKey)
}
