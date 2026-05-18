package ssh

import (
	"bytes"
	"fmt"
	"io"
	"net"
	"time"

	"golang.org/x/crypto/ssh"
)

type SSHResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type CommandResult struct {
	Stdout   string `json:"stdout"`
	Stderr   string `json:"stderr"`
	ExitCode int    `json:"exitCode"`
	Error    string `json:"error,omitempty"`
}

type SSHService struct{}

func NewSSHService() *SSHService {
	return &SSHService{}
}

func (s *SSHService) createClientConfig(username, password, privateKey string) (*ssh.ClientConfig, error) {
	var auths []ssh.AuthMethod

	if password != "" {
		auths = append(auths, ssh.Password(password))
	}

	if privateKey != "" {
		signer, err := ssh.ParsePrivateKey([]byte(privateKey))
		if err != nil {
			return nil, fmt.Errorf("解析私钥失败: %w", err)
		}
		auths = append(auths, ssh.PublicKeys(signer))
	}

	if len(auths) == 0 {
		return nil, fmt.Errorf("未提供认证信息（密码或私钥）")
	}

	return &ssh.ClientConfig{
		User:            username,
		Auth:            auths,
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Timeout:         10 * time.Second,
	}, nil
}

func (s *SSHService) TestConnection(host string, port int, username, password, privateKey string) SSHResult {
	addr := net.JoinHostPort(host, fmt.Sprintf("%d", port))

	config, err := s.createClientConfig(username, password, privateKey)
	if err != nil {
		return SSHResult{Success: false, Message: err.Error()}
	}

	conn, err := net.DialTimeout("tcp", addr, 10*time.Second)
	if err != nil {
		return SSHResult{Success: false, Message: fmt.Sprintf("连接失败: %s", err.Error())}
	}
	defer conn.Close()

	sshConn, chans, reqs, err := ssh.NewClientConn(conn, addr, config)
	if err != nil {
		return SSHResult{Success: false, Message: fmt.Sprintf("SSH握手失败: %s", err.Error())}
	}
	defer sshConn.Close()

	client := ssh.NewClient(sshConn, chans, reqs)
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return SSHResult{Success: false, Message: fmt.Sprintf("创建会话失败: %s", err.Error())}
	}
	defer session.Close()

	return SSHResult{Success: true, Message: "SSH连接成功"}
}

func (s *SSHService) ExecuteCommand(host string, port int, username, password, privateKey, command string, timeout int) CommandResult {
	if timeout <= 0 {
		timeout = 30
	}

	addr := net.JoinHostPort(host, fmt.Sprintf("%d", port))

	config, err := s.createClientConfig(username, password, privateKey)
	if err != nil {
		return CommandResult{Error: err.Error()}
	}
	config.Timeout = time.Duration(timeout) * time.Second

	client, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		return CommandResult{Error: fmt.Sprintf("连接失败: %s", err.Error())}
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return CommandResult{Error: fmt.Sprintf("创建会话失败: %s", err.Error())}
	}
	defer session.Close()

	var stdoutBuf, stderrBuf bytes.Buffer
	session.Stdout = &stdoutBuf
	session.Stderr = &stderrBuf

	err = session.Run(command)

	result := CommandResult{
		Stdout: stdoutBuf.String(),
		Stderr: stderrBuf.String(),
	}

	if err != nil {
		if exitErr, ok := err.(*ssh.ExitError); ok {
			result.ExitCode = exitErr.ExitStatus()
		} else {
			result.Error = err.Error()
		}
	}

	return result
}

func (s *SSHService) ReadFile(host string, port int, username, password, privateKey, filePath string) (string, error) {
	addr := net.JoinHostPort(host, fmt.Sprintf("%d", port))

	config, err := s.createClientConfig(username, password, privateKey)
	if err != nil {
		return "", err
	}

	client, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		return "", fmt.Errorf("连接失败: %w", err)
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return "", fmt.Errorf("创建会话失败: %w", err)
	}
	defer session.Close()

	var stdout bytes.Buffer
	session.Stdout = &stdout

	err = session.Run(fmt.Sprintf("cat '%s'", filePath))
	if err != nil {
		return "", fmt.Errorf("读取文件失败: %w", err)
	}

	return stdout.String(), nil
}

func (s *SSHService) ReadLargeFile(host string, port int, username, password, privateKey, filePath string, maxLines int) (string, error) {
	addr := net.JoinHostPort(host, fmt.Sprintf("%d", port))

	config, err := s.createClientConfig(username, password, privateKey)
	if err != nil {
		return "", err
	}

	client, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		return "", fmt.Errorf("连接失败: %w", err)
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return "", fmt.Errorf("创建会话失败: %w", err)
	}
	defer session.Close()

	var cmd string
	if maxLines > 0 {
		cmd = fmt.Sprintf("tail -n %d '%s'", maxLines, filePath)
	} else {
		cmd = fmt.Sprintf("cat '%s'", filePath)
	}

	var stdout bytes.Buffer
	session.Stdout = &stdout

	err = session.Run(cmd)
	if err != nil {
		return "", fmt.Errorf("读取文件失败: %w", err)
	}

	return stdout.String(), nil
}

func (s *SSHService) ExecuteCommandWithOutput(host string, port int, username, password, privateKey, command string, timeout int) (string, error) {
	result := s.ExecuteCommand(host, port, username, password, privateKey, command, timeout)
	if result.Error != "" {
		return "", fmt.Errorf("%s", result.Error)
	}
	if result.ExitCode != 0 {
		return "", fmt.Errorf("命令执行失败 (exit %d): %s", result.ExitCode, result.Stderr)
	}
	return result.Stdout, nil
}

func (s *SSHService) StreamCommand(host string, port int, username, password, privateKey, command string, timeout int, callback func(output string)) error {
	addr := net.JoinHostPort(host, fmt.Sprintf("%d", port))

	config, err := s.createClientConfig(username, password, privateKey)
	if err != nil {
		return err
	}
	config.Timeout = time.Duration(timeout) * time.Second

	client, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		return fmt.Errorf("连接失败: %w", err)
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return fmt.Errorf("创建会话失败: %w", err)
	}
	defer session.Close()

	stdout, err := session.StdoutPipe()
	if err != nil {
		return fmt.Errorf("获取输出管道失败: %w", err)
	}

	if err := session.Start(command); err != nil {
		return fmt.Errorf("启动命令失败: %w", err)
	}

	buf := make([]byte, 1024)
	for {
		n, readErr := stdout.Read(buf)
		if n > 0 {
			callback(string(buf[:n]))
		}
		if readErr != nil {
			if readErr == io.EOF {
				break
			}
			return fmt.Errorf("读取输出失败: %w", readErr)
		}
	}

	return session.Wait()
}
