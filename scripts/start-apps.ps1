# Stop on error
$ErrorActionPreference = "Stop"

# Get the root directory
$rootDir = Split-Path -Parent $PSScriptRoot

# Define available apps
$apps = @(
    @{
        name = "main-app"
        port = 8310
        description = "Main application"
    },
    @{
        name = "counter-app"
        port = 8311
        description = "Counter application"
    },
    @{
        name = "image-app"
        port = 8312
        description = "Image processing application"
    }
)

function Start-App {
    param (
        [string]$appName,
        [int]$port
    )
    
    $appsPath = Join-Path $rootDir "apps"
    $appPath = Join-Path $appsPath $appName
    if (!(Test-Path $appPath)) {
        Write-Host "Error: $appName not found at $appPath" -ForegroundColor Red
        return $false
    }

    Write-Host "Starting $appName on port $port..." -ForegroundColor Cyan
    Set-Location $appPath
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cross-env VITE_PORT=$port pnpm dev --port $port"
    return $true
}

function Show-Menu {
    Write-Host "`nAvailable applications:" -ForegroundColor Yellow
    Write-Host "0. Start all applications"
    for ($i = 0; $i -lt $apps.Count; $i++) {
        $app = $apps[$i]
        Write-Host "$($i + 1). $($app.name) - $($app.description) (Port: $($app.port))"
    }
    Write-Host "Q. Quit"
}

# Main menu loop
while ($true) {
    Show-Menu
    $choice = Read-Host "`nEnter your choice"

    if ($choice -eq 'Q' -or $choice -eq 'q') {
        Write-Host "Exiting..." -ForegroundColor Yellow
        break
    }

    if ($choice -eq '0') {
        Write-Host "Starting all applications..." -ForegroundColor Green
        foreach ($app in $apps) {
            Start-App $app.name $app.port
            Start-Sleep -Seconds 2  # Wait a bit between starts
        }
        Write-Host "`nAll applications started!" -ForegroundColor Green
        continue
    }

    $index = [int]$choice - 1
    if ($index -ge 0 -and $index -lt $apps.Count) {
        $app = $apps[$index]
        Start-App $app.name $app.port
        Write-Host "$($app.name) started successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "Invalid choice. Please try again." -ForegroundColor Red
    }
} 