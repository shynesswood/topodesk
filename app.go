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
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Topology Files",
				Pattern:     "*.topology.json",
			},
		},
	})
}

func (a *App) SaveFileDialog(defaultName string) (string, error) {
	if defaultName == "" {
		defaultName = "project.topology.json"
	}
	return runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: defaultName,
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Topology Files",
				Pattern:     "*.topology.json",
			},
		},
	})
}

func (a *App) FileExists(path string) bool {
	return a.fileManager.Exists(path)
}
