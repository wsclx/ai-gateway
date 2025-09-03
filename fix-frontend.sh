#!/bin/bash

echo "🔧 Fixing AI Gateway Frontend-Backend Communication..."

# 1. Fix Frontend Environment Variable
echo "📝 Creating frontend .env.local file..."
cat > /Users/mario/DEV/ai-gateway/frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5555/api/v1
NEXT_PUBLIC_APP_NAME=AI Gateway
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF

# 2. Update Backend CORS to be more permissive
echo "🔧 Updating Backend CORS configuration..."
cat > /Users/mario/DEV/ai-gateway/backend/main.py << 'EOF'
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
import logging

from app.core.config import settings
from app.api.v1.api import api_router
from app.middleware.audit import AuditMiddleware
from app.core.database import init_db, engine
from app.middleware.rate_limit import limiter, RateLimitExceeded, _rate_limit_exceeded_handler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app_: FastAPI):
    # Startup
    logger.info("Starting AI Gateway...")
    logger.info("Environment: %s", settings.ENVIRONMENT)
    logger.info("Database URL: %s", settings.DATABASE_URL)

    # Initialize database tables
    try:
        await init_db()
        logger.info("Database tables created or already present")
    except Exception as e:
        logger.error("Database initialization failed: %s", e)

    yield

    # Shutdown
    logger.info("Shutting down AI Gateway...")
    await engine.dispose()

# Create FastAPI app
app = FastAPI(
    title="AI Gateway",
    description="Internes AI Gateway für Abteilungen mit DSGVO-konform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration - FIXED for localhost development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5556",
        "http://localhost:3000",
        "http://localhost:5555",
        "http://127.0.0.1:5556",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5555"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Audit middleware
app.add_middleware(AuditMiddleware)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    if request.method == "OPTIONS":
        response = await call_next(request)
        return response
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "AI Gateway",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# 3. Rebuild and restart containers
echo "🐳 Restarting Docker containers..."
cd /Users/mario/DEV/ai-gateway
docker-compose down
docker-compose up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 10

# 4. Test the fix
echo "🧪 Testing API endpoints..."
echo "Backend health:"
curl -s http://localhost:5555/health | python3 -m json.tool

echo -e "\n🎉 Fix applied! Please check http://localhost:5556"
echo "If still showing errors, check browser console for CORS issues."
