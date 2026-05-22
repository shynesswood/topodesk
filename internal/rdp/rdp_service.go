package rdp

import (
	"fmt"
	"net"
	"time"
)

type RDPResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

type RDPService struct{}

func NewRDPService() *RDPService {
	return &RDPService{}
}

func (s *RDPService) TestConnection(host string, port int, username, password, domain string) RDPResult {
	addr := net.JoinHostPort(host, fmt.Sprintf("%d", port))

	conn, err := net.DialTimeout("tcp", addr, 10*time.Second)
	if err != nil {
		return RDPResult{Success: false, Message: fmt.Sprintf("连接失败: %s", err.Error())}
	}
	defer conn.Close()

	conn.SetDeadline(time.Now().Add(5 * time.Second))

	buf := make([]byte, 11)
	n, err := conn.Read(buf)
	if err != nil {
		return RDPResult{Success: false, Message: fmt.Sprintf("RDP握手失败: %s", err.Error())}
	}

	if n < 11 || string(buf[:4]) != "RDP\x00" {
		return RDPResult{Success: false, Message: "端口响应非RDP协议"}
	}

	return RDPResult{Success: true, Message: "RDP连接成功"}
}
