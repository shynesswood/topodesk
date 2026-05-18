package scanner

import (
	"fmt"
	"net"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	"topodesk/internal/ssh"
)

type PortInfo struct {
	Port    int    `json:"port"`
	Open    bool   `json:"open"`
	Service string `json:"service"`
}

type SystemInfo struct {
	OS          string  `json:"os"`
	Hostname    string  `json:"hostname"`
	Kernel      string  `json:"kernel"`
	CPU         string  `json:"cpu"`
	MemTotal    string  `json:"memTotal"`
	MemUsed     string  `json:"memUsed"`
	MemPercent  float64 `json:"memPercent"`
	DiskTotal   string  `json:"diskTotal"`
	DiskUsed    string  `json:"diskUsed"`
	DiskPercent float64 `json:"diskPercent"`
}

type ContainerInfo struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Image  string `json:"image"`
	Status string `json:"status"`
	Ports  string `json:"ports"`
}

type DockerInfo struct {
	Installed  bool            `json:"installed"`
	Version    string          `json:"version"`
	Containers []ContainerInfo `json:"containers"`
}

type ScanResult struct {
	Host      string     `json:"host"`
	Ports     []PortInfo `json:"ports"`
	ScanTime  time.Time  `json:"scanTime"`
	OpenCount int        `json:"openCount"`
}

var commonPorts = []int{
	22,    // SSH
	53,    // DNS
	80,    // HTTP
	443,   // HTTPS
	993,   // IMAPS
	995,   // POP3S
	1433,  // MSSQL
	1521,  // Oracle
	2181,  // ZooKeeper
	2379,  // etcd
	3000,  // Grafana/Node.js
	3306,  // MySQL
	3389,  // RDP
	4000,  // Docker Registry
	5000,  // Docker Registry
	5432,  // PostgreSQL
	5672,  // RabbitMQ
	5900,  // VNC
	6379,  // Redis
	6443,  // Kubernetes API
	8000,  // HTTP Dev
	8080,  // HTTP Alt
	8081,  // HTTP Alt
	8088,  // HTTP Alt
	8443,  // HTTPS Alt
	8888,  // Jupyter
	9000,  // PHP-FPM
	9001,  // etcd
	9090,  // Prometheus
	9092,  // Kafka
	9200,  // Elasticsearch
	9999,  // Custom
	10000, // Custom
	11211, // Memcached
	15672, // RabbitMQ Management
	27017, // MongoDB
}

var serviceMap = map[int]string{
	21:    "FTP",
	22:    "SSH",
	23:    "Telnet",
	25:    "SMTP",
	53:    "DNS",
	68:    "DHCP",
	80:    "HTTP",
	110:   "POP3",
	111:   "RPCBind",
	135:   "MS-RPC",
	139:   "NetBIOS",
	143:   "IMAP",
	443:   "HTTPS",
	445:   "SMB",
	993:   "IMAPS",
	995:   "POP3S",
	1433:  "MSSQL",
	1521:  "Oracle",
	2049:  "NFS",
	2181:  "ZooKeeper",
	2379:  "etcd",
	3000:  "Grafana/Node",
	3306:  "MySQL",
	3389:  "RDP",
	4000:  "Docker-Registry",
	5000:  "Docker-Registry",
	5432:  "PostgreSQL",
	5672:  "RabbitMQ",
	5900:  "VNC",
	6000:  "X11",
	6379:  "Redis",
	6443:  "Kubernetes",
	7001:  "WebLogic",
	8000:  "HTTP-Dev",
	8080:  "HTTP-Alt",
	8081:  "HTTP-Alt",
	8088:  "HTTP-Alt",
	8443:  "HTTPS-Alt",
	8888:  "Jupyter",
	9000:  "PHP-FPM",
	9001:  "ETCD",
	9090:  "Prometheus",
	9092:  "Kafka",
	9200:  "Elasticsearch",
	9300:  "Elasticsearch",
	9999:  "Custom",
	10000: "Custom",
	11211: "Memcached",
	15672: "RabbitMQ-Mgmt",
	27017: "MongoDB",
}

type ScannerService struct {
	sshService *ssh.SSHService
}

func NewScannerService() *ScannerService {
	return &ScannerService{
		sshService: ssh.NewSSHService(),
	}
}

func (s *ScannerService) IdentifyService(port int) string {
	if service, ok := serviceMap[port]; ok {
		return service
	}
	return "Unknown"
}

func (s *ScannerService) scanPort(host string, port int, timeout time.Duration) PortInfo {
	addr := net.JoinHostPort(host, strconv.Itoa(port))
	conn, err := net.DialTimeout("tcp", addr, timeout)
	if err != nil {
		return PortInfo{
			Port:    port,
			Open:    false,
			Service: s.IdentifyService(port),
		}
	}
	conn.Close()
	return PortInfo{
		Port:    port,
		Open:    true,
		Service: s.IdentifyService(port),
	}
}

func (s *ScannerService) QuickScanPorts(host string, timeout int) []PortInfo {
	if timeout <= 0 {
		timeout = 2
	}

	timeoutDuration := time.Duration(timeout) * time.Second
	var mu sync.Mutex
	var results []PortInfo
	var wg sync.WaitGroup

	for _, port := range commonPorts {
		wg.Add(1)
		go func(p int) {
			defer wg.Done()
			result := s.scanPort(host, p, timeoutDuration)
			mu.Lock()
			results = append(results, result)
			mu.Unlock()
		}(port)
	}

	wg.Wait()

	sort.Slice(results, func(i, j int) bool {
		return results[i].Port < results[j].Port
	})

	return results
}

func (s *ScannerService) CustomScanPorts(host string, ports []int, timeout int) []PortInfo {
	if timeout <= 0 {
		timeout = 2
	}

	timeoutDuration := time.Duration(timeout) * time.Second
	var mu sync.Mutex
	var results []PortInfo
	var wg sync.WaitGroup

	for _, port := range ports {
		wg.Add(1)
		go func(p int) {
			defer wg.Done()
			result := s.scanPort(host, p, timeoutDuration)
			mu.Lock()
			results = append(results, result)
			mu.Unlock()
		}(port)
	}

	wg.Wait()

	sort.Slice(results, func(i, j int) bool {
		return results[i].Port < results[j].Port
	})

	return results
}

func (s *ScannerService) RangeScanPorts(host string, startPort, endPort, timeout int) []PortInfo {
	if timeout <= 0 {
		timeout = 2
	}

	if startPort < 1 || endPort > 65535 || startPort > endPort {
		return []PortInfo{}
	}

	timeoutDuration := time.Duration(timeout) * time.Second
	var mu sync.Mutex
	var results []PortInfo
	var wg sync.WaitGroup

	for port := startPort; port <= endPort; port++ {
		wg.Add(1)
		go func(p int) {
			defer wg.Done()
			result := s.scanPort(host, p, timeoutDuration)
			if result.Open {
				mu.Lock()
				results = append(results, result)
				mu.Unlock()
			}
		}(port)
	}

	wg.Wait()

	sort.Slice(results, func(i, j int) bool {
		return results[i].Port < results[j].Port
	})

	return results
}

func (s *ScannerService) GetSystemInfo(host string, port int, username, password, privateKey string) (SystemInfo, error) {
	var info SystemInfo

	osCmd := "cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d'\"' -f2 || uname -o"
	hostnameCmd := "hostname"
	kernelCmd := "uname -r"
	cpuCmd := "grep 'model name' /proc/cpuinfo | head -1 | cut -d':' -f2 | sed 's/^[ \t]*//' || uname -m"
	memCmd := "free -b | awk 'NR==2 {printf \"%s %s %.1f\", $3, $2, ($3/$2)*100}'"
	diskCmd := "df -BG / | awk 'NR==2 {gsub(/G/,\"\"); printf \"%sG %sG %.1f\", $3, $2, ($3/$2)*100}'"

	var err error

	info.OS, err = s.sshService.ExecuteCommandWithOutput(host, port, username, password, privateKey, osCmd, 10)
	if err != nil {
		info.OS = "Unknown"
	}
	info.OS = strings.TrimSpace(info.OS)

	info.Hostname, err = s.sshService.ExecuteCommandWithOutput(host, port, username, password, privateKey, hostnameCmd, 10)
	if err != nil {
		info.Hostname = "Unknown"
	}
	info.Hostname = strings.TrimSpace(info.Hostname)

	info.Kernel, err = s.sshService.ExecuteCommandWithOutput(host, port, username, password, privateKey, kernelCmd, 10)
	if err != nil {
		info.Kernel = "Unknown"
	}
	info.Kernel = strings.TrimSpace(info.Kernel)

	info.CPU, err = s.sshService.ExecuteCommandWithOutput(host, port, username, password, privateKey, cpuCmd, 10)
	if err != nil {
		info.CPU = "Unknown"
	}
	info.CPU = strings.TrimSpace(info.CPU)

	memOutput, err := s.sshService.ExecuteCommandWithOutput(host, port, username, password, privateKey, memCmd, 10)
	if err == nil {
		parts := strings.Fields(memOutput)
		if len(parts) >= 3 {
			usedBytes, _ := strconv.ParseInt(parts[0], 10, 64)
			totalBytes, _ := strconv.ParseInt(parts[1], 10, 64)
			info.MemUsed = formatBytes(usedBytes)
			info.MemTotal = formatBytes(totalBytes)
			info.MemPercent, _ = strconv.ParseFloat(parts[2], 64)
		}
	}
	if info.MemTotal == "" {
		info.MemTotal = "Unknown"
	}

	diskOutput, err := s.sshService.ExecuteCommandWithOutput(host, port, username, password, privateKey, diskCmd, 10)
	if err == nil {
		parts := strings.Fields(diskOutput)
		if len(parts) >= 3 {
			info.DiskUsed = parts[0]
			info.DiskTotal = parts[1]
			info.DiskPercent, _ = strconv.ParseFloat(parts[2], 64)
		}
	}
	if info.DiskTotal == "" {
		info.DiskTotal = "Unknown"
	}

	return info, nil
}

func (s *ScannerService) CheckDocker(host string, port int, username, password, privateKey string) (DockerInfo, error) {
	dockerInfo := DockerInfo{
		Containers: []ContainerInfo{},
	}

	versionCmd := "docker --version 2>/dev/null"
	versionOutput, err := s.sshService.ExecuteCommandWithOutput(host, port, username, password, privateKey, versionCmd, 10)
	if err != nil || !strings.Contains(versionOutput, "Docker") {
		dockerInfo.Installed = false
		return dockerInfo, nil
	}

	dockerInfo.Installed = true
	dockerInfo.Version = strings.TrimSpace(versionOutput)

	psCmd := "docker ps --format '{{.ID}}|||{{.Names}}|||{{.Image}}|||{{.Status}}|||{{.Ports}}' 2>/dev/null"
	psOutput, err := s.sshService.ExecuteCommandWithOutput(host, port, username, password, privateKey, psCmd, 15)
	if err != nil {
		return dockerInfo, nil
	}

	lines := strings.Split(strings.TrimSpace(psOutput), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}
		parts := strings.Split(line, "|||")
		if len(parts) >= 5 {
			container := ContainerInfo{
				ID:     strings.TrimSpace(parts[0]),
				Name:   strings.TrimSpace(parts[1]),
				Image:  strings.TrimSpace(parts[2]),
				Status: strings.TrimSpace(parts[3]),
				Ports:  strings.TrimSpace(parts[4]),
			}
			dockerInfo.Containers = append(dockerInfo.Containers, container)
		}
	}

	return dockerInfo, nil
}

func (s *ScannerService) FullScan(host string, port int, username, password, privateKey string, timeout int) (ScanResult, SystemInfo, DockerInfo, error) {
	var scanResult ScanResult
	var systemInfo SystemInfo
	var dockerInfo DockerInfo

	scanResult.Host = host
	scanResult.ScanTime = time.Now()
	scanResult.Ports = s.QuickScanPorts(host, timeout)

	openCount := 0
	for _, p := range scanResult.Ports {
		if p.Open {
			openCount++
		}
	}
	scanResult.OpenCount = openCount

	systemInfo, _ = s.GetSystemInfo(host, port, username, password, privateKey)
	dockerInfo, _ = s.CheckDocker(host, port, username, password, privateKey)

	return scanResult, systemInfo, dockerInfo, nil
}

func formatBytes(bytes int64) string {
	const (
		KB = 1024
		MB = 1024 * KB
		GB = 1024 * MB
		TB = 1024 * GB
	)

	switch {
	case bytes >= TB:
		return fmt.Sprintf("%.2f TB", float64(bytes)/float64(TB))
	case bytes >= GB:
		return fmt.Sprintf("%.2f GB", float64(bytes)/float64(GB))
	case bytes >= MB:
		return fmt.Sprintf("%.2f MB", float64(bytes)/float64(MB))
	case bytes >= KB:
		return fmt.Sprintf("%.2f KB", float64(bytes)/float64(KB))
	default:
		return fmt.Sprintf("%d B", bytes)
	}
}
