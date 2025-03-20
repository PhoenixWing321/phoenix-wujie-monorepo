# Stop on error
$ErrorActionPreference = "Stop"

Write-Host "Starting dependency installation..." -ForegroundColor Green

# 1. Ensure we're in the root directory
$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

# 2. Install root dependencies
Write-Host "`n1. Installing root dependencies..." -ForegroundColor Cyan
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Root dependencies installation failed!" -ForegroundColor Red
    exit 1
}

# 3. Install wujie to workspace
Write-Host "`n2. Installing wujie to workspace..." -ForegroundColor Cyan
pnpm add wujie -w
if ($LASTEXITCODE -ne 0) {
    Write-Host "Wujie installation failed!" -ForegroundColor Red
    exit 1
}

# 4. Install app dependencies
$apps = @("main-app", "counter-app", "image-app")
foreach ($app in $apps) {
    Write-Host "`n3. Installing $app dependencies..." -ForegroundColor Cyan
    Set-Location "$rootDir/apps/$app"
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "$app dependencies installation failed!" -ForegroundColor Red
        exit 1
    }
}

# 5. Final check in root directory
Write-Host "`n4. Final dependency check..." -ForegroundColor Cyan
Set-Location $rootDir
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Final dependency check failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n  All dependencies installed successfully!" -ForegroundColor Green

# Show help information
Write-Host "`nAvailable commands:" -ForegroundColor Yellow
Write-Host "pnpm apps       # Start all applications"
Write-Host "pnpm -r build   # Build all applications"
Write-Host "pnpm -r test    # Run all tests" 