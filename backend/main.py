from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import time
import logging
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

from app.core.config import settings
# Temporär auskommentiert für lokalen Test
# from app.core.database import engine
# from app.models import Base
from app.api.v1.api import api_router
from app.middleware.audit import AuditMiddleware

from app.core.database import init_db, engine  # re-activated


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logging.info("Starting Audiencly AI Gateway...")
    logging.info(f"Environment: {settings.ENVIRONMENT}")
    logging.info(f"Database URL: {settings.DATABASE_URL}")
    
    # OpenTelemetry tracing
    try:
        resource = Resource.create({"service.name": "audiencly-ai-gateway"})
        provider = TracerProvider(resource=resource)
        # Prefer OTLP if configured, else console exporter
        try:
            from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
            exporter = OTLPSpanExporter()
        except Exception:
            from opentelemetry.exporter.console.span import ConsoleSpanExporter
            exporter = ConsoleSpanExporter()
        provider.add_span_processor(BatchSpanProcessor(exporter))
        trace.set_tracer_provider(provider)
        FastAPIInstrumentor.instrument_app(app)
        logging.info("OpenTelemetry tracing initialized")
    except Exception as e:
        logging.error(f"OTel init failed: {e}")

    # Initialize database tables
    try:
        await init_db()
        logging.info("Database tables created or already present")
    except Exception as e:
        logging.error(f"Database initialization failed: {e}")
    
    yield


    # Shutdown
    logging.info("Shutting down Audiencly AI Gateway...")
    # Dispose engine
    await engine.dispose()

# Create FastAPI app
app = FastAPI(
    title="Audiencly AI Gateway",
    description="Internes AI Gateway für Abteilungen mit DSGVO-konform",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit middleware
app.add_middleware(AuditMiddleware)

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Prometheus basic metrics
REQUEST_COUNT = Counter("http_requests_total", "Total HTTP requests", ["path", "method", "status"])
REQUEST_LATENCY = Histogram("http_request_duration_seconds", "HTTP request latency", ["path", "method"])

@app.middleware("http")
async def prometheus_middleware(request: Request, call_next):
    path = request.url.path
    method = request.method
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    REQUEST_LATENCY.labels(path=path, method=method).observe(duration)
    REQUEST_COUNT.labels(path=path, method=method, status=response.status_code).inc()
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
        "message": "Audiencly AI Gateway",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/metrics")
async def metrics():
    data = generate_latest()
    return Response(content=data, media_type=CONTENT_TYPE_LATEST)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
