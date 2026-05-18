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
