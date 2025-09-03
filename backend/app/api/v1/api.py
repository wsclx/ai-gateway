from fastapi import APIRouter

from app.api.v1.endpoints import auth, chat, assistants, analytics, tickets, system, admin, users, settings, training

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(assistants.router, prefix="/assistants", tags=["assistants"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(training.router, prefix="/training", tags=["training"])
