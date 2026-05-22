package main

import (
	"context"
	"runtime"

	"topodesk/internal/models"
	"topodesk/internal/project"
	"topodesk/internal/ssh"
	"topodesk/internal/storage"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

const APP_VERSION = "1.0.0"

type App struct {
	ctx            context.Context
	projectService *project.ProjectService
	fileManager    *storage.FileManager
	sshService     *ssh.SSHService
}

func NewApp() *App {
	return &App{
		projectService: project.NewProjectService(),
		fileManager:    storage.NewFileManager(),
		sshService:     ssh.NewSSHService(),
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

func fileFilters() []wailsRuntime.FileFilter {
	if runtime.GOOS == "darwin" {
		return nil
	}
	return []wailsRuntime.FileFilter{
		{DisplayName: "拓扑文件 (*.topology.json)", Pattern: "*.topology.json"},
		{DisplayName: "所有文件 (*.*)", Pattern: "*.*"},
	}
}

func (a *App) OpenFileDialog() (string, error) {
	return wailsRuntime.OpenFileDialog(a.ctx, wailsRuntime.OpenDialogOptions{
		Filters: fileFilters(),
	})
}

func (a *App) SaveFileDialog(defaultName string) (string, error) {
	if defaultName == "" {
		defaultName = "project.topology.json"
	}
	return wailsRuntime.SaveFileDialog(a.ctx, wailsRuntime.SaveDialogOptions{
		DefaultFilename: defaultName,
		Filters:         fileFilters(),
	})
}

func (a *App) FileExists(path string) bool {
	return a.fileManager.Exists(path)
}

func (a *App) SSHTestConnection(host string, port int, username, password, privateKey string) ssh.SSHResult {
	return a.sshService.TestConnection(host, port, username, password, privateKey)
}

func (a *App) GetVersion() string {
	return APP_VERSION
}
