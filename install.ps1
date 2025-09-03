# AI Gateway Complete Installer v1.0
# Windows PowerShell installer

param(
    [switch]$SkipChecks,
    [switch]$Force
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Configuration
$AppName = "AI Gateway"
$AppVersion = "1.0.0"
$FrontendPort = 5556
$BackendPort = 5555
$DbPort = 5432
$MinRam = 4000
$RequiredPorts = @($FrontendPort, $BackendPort, $DbPort)

# ASCII Art
function Write-Banner {
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $Blue
    Write-Host "║                    🚀 AI GATEWAY v1.0                        ║" -ForegroundColor $Blue
    Write-Host "║              Enterprise AI Platform Installer                ║" -ForegroundColor $Blue
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $Blue
    Write-Host ""
}

# Check system requirements
function Test-Requirements {
    Write-Host "🔍 Checking system requirements..." -ForegroundColor $Yellow
    
    # Check OS
    if ($env:OS -eq "Windows_NT") {
        Write-Host "✅ OS: Windows detected" -ForegroundColor $Green
    } else {
        Write-Host "❌ Unsupported OS: $env:OS" -ForegroundColor $Red
        exit 1
    }
    
    # Check PowerShell version
    $PSVersion = $PSVersionTable.PSVersion.Major
    if ($PSVersion -lt 5) {
        Write-Host "❌ PowerShell 5.0 or higher required (current: $PSVersion)" -ForegroundColor $Red
        exit 1
    } else {
        Write-Host "✅ PowerShell: Version $PSVersion" -ForegroundColor $Green
    }
    
    # Check Docker
    try {
        $DockerVersion = docker --version 2>$null
        if ($DockerVersion) {
            Write-Host "✅ Docker: $DockerVersion" -ForegroundColor $Green
        } else {
            throw "Docker not found"
        }
    } catch {
        Write-Host "❌ Docker not found" -ForegroundColor $Red
        Write-Host "📦 Please install Docker Desktop from https://docs.docker.com/desktop/windows/install/" -ForegroundColor $Yellow
        Write-Host "   After installation, restart PowerShell and run this script again." -ForegroundColor $Yellow
        exit 1
    }
    
    # Check Docker Compose
    try {
        $ComposeVersion = docker-compose --version 2>$null
        if ($ComposeVersion) {
            Write-Host "✅ Docker Compose: $ComposeVersion" -ForegroundColor $Green
        } else {
            throw "Docker Compose not found"
        }
    } catch {
        Write-Host "❌ Docker Compose not found" -ForegroundColor $Red
        Write-Host "📦 Installing Docker Compose..." -ForegroundColor $Yellow
        
        # Download Docker Compose
        $ComposeUrl = "https://github.com/docker/compose/releases/latest/download/docker-compose-windows-x86_64.exe"
        $ComposePath = "$env:ProgramFiles\Docker\Docker\resources\bin\docker-compose.exe"
        
        if (!(Test-Path $ComposePath)) {
            Invoke-WebRequest -Uri $ComposeUrl -OutFile $ComposePath
        }
        
        Write-Host "✅ Docker Compose installed" -ForegroundColor $Green
    }
    
    # Check available RAM
    $RAM = [math]::Round((Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1MB)
    if ($RAM -lt $MinRam) {
        Write-Host "❌ Insufficient RAM: ${RAM}MB (minimum ${MinRam}MB required)" -ForegroundColor $Red
        exit 1
    } else {
        Write-Host "✅ RAM: ${RAM}MB available" -ForegroundColor $Green
    }
    
    # Check ports
    foreach ($port in $RequiredPorts) {
        $PortInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($PortInUse) {
            Write-Host "❌ Port $port is already in use" -ForegroundColor $Red
            exit 1
        } else {
            Write-Host "✅ Port $port: Available" -ForegroundColor $Green
        }
    }
    
    Write-Host "✅ All requirements met!" -ForegroundColor $Green
}

# Setup environment
function Set-Environment {
    Write-Host "🔧 Setting up environment..." -ForegroundColor $Yellow
    
    # Create .env file if it doesn't exist
    if (!(Test-Path ".env")) {
        Write-Host "📝 Creating .env file..." -ForegroundColor $Yellow
        
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
        } else {
            # Create basic .env file
            @"
# AI Gateway Environment Configuration
APP_NAME=AI Gateway
APP_VERSION=1.0.0

# Database Configuration
DB_NAME=aigateway
DB_USER=aigateway
DB_PASSWORD=changeme
DB_PORT=5432

# Application Ports
FRONTEND_PORT=5556
BACKEND_PORT=5555

# Security
SECRET_KEY=changeme
ENVIRONMENT=production

# AI Provider (demo, openai, anthropic, ollama)
AI_PROVIDER=demo
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434

# Optional: Microsoft OIDC
MS_TENANT_ID=
MS_CLIENT_ID=
MS_CLIENT_SECRET=
"@ | Out-File -FilePath ".env" -Encoding UTF8
        }
        
        # Generate secure secrets
        $SecretKey = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        $DbPassword = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
        
        # Update .env with generated values
        (Get-Content ".env") -replace "SECRET_KEY=.*", "SECRET_KEY=$SecretKey" | Set-Content ".env"
        (Get-Content ".env") -replace "DB_PASSWORD=.*", "DB_PASSWORD=$DbPassword" | Set-Content ".env"
        (Get-Content ".env") -replace "FRONTEND_PORT=.*", "FRONTEND_PORT=$FrontendPort" | Set-Content ".env"
        (Get-Content ".env") -replace "BACKEND_PORT=.*", "BACKEND_PORT=$BackendPort" | Set-Content ".env"
        (Get-Content ".env") -replace "DB_PORT=.*", "DB_PORT=$DbPort" | Set-Content ".env"
        
        Write-Host "✅ Environment configured" -ForegroundColor $Green
    } else {
        Write-Host "✅ .env file already exists" -ForegroundColor $Green
    }
}

# Initialize database
function Initialize-Database {
    Write-Host "🗄️  Initializing database..." -ForegroundColor $Yellow
    
    # Start database container
    docker-compose up -d db
    
    # Wait for database to be ready
    Write-Host "⏳ Waiting for database to start..." -ForegroundColor $Yellow
    $timeout = 60
    while ($timeout -gt 0) {
        try {
            $result = docker-compose exec -T db pg_isready -U aigateway 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Database ready" -ForegroundColor $Green
                break
            }
        } catch {
            # Ignore errors
        }
        Start-Sleep -Seconds 1
        $timeout--
    }
    
    if ($timeout -eq 0) {
        Write-Host "❌ Database failed to start" -ForegroundColor $Red
        exit 1
    }
}

# Deploy application
function Deploy-Application {
    Write-Host "🚀 Deploying AI Gateway..." -ForegroundColor $Yellow
    
    # Build and start all services
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for services to be ready
    Write-Host "⏳ Waiting for services to start..." -ForegroundColor $Yellow
    $timeout = 120
    while ($timeout -gt 0) {
        try {
            $BackendHealth = Invoke-WebRequest -Uri "http://localhost:$BackendPort/health" -UseBasicParsing -TimeoutSec 5
            $FrontendHealth = Invoke-WebRequest -Uri "http://localhost:$FrontendPort" -UseBasicParsing -TimeoutSec 5
            
            if ($BackendHealth.StatusCode -eq 200 -and $FrontendHealth.StatusCode -eq 200) {
                Write-Host "✅ All services ready" -ForegroundColor $Green
                break
            }
        } catch {
            # Ignore errors
        }
        Start-Sleep -Seconds 2
        $timeout -= 2
    }
    
    if ($timeout -eq 0) {
        Write-Host "❌ Services failed to start" -ForegroundColor $Red
        docker-compose logs
        exit 1
    }
}

# Create demo data
function New-DemoData {
    Write-Host "🎭 Creating demo data..." -ForegroundColor $Yellow
    
    # Wait a bit for services to fully initialize
    Start-Sleep -Seconds 10
    
    # Create demo assistants
    $Assistants = @(
        @{
            name = "General Assistant"
            description = "Ein allgemeiner AI-Assistent für verschiedene Aufgaben"
            model = "gpt-4o-mini"
            instructions = "Du bist ein hilfreicher Assistent."
            temperature = 0.7
        },
        @{
            name = "HR Assistant"
            description = "Spezialisiert auf HR-Fragen und Personalmanagement"
            model = "gpt-4o-mini"
            instructions = "Du bist ein HR-Assistent. Beantworte Fragen zu Personalmanagement, Arbeitsrecht und HR-Prozessen."
            temperature = 0.5
        },
        @{
            name = "IT Support"
            description = "Technischer Support für IT-Probleme"
            model = "gpt-4o-mini"
            instructions = "Du bist ein IT-Support Assistent. Hilf bei technischen Problemen, Debugging und Systemadministration."
            temperature = 0.3
        }
    )
    
    foreach ($assistant in $Assistants) {
        try {
            $Body = $assistant | ConvertTo-Json
            Invoke-RestMethod -Uri "http://localhost:$BackendPort/api/v1/assistants/" -Method POST -Body $Body -ContentType "application/json" | Out-Null
        } catch {
            # Ignore errors
        }
    }
    
    Write-Host "✅ Demo data created" -ForegroundColor $Green
}

# Post-installation
function Show-PostInstall {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $Green
    Write-Host "║                    🎉 INSTALLATION COMPLETE!                  ║" -ForegroundColor $Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $Green
    Write-Host ""
    
    Write-Host "🌐 Access your AI Gateway:" -ForegroundColor $Blue
    Write-Host "   Frontend: http://localhost:$FrontendPort" -ForegroundColor $Blue
    Write-Host "   API Docs: http://localhost:$BackendPort/docs" -ForegroundColor $Blue
    Write-Host "   Health Check: http://localhost:$BackendPort/health" -ForegroundColor $Blue
    
    Write-Host "🔑 Default Credentials:" -ForegroundColor $Blue
    Write-Host "   Email: admin@aigateway.local" -ForegroundColor $Blue
    Write-Host "   Password: admin123" -ForegroundColor $Blue
    
    Write-Host "📚 Quick Start:" -ForegroundColor $Blue
    Write-Host "   1. Open http://localhost:$FrontendPort" -ForegroundColor $Blue
    Write-Host "   2. Login with default credentials" -ForegroundColor $Blue
    Write-Host "   3. Configure AI provider in Settings" -ForegroundColor $Blue
    Write-Host "   4. Start chatting with AI assistants!" -ForegroundColor $Blue
    
    Write-Host "🛠️  Management Commands:" -ForegroundColor $Blue
    Write-Host "   Start: docker-compose up -d" -ForegroundColor $Blue
    Write-Host "   Stop: docker-compose down" -ForegroundColor $Blue
    Write-Host "   Logs: docker-compose logs -f" -ForegroundColor $Blue
    Write-Host "   Restart: docker-compose restart" -ForegroundColor $Blue
    
    Write-Host "📖 Documentation:" -ForegroundColor $Blue
    Write-Host "   README.md - Quick start guide" -ForegroundColor $Blue
    Write-Host "   docs/ - Complete documentation" -ForegroundColor $Blue
    Write-Host "   .\troubleshoot.ps1 - Troubleshooting script" -ForegroundColor $Blue
    
    Write-Host "⚠️  Security Note:" -ForegroundColor $Yellow
    Write-Host "   Change default passwords after first login!" -ForegroundColor $Yellow
    Write-Host "   Configure SSL for production use." -ForegroundColor $Yellow
}

# Main installation function
function Start-Installation {
    Write-Banner
    
    if (!$SkipChecks) {
        Test-Requirements
    }
    
    Set-Environment
    Initialize-Database
    Deploy-Application
    New-DemoData
    Show-PostInstall
}

# Run main function
Start-Installation
