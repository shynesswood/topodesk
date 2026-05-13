package storage

import (
	"context"
	"os"
)

type FileManager struct {
	ctx context.Context
}

func NewFileManager() *FileManager {
	return &FileManager{}
}

func (fm *FileManager) SetContext(ctx context.Context) {
	fm.ctx = ctx
}

func (fm *FileManager) Exists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func (fm *FileManager) EnsureDir(path string) error {
	return os.MkdirAll(path, 0755)
}
