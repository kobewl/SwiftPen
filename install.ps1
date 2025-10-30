# SwiftPen 安装脚本 (PowerShell)
# 使用方法: 在 PowerShell 中运行: .\install.ps1 "你的Vault路径"

param(
    [Parameter(Mandatory=$true)]
    [string]$VaultPath
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "SwiftPen 插件安装脚本" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 检查 vault 路径是否存在
if (-not (Test-Path $VaultPath)) {
    Write-Host "❌ 错误: Vault 路径不存在: $VaultPath" -ForegroundColor Red
    exit 1
}

# 检查是否是有效的 Obsidian vault
$obsidianDir = Join-Path $VaultPath ".obsidian"
if (-not (Test-Path $obsidianDir)) {
    Write-Host "❌ 错误: 这不是一个有效的 Obsidian Vault" -ForegroundColor Red
    Write-Host "   未找到 .obsidian 目录" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 找到 Obsidian Vault: $VaultPath" -ForegroundColor Green

# 创建插件目录
$pluginsDir = Join-Path $obsidianDir "plugins"
if (-not (Test-Path $pluginsDir)) {
    Write-Host "→ 创建 plugins 目录..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $pluginsDir | Out-Null
}

$targetDir = Join-Path $pluginsDir "swiftpen"

# 检查是否已安装
if (Test-Path $targetDir) {
    $response = Read-Host "⚠ SwiftPen 已安装。是否覆盖? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "取消安装" -ForegroundColor Yellow
        exit 0
    }
    Write-Host "→ 删除旧版本..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $targetDir
}

# 检查是否存在 dist 目录
$sourceDir = "dist"
if (-not (Test-Path $sourceDir)) {
    Write-Host "❌ 错误: 未找到 dist 目录" -ForegroundColor Red
    Write-Host "请先运行: npm run build" -ForegroundColor Yellow
    exit 1
}

# 检查必要文件是否存在
$requiredFiles = @("main.js", "manifest.json")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    $filePath = Join-Path $sourceDir $file
    if (-not (Test-Path $filePath)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ 错误: dist 目录中缺少必要文件:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "请先运行: npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ 所有必要文件存在" -ForegroundColor Green

# 创建目标目录
Write-Host "→ 创建插件目录..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $targetDir | Out-Null

# 复制文件
Write-Host "→ 复制文件..." -ForegroundColor Yellow
Copy-Item (Join-Path $sourceDir "main.js") $targetDir
Copy-Item (Join-Path $sourceDir "manifest.json") $targetDir

# 检查是否有 styles.css
$stylesPath = Join-Path $sourceDir "styles.css"
if (Test-Path $stylesPath) {
    Copy-Item $stylesPath $targetDir
    Write-Host "  ✓ 复制 styles.css" -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✅ 安装成功!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步:" -ForegroundColor Cyan
Write-Host "1. 打开 Obsidian" -ForegroundColor White
Write-Host "2. 进入 设置 → 社区插件" -ForegroundColor White
Write-Host "3. 找到 SwiftPen 并启用" -ForegroundColor White
Write-Host "4. 在 SwiftPen 设置中配置 API Key" -ForegroundColor White
Write-Host ""
Write-Host "快捷键: Ctrl+Shift+L" -ForegroundColor Yellow
Write-Host ""

