package cmdexec

import (
	"bytes"
	"context"
	"fmt"
	"os/exec"
	"runtime"
	"time"
)

type ExecResult struct {
	Success  bool   `json:"success"`
	Stdout   string `json:"stdout"`
	Stderr   string `json:"stderr"`
	ExitCode int    `json:"exitCode"`
	Error    string `json:"error,omitempty"`
}

type CmdExecService struct{}

func NewCmdExecService() *CmdExecService {
	return &CmdExecService{}
}

func (s *CmdExecService) Execute(command string) ExecResult {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.CommandContext(ctx, "zsh", "-c", command)
	case "linux":
		cmd = exec.CommandContext(ctx, "bash", "-c", command)
	case "windows":
		cmd = exec.CommandContext(ctx, "cmd", "/c", command)
	default:
		return ExecResult{Success: false, Error: fmt.Sprintf("不支持的操作系统: %s", runtime.GOOS)}
	}

	var stdoutBuf, stderrBuf bytes.Buffer
	cmd.Stdout = &stdoutBuf
	cmd.Stderr = &stderrBuf

	err := cmd.Run()

	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*exec.ExitError); ok {
			exitCode = exitErr.ExitCode()
		} else {
			return ExecResult{
				Success:  false,
				Stdout:   stdoutBuf.String(),
				Stderr:   stderrBuf.String(),
				ExitCode: exitCode,
				Error:    fmt.Sprintf("执行失败: %s", err.Error()),
			}
		}
	}

	if ctx.Err() == context.DeadlineExceeded {
		return ExecResult{
			Success:  false,
			Stdout:   stdoutBuf.String(),
			Stderr:   stderrBuf.String(),
			ExitCode: exitCode,
			Error:    "命令执行超时（30秒）",
		}
	}

	return ExecResult{
		Success:  exitCode == 0,
		Stdout:   stdoutBuf.String(),
		Stderr:   stderrBuf.String(),
		ExitCode: exitCode,
	}
}
