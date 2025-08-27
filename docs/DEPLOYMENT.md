# AI Gateway - Deployment Guide

**Version**: 0.2.11  
**Last Updated**: August 27, 2025

## 🚀 Deployment Overview

This document provides comprehensive instructions for deploying the AI Gateway in various environments, from local development to production deployment.

## 📋 Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4 GB
- **Storage**: 20 GB SSD
- **OS**: Ubuntu 20.04+, CentOS 8+, macOS 12+, Windows 10+

#### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8+ GB
- **Storage**: 50+ GB SSD
- **OS**: Ubuntu 22.04 LTS, CentOS Stream 9

### Software Dependencies

#### Backend
- Python 3.11+
- PostgreSQL 16+
- Redis 7+
- Node.js 18+ (for some utilities)

#### Frontend
- Node.js 18+
- npm 9+ or yarn 1.22+

#### Infrastructure
- Docker 24+
- Docker Compose 2+
- Nginx 1.20+
- Git 2.30+

## 🏠 Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/wsclx/ai-gateway.git
cd ai-gateway
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 4. Database Setup

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE ai_gateway;
CREATE USER ai_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ai_gateway TO ai_user;
\q

# Run database migrations
cd backend
alembic upgrade head
```

### 5. Start Services

```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 6. Verify Installation

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 🐳 Docker Deployment

### 1. Docker Compose Setup

```bash
# Copy environment template
cp docker-compose.example.yml docker-compose.yml

# Edit docker-compose.yml with your configuration
# Set environment variables, ports, and volumes
```

### 2. Environment Configuration

Create `.env` file in the root directory:

```bash
# Database
POSTGRES_DB=ai_gateway
POSTGRES_USER=ai_user
POSTGRES_PASSWORD=your_secure_password

# Redis
REDIS_PASSWORD=your_redis_password

# Backend
OPENAI_API_KEY=your_openai_api_key
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id

# Security
SECRET_KEY=your_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Services

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Database Initialization

```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Create initial admin user (if needed)
docker-compose exec backend python -m app.scripts.create_admin
```

## ☁️ Production Deployment

### 1. Server Preparation

#### Ubuntu 22.04 LTS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install -y nginx

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### CentOS Stream 9

```bash
# Update system
sudo dnf update -y

# Install essential packages
sudo dnf install -y curl wget git unzip

# Install Docker
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo dnf install -y nginx

# Configure firewall
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 2. Application Deployment

#### Clone and Configure

```bash
# Clone repository
git clone https://github.com/wsclx/ai-gateway.git
cd ai-gateway

# Create production configuration
cp docker-compose.prod.yml docker-compose.yml
cp .env.example .env

# Edit configuration files
nano .env
nano docker-compose.yml
```

#### Production Environment Variables

```bash
# Production environment
NODE_ENV=production
DEBUG=false

# Database (use external PostgreSQL for production)
DATABASE_URL=postgresql://user:password@host:5432/ai_gateway

# Redis (use external Redis for production)
REDIS_URL=redis://:password@host:6379

# Security
SECRET_KEY=your_very_long_random_secret_key
JWT_SECRET_KEY=your_jwt_secret_key

# Microsoft Azure AD
AZURE_CLIENT_ID=your_production_client_id
AZURE_CLIENT_SECRET=your_production_client_secret
AZURE_TENANT_ID=your_tenant_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Frontend
NEXT_PUBLIC_API_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=AI Gateway
```

### 3. Nginx Configuration

#### Main Configuration

```nginx
# /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Include site configurations
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

#### Site Configuration

```nginx
# /etc/nginx/sites-available/ai-gateway
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health checks
    location /health {
        proxy_pass http://localhost:8000;
        access_log off;
    }
}
```

### 4. SSL Certificate Setup

#### Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Set up automatic renewal
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. Start Production Services

```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Enable Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy AI Gateway

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Run tests
        run: |
          cd backend
          pytest
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install frontend dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run frontend tests
        run: |
          cd frontend
          npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production server..."
          # Add your deployment commands here
```

## 📊 Monitoring Setup

### 1. Application Monitoring

#### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ai-gateway-backend'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
    
  - job_name: 'ai-gateway-frontend'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
```

#### Grafana Dashboards

Create dashboards for:
- API response times
- Error rates
- User activity
- AI service usage
- System resources

### 2. Log Aggregation

#### ELK Stack Setup

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"
      
  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    ports:
      - "5044:5044"
      
  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
```

## 🔧 Maintenance & Updates

### 1. Regular Maintenance

#### Database Maintenance

```bash
# Weekly database maintenance
docker-compose exec postgres psql -U ai_user -d ai_gateway -c "VACUUM ANALYZE;"
docker-compose exec postgres psql -U ai_user -d ai_gateway -c "REINDEX DATABASE ai_gateway;"
```

#### Log Rotation

```bash
# Configure log rotation
sudo nano /etc/logrotate.d/ai-gateway

# Add configuration
/var/log/ai-gateway/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

### 2. Update Procedures

#### Application Updates

```bash
# Pull latest changes
git pull origin main

# Update dependencies
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Restart services
docker-compose down
docker-compose up -d --build

# Run database migrations
docker-compose exec backend alembic upgrade head
```

#### Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d

# Check for security vulnerabilities
docker scout cves ai-gateway-backend
docker scout cves ai-gateway-frontend
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check database status
docker-compose exec postgres pg_isready -U ai_user

# Check connection logs
docker-compose logs postgres

# Test connection
docker-compose exec backend python -c "
from app.core.database import engine
import asyncio
async def test():
    async with engine.begin() as conn:
        result = await conn.execute('SELECT 1')
        print('Database connection successful')
asyncio.run(test())
"
```

#### 2. Frontend Build Issues

```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run build

# Check for dependency conflicts
npm ls
npm audit fix
```

#### 3. Backend Startup Issues

```bash
# Check Python environment
cd backend
python --version
pip list

# Check for missing dependencies
python -c "import fastapi, sqlalchemy, pydantic; print('All imports successful')"

# Run with debug logging
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
```

### Performance Issues

#### 1. Slow Response Times

```bash
# Check database performance
docker-compose exec postgres psql -U ai_user -d ai_gateway -c "
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
"

# Check Redis performance
docker-compose exec redis redis-cli --latency
```

#### 2. High Memory Usage

```bash
# Check container resource usage
docker stats

# Check system resources
htop
free -h
df -h
```

## 📚 Additional Resources

### Documentation
- [Architecture Documentation](ARCHITECTURE.md)
- [API Documentation](API.md)
- [Design System](../design/README.md)

### External Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

### Support
- [GitHub Issues](https://github.com/wsclx/ai-gateway/issues)
- [GitHub Discussions](https://github.com/wsclx/ai-gateway/discussions)

---

**Document Version**: 0.2.11  
**Last Updated**: August 27, 2025  
**Maintainer**: Development Team
