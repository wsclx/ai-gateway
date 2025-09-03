#!/bin/bash

# AI Gateway Troubleshooting Script v1.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_PORT=5556
BACKEND_PORT=5555
DB_PORT=5432

print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                🔍 AI GATEWAY TROUBLESHOOTING                 ║"
    echo "║                    Diagnostic Tool v1.0                     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_docker() {
    echo -e "${YELLOW}🐳 Checking Docker...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not installed${NC}"
        echo "   Please install Docker: https://docs.docker.com/get-docker/"
        return 1
    else
        echo "✅ Docker: $(docker --version)"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose not installed${NC}"
        return 1
    else
        echo "✅ Docker Compose: $(docker-compose --version)"
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker daemon not running${NC}"
        echo "   Please start Docker Desktop or Docker daemon"
        return 1
    else
        echo "✅ Docker daemon running"
    fi
}

check_containers() {
    echo -e "${YELLOW}📦 Checking container status...${NC}"
    
    if [ ! -f "docker-compose.yml" ]; then
        echo -e "${RED}❌ docker-compose.yml not found${NC}"
        echo "   Please run this script from the AI Gateway directory"
        return 1
    fi
    
    echo "Container Status:"
    docker-compose ps
    
    # Check if all containers are running
    local running_containers=$(docker-compose ps -q | wc -l)
    local total_containers=$(docker-compose config --services | wc -l)
    
    if [ "$running_containers" -eq "$total_containers" ]; then
        echo -e "${GREEN}✅ All containers running${NC}"
    else
        echo -e "${RED}❌ Some containers not running${NC}"
        echo "   Expected: $total_containers, Running: $running_containers"
    fi
}

check_logs() {
    echo -e "${YELLOW}📝 Checking recent logs...${NC}"
    
    echo "Recent errors:"
    docker-compose logs --tail=20 2>&1 | grep -i error || echo "   No recent errors found"
    
    echo ""
    echo "Recent warnings:"
    docker-compose logs --tail=20 2>&1 | grep -i warning || echo "   No recent warnings found"
}

check_ports() {
    echo -e "${YELLOW}🔌 Checking port availability...${NC}"
    
    local ports=($FRONTEND_PORT $BACKEND_PORT $DB_PORT)
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            local process=$(lsof -Pi :$port -sTCP:LISTEN | head -2 | tail -1 | awk '{print $1}')
            echo "   Port $port: ✅ In use by $process"
        else
            echo "   Port $port: ❌ Not listening"
        fi
    done
}

check_database() {
    echo -e "${YELLOW}💾 Checking database connection...${NC}"
    
    if docker-compose exec -T db pg_isready -U aigateway >/dev/null 2>&1; then
        echo "✅ Database responsive"
        
        # Check database tables
        local table_count=$(docker-compose exec -T db psql -U aigateway -d aigateway -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
        
        if [ "$table_count" -gt 0 ]; then
            echo "✅ Database tables exist ($table_count tables)"
        else
            echo -e "${RED}❌ No database tables found${NC}"
        fi
    else
        echo -e "${RED}❌ Database not responding${NC}"
    fi
}

check_api() {
    echo -e "${YELLOW}🌐 Checking API endpoints...${NC}"
    
    # Check backend health
    if curl -f http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
        echo "✅ Backend health check: OK"
    else
        echo -e "${RED}❌ Backend health check: FAILED${NC}"
    fi
    
    # Check API docs
    if curl -f http://localhost:$BACKEND_PORT/docs >/dev/null 2>&1; then
        echo "✅ API documentation: Accessible"
    else
        echo -e "${RED}❌ API documentation: Not accessible${NC}"
    fi
    
    # Check frontend
    if curl -f http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
        echo "✅ Frontend: Accessible"
    else
        echo -e "${RED}❌ Frontend: Not accessible${NC}"
    fi
}

check_resources() {
    echo -e "${YELLOW}💻 Checking system resources...${NC}"
    
    # Check disk space
    local disk_usage=$(df . | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -lt 90 ]; then
        echo "✅ Disk space: ${disk_usage}% used"
    else
        echo -e "${RED}❌ Disk space: ${disk_usage}% used (low space)${NC}"
    fi
    
    # Check memory
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        local mem_total=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        local mem_available=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
        local mem_usage=$((100 - (mem_available * 100 / mem_total)))
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        local mem_usage=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
        local mem_usage=$((100 - mem_usage))
    fi
    
    if [ "$mem_usage" -lt 90 ]; then
        echo "✅ Memory usage: ${mem_usage}%"
    else
        echo -e "${RED}❌ Memory usage: ${mem_usage}% (high usage)${NC}"
    fi
}

check_network() {
    echo -e "${YELLOW}🌍 Checking network connectivity...${NC}"
    
    # Check internet connectivity
    if ping -c 1 google.com >/dev/null 2>&1; then
        echo "✅ Internet connectivity: OK"
    else
        echo -e "${RED}❌ Internet connectivity: FAILED${NC}"
    fi
    
    # Check Docker network
    if docker network ls | grep aigateway-network >/dev/null 2>&1; then
        echo "✅ Docker network: aigateway-network exists"
    else
        echo -e "${RED}❌ Docker network: aigateway-network missing${NC}"
    fi
}

provide_solutions() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    💡 COMMON SOLUTIONS                       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo "🔄 Restart services:"
    echo "   docker-compose restart"
    echo ""
    
    echo "🔨 Rebuild containers:"
    echo "   docker-compose build --no-cache"
    echo "   docker-compose up -d"
    echo ""
    
    echo "🗑️  Reset everything:"
    echo "   docker-compose down -v"
    echo "   docker-compose up -d --build"
    echo ""
    
    echo "📋 Check specific service logs:"
    echo "   docker-compose logs backend"
    echo "   docker-compose logs frontend"
    echo "   docker-compose logs db"
    echo ""
    
    echo "🔧 Manual fixes:"
    echo "   1. Ensure Docker Desktop is running"
    echo "   2. Check if ports 5555-5557 are free"
    echo "   3. Verify .env file exists and is configured"
    echo "   4. Ensure sufficient disk space (>1GB free)"
    echo "   5. Check firewall settings"
    echo ""
    
    echo "📞 Need help?"
    echo "   - Check README.md for detailed instructions"
    echo "   - Review docs/ folder for troubleshooting"
    echo "   - Open an issue on GitHub"
}

run_quick_fixes() {
    echo -e "${YELLOW}🔧 Running quick fixes...${NC}"
    
    # Restart containers
    echo "Restarting containers..."
    docker-compose restart
    
    # Wait for services
    echo "Waiting for services to start..."
    sleep 10
    
    # Check again
    check_containers
    check_api
}

main() {
    print_banner
    
    echo -e "${YELLOW}Starting diagnostic checks...${NC}"
    echo ""
    
    local all_good=true
    
    # Run all checks
    check_docker || all_good=false
    echo ""
    
    check_containers || all_good=false
    echo ""
    
    check_logs
    echo ""
    
    check_ports || all_good=false
    echo ""
    
    check_database || all_good=false
    echo ""
    
    check_api || all_good=false
    echo ""
    
    check_resources || all_good=false
    echo ""
    
    check_network || all_good=false
    echo ""
    
    # Summary
    if [ "$all_good" = true ]; then
        echo -e "${GREEN}✅ All checks passed! AI Gateway should be working properly.${NC}"
    else
        echo -e "${RED}❌ Some issues detected. Review the output above.${NC}"
        echo ""
        provide_solutions
        
        echo ""
        read -p "Run quick fixes? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            run_quick_fixes
        fi
    fi
}

# Run main function
main "$@"
