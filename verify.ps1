# TopoDesk CI / 本地验证脚本
#
# 用法: .\verify.ps1
#        .\verify.ps1 -FrontendOnly   # 仅前端构建
#        .\verify.ps1 -BackendOnly    # 仅 Go 测试
#
# 检查项:
#   1. Go 编译和测试 (go test ./...)
#   2. 前端 TypeScript 编译和构建 (npm run build)

param(
    [switch]$FrontendOnly,
    [switch]$BackendOnly
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$exitCode = 0

function Write-Step {
    param([string]$Text)
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Run-Command {
    param([string]$Name, [string]$WorkDir, [string]$Command)
    Write-Step $Name
    Push-Location $WorkDir
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  FAILED (exit code: $LASTEXITCODE)" -ForegroundColor Red
            $global:exitCode = 1
        } else {
            Write-Host "  OK" -ForegroundColor Green
        }
    } catch {
        Write-Host "  FAILED: $_" -ForegroundColor Red
        $global:exitCode = 1
    } finally {
        Pop-Location
    }
    Write-Host ""
}

# ── Go ──
if (-not $FrontendOnly) {
    Run-Command "Go build check" $projectRoot "go build ./..."
    Run-Command "Go test" $projectRoot "go test ./..."
}

# ── Frontend ──
if (-not $BackendOnly) {
    $frontendDir = Join-Path $projectRoot "frontend"
    # 如果有 node_modules 先只做类型检查（快）
    Run-Command "TypeScript check" $frontendDir "npx tsc --noEmit"
    Run-Command "Frontend build" $frontendDir "npm run build"
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
if ($exitCode -eq 0) {
    Write-Host "  All checks passed" -ForegroundColor Green
} else {
    Write-Host "  Some checks failed" -ForegroundColor Red
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
exit $exitCode
