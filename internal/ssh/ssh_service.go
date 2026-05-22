package ssh

import (
	"fmt"
	"net"
	"time"

	"golang.org/x/crypto/ssh"
)

type SSHResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type SSHExecResult struct {
	Success  bool   `json:"success"`
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

func (s *SSHService) dialClient(host string, port int, username, password, privateKey string) (*ssh.Client, error) {
	addr := net.JoinHostPort(host, fmt.Sprintf("%d", port))

	config, err := s.createClientConfig(username, password, privateKey)
	if err != nil {
		return nil, err
	}

	conn, err := net.DialTimeout("tcp", addr, 10*time.Second)
	if err != nil {
		return nil, fmt.Errorf("连接失败: %s", err.Error())
	}

	sshConn, chans, reqs, err := ssh.NewClientConn(conn, addr, config)
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("SSH握手失败: %s", err.Error())
	}

	client := ssh.NewClient(sshConn, chans, reqs)
	return client, nil
}

func (s *SSHService) TestConnection(host string, port int, username, password, privateKey string) SSHResult {
	client, err := s.dialClient(host, port, username, password, privateKey)
	if err != nil {
		return SSHResult{Success: false, Message: err.Error()}
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return SSHResult{Success: false, Message: fmt.Sprintf("创建会话失败: %s", err.Error())}
	}
	defer session.Close()

	return SSHResult{Success: true, Message: "SSH连接成功"}
}

func (s *SSHService) ExecuteCommand(host string, port int, username, password, privateKey, command string) SSHExecResult {
	client, err := s.dialClient(host, port, username, password, privateKey)
	if err != nil {
		return SSHExecResult{Success: false, Error: err.Error()}
	}
	defer client.Close()

	session, err := client.NewSession()
	if err != nil {
		return SSHExecResult{Success: false, Error: fmt.Sprintf("创建会话失败: %s", err.Error())}
	}
	defer session.Close()

	output, err := session.CombinedOutput(command)

	exitCode := 0
	if err != nil {
		if exitErr, ok := err.(*ssh.ExitError); ok {
			exitCode = exitErr.ExitStatus()
		} else {
			return SSHExecResult{
				Success:  false,
				Stdout:   string(output),
				ExitCode: exitCode,
				Error:    fmt.Sprintf("执行失败: %s", err.Error()),
			}
		}
	}

	stdout, stderr := splitCombinedOutput(string(output), exitCode)
	return SSHExecResult{
		Success:  exitCode == 0,
		Stdout:   stdout,
		Stderr:   stderr,
		ExitCode: exitCode,
	}
}

func splitCombinedOutput(output string, exitCode int) (stdout, stderr string) {
	if exitCode == 0 {
		return output, ""
	}
	return "", output
}
