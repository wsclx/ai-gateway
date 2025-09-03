#!/bin/bash

# AI Gateway Complete Installer v1.0
# Universal installer for Linux and macOS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="AI Gateway"
APP_VERSION="1.0.0"
FRONTEND_PORT=${FRONTEND_PORT:-5556}
BACKEND_PORT=${BACKEND_PORT:-5555}
DB_PORT=${DB_PORT:-5433}
MIN_RAM=4000
REQUIRED_PORTS=($FRONTEND_PORT $BACKEND_PORT $DB_PORT)

# ASCII Art
print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🚀 AI GATEWAY v1.0                        ║"
    echo "║              Enterprise AI Platform Installer                ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check system requirements
check_requirements() {
    echo -e "${YELLOW}🔍 Checking system requirements...${NC}"
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "✅ OS: Linux detected"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "✅ OS: macOS detected"
    else
        echo -e "${RED}❌ Unsupported OS: $OSTYPE${NC}"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not found${NC}"
        echo -e "${YELLOW}📦 Installing Docker...${NC}"
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -fsSL https://get.docker.com -o get-docker.sh
            sudo sh get-docker.sh
            sudo usermod -aG docker $USER
            rm get-docker.sh
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            echo "Please install Docker Desktop from https://docs.docker.com/desktop/mac/install/"
            exit 1
        fi
    else
        echo "✅ Docker: $(docker --version)"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose not found${NC}"
        echo -e "${YELLOW}📦 Installing Docker Compose...${NC}"
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    else
        echo "✅ Docker Compose: $(docker-compose --version)"
    fi
    
    # Check available RAM
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        RAM_MB=$((RAM_KB / 1024))
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        RAM_MB=$(sysctl -n hw.memsize | awk '{print $0 / 1024 / 1024}')
    fi
    
    if [ $RAM_MB -lt $MIN_RAM ]; then
        echo -e "${RED}❌ Insufficient RAM: ${RAM_MB}MB (minimum ${MIN_RAM}MB required)${NC}"
        exit 1
    else
        echo "✅ RAM: ${RAM_MB}MB available"
    fi
    
    # Check ports
    for port in "${REQUIRED_PORTS[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}❌ Port $port is already in use${NC}"
            exit 1
        else
            echo "✅ Port $port: Available"
        fi
    done
    
    echo -e "${GREEN}✅ All requirements met!${NC}"
}

# Setup environment
setup_environment() {
    echo -e "${YELLOW}🔧 Setting up environment...${NC}"
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        echo "📝 Creating .env file..."
        if [ -f .env.example ]; then
            cp .env.example .env
        elif [ -f env.example ]; then
            cp env.example .env
        else
            # Create basic .env file
            cat > .env << EOF
# AI Gateway Environment Configuration
APP_NAME=AI Gateway
APP_VERSION=1.0.0
ENVIRONMENT=production

# Database Configuration
DB_NAME=aigateway
DB_USER=aigateway
DB_PASSWORD=changeme
DB_PORT=${DB_PORT}

# Application Ports
FRONTEND_PORT=${FRONTEND_PORT}
BACKEND_PORT=${BACKEND_PORT}

# Security
SECRET_KEY=changeme
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Provider (demo, openai, anthropic, ollama)
AI_PROVIDER=demo
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434

# Optional: Microsoft OIDC
MS_TENANT_ID=
MS_CLIENT_ID=
MS_CLIENT_SECRET=
EOF
        fi
        
        # Generate secure secrets
        SECRET_KEY=$(openssl rand -hex 32)
        DB_PASSWORD=$(openssl rand -base64 32)
        
        # Update .env with generated values
        sed -i.bak "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" .env
        sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
        sed -i.bak "s/FRONTEND_PORT=.*/FRONTEND_PORT=$FRONTEND_PORT/" .env
        sed -i.bak "s/BACKEND_PORT=.*/BACKEND_PORT=$BACKEND_PORT/" .env
        sed -i.bak "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env
        
        rm .env.bak
        echo "✅ Environment configured"
    else
        echo "✅ .env file already exists"
    fi
}

# Initialize database
init_database() {
    echo -e "${YELLOW}🗄️  Initializing database...${NC}"
    
    # Start database container
    docker-compose up -d db
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to start..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if docker-compose exec -T db pg_isready -U aigateway >/dev/null 2>&1; then
            echo "✅ Database ready"
            break
        fi
        sleep 1
        timeout=$((timeout - 1))
    done
    
    if [ $timeout -eq 0 ]; then
        echo -e "${RED}❌ Database failed to start${NC}"
        exit 1
    fi
}

# Deploy application
deploy_application() {
    echo -e "${YELLOW}🚀 Deploying AI Gateway...${NC}"
    
    # Build and start all services
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to start..."
    timeout=120
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:$BACKEND_PORT/health >/dev/null 2>&1 && \
           curl -f http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
            echo "✅ All services ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -eq 0 ]; then
        echo -e "${RED}❌ Services failed to start${NC}"
        docker-compose logs
        exit 1
    fi
}

# Create demo data
create_demo_data() {
    echo -e "${YELLOW}🎭 Creating demo data...${NC}"
    
    # Wait a bit for services to fully initialize
    sleep 10
    
    # Create demo assistants
    curl -X POST http://localhost:$BACKEND_PORT/api/v1/assistants/ \
        -H "Content-Type: application/json" \
        -d '{"name": "General Assistant", "description": "Ein allgemeiner AI-Assistent für verschiedene Aufgaben", "model": "gpt-4o-mini", "instructions": "Du bist ein hilfreicher Assistent.", "temperature": 0.7}' \
        >/dev/null 2>&1 || true
    
    curl -X POST http://localhost:$BACKEND_PORT/api/v1/assistants/ \
        -H "Content-Type: application/json" \
        -d '{"name": "HR Assistant", "description": "Spezialisiert auf HR-Fragen und Personalmanagement", "model": "gpt-4o-mini", "instructions": "Du bist ein HR-Assistent. Beantworte Fragen zu Personalmanagement, Arbeitsrecht und HR-Prozessen.", "temperature": 0.5}' \
        >/dev/null 2>&1 || true
    
    curl -X POST http://localhost:$BACKEND_PORT/api/v1/assistants/ \
        -H "Content-Type: application/json" \
        -d '{"name": "IT Support", "description": "Technischer Support für IT-Probleme", "model": "gpt-4o-mini", "instructions": "Du bist ein IT-Support Assistent. Hilf bei technischen Problemen, Debugging und Systemadministration.", "temperature": 0.3}' \
        >/dev/null 2>&1 || true
    
    echo "✅ Demo data created"
}

# Post-installation
post_install() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🎉 INSTALLATION COMPLETE!                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${BLUE}🌐 Access your AI Gateway:${NC}"
    echo "   Frontend: http://localhost:$FRONTEND_PORT"
    echo "   API Docs: http://localhost:$BACKEND_PORT/docs"
    echo "   Health Check: http://localhost:$BACKEND_PORT/health"
    
    echo -e "${BLUE}🔑 Default Credentials:${NC}"
    echo "   Email: admin@aigateway.local"
    echo "   Password: admin123"
    
    echo -e "${BLUE}📚 Quick Start:${NC}"
    echo "   1. Open http://localhost:$FRONTEND_PORT"
    echo "   2. Login with default credentials"
    echo "   3. Configure AI provider in Settings"
    echo "   4. Start chatting with AI assistants!"
    
    echo -e "${BLUE}🛠️  Management Commands:${NC}"
    echo "   Start: docker-compose up -d"
    echo "   Stop: docker-compose down"
    echo "   Logs: docker-compose logs -f"
    echo "   Restart: docker-compose restart"
    
    echo -e "${BLUE}📖 Documentation:${NC}"
    echo "   README.md - Quick start guide"
    echo "   docs/ - Complete documentation"
    echo "   ./troubleshoot.sh - Troubleshooting script"
    
    echo -e "${YELLOW}⚠️  Security Note:${NC}"
    echo "   Change default passwords after first login!"
    echo "   Configure SSL for production use."
}

# Main installation function
main() {
    print_banner
    check_requirements
    setup_environment
    init_database
    deploy_application
    create_demo_data
    post_install
}

# Run main function
main "$@"
