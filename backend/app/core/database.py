from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import settings

# Convert PostgreSQL URL to async
async_database_url = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+asyncpg://"
)

# Create async engine
engine = create_async_engine(
    async_database_url,
    echo=settings.DEBUG,
    poolclass=NullPool,  # For development
    future=True
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()


async def get_db():
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

def get_db_sync():
    """Synchronous database session for testing"""
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy import create_engine
    
    # Create sync engine
    sync_database_url = settings.DATABASE_URL
    engine = create_engine(sync_database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    with SessionLocal() as session:
        try:
            yield session
        finally:
            session.close()


async def init_db():
    """Initialize database tables"""
    async with engine.begin() as conn:
        # Import models here to ensure they are registered
        from app.models import user, assistant, chat, audit, ticket, config
        
        await conn.run_sync(Base.metadata.create_all)
