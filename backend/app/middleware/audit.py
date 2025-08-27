from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from typing import Callable
import time

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.audit import AuditLog
from app.models.user import User


class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
        start = time.time()
        request_bytes = int(request.headers.get("content-length", "0") or 0)
        ip = request.client.host if request.client else None
        ua = request.headers.get("user-agent")

        response: Response = await call_next(request)

        duration_ms = int((time.time() - start) * 1000)
        response_bytes = int(response.headers.get("content-length", "0") or 0)

        # Best-effort async DB write, do not block request
        async with AsyncSessionLocal() as db:  # type: AsyncSession
            audit = AuditLog(
                method=request.method,
                path=str(request.url.path),
                status=response.status_code,
                ip=ip,
                user_agent=ua,
                duration_ms=duration_ms,
                request_bytes=request_bytes,
                response_bytes=response_bytes,
            )
            db.add(audit)
            try:
                await db.commit()
            except Exception:
                await db.rollback()

        return response


