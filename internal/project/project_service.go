package project

import (
	"encoding/json"
	"fmt"
	"os"
	"time"

	"topodesk/internal/models"

	"github.com/google/uuid"
)

type ProjectService struct{}

func NewProjectService() *ProjectService {
	return &ProjectService{}
}

func (s *ProjectService) New(name string) *models.TopologyProject {
	now := time.Now()
	return &models.TopologyProject{
		Version: 1,
		Project: models.ProjectInfo{
			ID:        uuid.New().String(),
			Name:      name,
			CreatedAt: now,
			UpdatedAt: now,
		},
		Nodes:    []models.Node{},
		Edges:    []models.Edge{},
		Groups:   []models.Group{},
		Viewport: models.Viewport{X: 0, Y: 0, Zoom: 1},
	}
}

func (s *ProjectService) Save(p *models.TopologyProject, path string) error {
	p.Project.UpdatedAt = time.Now()

	data, err := json.MarshalIndent(p, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化项目失败: %w", err)
	}

	if err := os.WriteFile(path, data, 0600); err != nil {
		return fmt.Errorf("写入文件失败: %w", err)
	}

	return nil
}

func (s *ProjectService) Load(path string) (*models.TopologyProject, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("读取文件失败: %w", err)
	}

	var p models.TopologyProject
	if err := json.Unmarshal(data, &p); err != nil {
		return nil, fmt.Errorf("解析项目失败: %w", err)
	}

	return &p, nil
}
