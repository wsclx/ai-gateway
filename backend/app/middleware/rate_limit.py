from slowapi import Limiter, _rate_limit_exceeded_handler  # type: ignore
from slowapi.util import get_remote_address  # type: ignore
from slowapi.errors import RateLimitExceeded  # type: ignore

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100/minute"],
)  # default global limit

__all__ = [
    "limiter",
    "RateLimitExceeded",
    "_rate_limit_exceeded_handler",
]


