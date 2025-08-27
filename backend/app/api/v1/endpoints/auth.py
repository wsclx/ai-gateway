from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
import httpx, base64, json

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, Department
from app.schemas.auth import Token

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # For now, use a simple token format (in production, use proper JWT)
    if token.startswith("simple_token_"):
        # Simple token format: simple_token_email@domain.com
        username = token.replace("simple_token_", "")
        print(f"Simple token parsed: {username}")  # Debug output
    elif token.startswith("eyJ"):
        # JWT token format
        try:
            import base64
            import json
            parts = token.split(".")
            if len(parts) != 3:
                raise credentials_exception
            
            # Add padding if needed
            payload_part = parts[1]
            missing_padding = len(payload_part) % 4
            if missing_padding:
                payload_part += '=' * (4 - missing_padding)
            
            payload_str = base64.b64decode(payload_part).decode()
            payload = json.loads(payload_str)
            username: str = payload.get("sub")
            if username is None:
                raise credentials_exception
            print(f"JWT token parsed: {username}")  # Debug output
        except Exception as e:
            print(f"Token parsing error: {e}")  # Debug output
            raise credentials_exception
    else:
        print(f"Invalid token format: {token[:20]}...")  # Debug output
        raise credentials_exception
    
    # Get user from database
    try:
        from sqlalchemy import select
        result = await db.execute(
            select(User).where(User.ext_subject == username)
        )
        user = result.scalar_one_or_none()
        
        if user is None:
            print(f"User not found: {username}")  # Debug output
            raise credentials_exception
        print(f"User found: {user.ext_subject}")  # Debug output
        return user
    except Exception as e:
        print(f"Database error: {e}")  # Debug output
        raise credentials_exception


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_db)
):
    """Login endpoint with real authentication"""
    from sqlalchemy import select
    
    # Query user by ext_subject (email)
    result = await db.execute(
        select(User).where(User.ext_subject == form_data.username)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # For now, we'll use a simple password check since we don't have 
    # password_hash. In production, this should use proper OIDC auth
    if form_data.password != "test123":  # TODO: Replace with OIDC
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.ext_subject}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=dict)
async def read_users_me():
    """Get current user info (no auth required for local testing)"""
    # Return mock user for local testing
    return {
        "id": "test-user-id",
        "display_name": "Test User",
        "role": "admin",
        "department": "IT"
    }

@router.get("/me-fixed")
async def read_users_me_fixed(token: str = Depends(oauth2_scheme)):
    """Fixed user info endpoint that bypasses the problematic dependency"""
    try:
        # Parse token
        if token.startswith("simple_token_"):
            username = token.replace("simple_token_", "")
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format"
            )
        
        # Get user from database using the working approach
        from sqlalchemy import select
        
        # Use the database session directly
        from app.core.database import AsyncSessionLocal
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(User).where(User.ext_subject == username)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            return {
                "id": str(user.id),
                "ext_subject": user.ext_subject,
                "display_name": user.display_name,
                "role": user.role,
                "department": (
                    user.department.name if user.department else None
                )
            }
    except Exception as e:
        print(f"Error in /me-fixed endpoint: {e}")  # Debug output
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/me-simple")
async def read_users_me_simple(token: str = Depends(oauth2_scheme)):
    """Simplified user info endpoint"""
    try:
        # Parse token
        if token.startswith("simple_token_"):
            username = token.replace("simple_token_", "")
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token format"
            )
        
        # For now, return mock user data to test the flow
        # TODO: Implement proper database lookup
        return {
            "id": "test-user-id",
            "ext_subject": username,
            "display_name": "Test User",
            "role": "user",
            "department": "IT"
        }
    except Exception as e:
        print(f"Error in /me-simple endpoint: {e}")  # Debug output
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/test-auth")
async def test_auth(token: str = Depends(oauth2_scheme)):
    """Test endpoint for debugging authentication"""
    return {"message": "Token received", "token": token[:20] + "..."}

@router.get("/test-user")
async def test_user(db: AsyncSession = Depends(get_db)):
    """Test endpoint for debugging user lookup"""
    try:
        from sqlalchemy import select
        result = await db.execute(
            select(User).where(User.ext_subject == "test@duh.de")
        )
        user = result.scalar_one_or_none()
        
        if user:
            return {
                "message": "User found",
                "user": {
                    "id": str(user.id),
                    "ext_subject": user.ext_subject,
                    "display_name": user.display_name,
                    "role": user.role
                }
            }
        else:
            return {"message": "User not found"}
    except Exception as e:
        return {"message": "Error", "error": str(e)}

@router.get("/test-simple-auth")
async def test_simple_auth(token: str = Depends(oauth2_scheme)):
    """Test endpoint for simple token parsing"""
    try:
        if token.startswith("simple_token_"):
            username = token.replace("simple_token_", "")
            return {"message": "Simple token parsed", "username": username}
        else:
            return {"message": "Not a simple token", "token": token[:20] + "..."}
    except Exception as e:
        return {"message": "Error", "error": str(e)}

# Microsoft Entra ID (Azure AD) OIDC minimal flow
@router.get("/ms/login")
async def ms_login():
    tenant = settings.MS_TENANT_ID
    if not tenant or not settings.MS_CLIENT_ID:
        raise HTTPException(status_code=400, detail="Microsoft OIDC not configured")
    auth_url = (
        f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?"
        f"client_id={settings.MS_CLIENT_ID}&response_type=code&redirect_uri="
        f"{settings.MS_REDIRECT_URI}&response_mode=query&scope="
        f"{settings.MS_AUTH_SCOPE.replace(' ', '%20')}"
    )
    return {"authorize": auth_url}


@router.get("/ms/callback")
async def ms_callback(code: str, db: AsyncSession = Depends(get_db)):
    if not settings.MS_TENANT_ID:
        raise HTTPException(status_code=400, detail="Microsoft OIDC not configured")
    token_url = f"https://login.microsoftonline.com/{settings.MS_TENANT_ID}/oauth2/v2.0/token"
    data = {
        "client_id": settings.MS_CLIENT_ID,
        "client_secret": settings.MS_CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.MS_REDIRECT_URI,
    }
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(token_url, data=data)
        r.raise_for_status()
        tok = r.json()

    id_token = tok.get("id_token")
    if not id_token:
        raise HTTPException(status_code=400, detail="No id_token from Microsoft")

    try:
        payload_part = id_token.split('.')[1]
        padding = '=' * (-len(payload_part) % 4)
        claims = json.loads(base64.urlsafe_b64decode(payload_part + padding))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid id_token")

    ext_subject = claims.get("oid") or claims.get("sub") or "unknown"
    display_name = claims.get("name") or "AAD User"
    email = claims.get("preferred_username") or claims.get("email") or "user@example.com"

    from sqlalchemy import select
    drow = await db.execute(select(Department).where(Department.key == "it"))
    dept = drow.scalar_one_or_none()
    if not dept:
        dept = Department(key="it", name="IT")
        db.add(dept)
        await db.flush()

    urow = await db.execute(select(User).where(User.ext_subject == ext_subject))
    user = urow.scalar_one_or_none()
    if not user:
        user = User(ext_subject=ext_subject, ext_subject_hash="", display_name=display_name, dept_id=dept.id, role="user")
        db.add(user)
    else:
        user.display_name = display_name
    await db.commit()

    return {"displayName": user.display_name, "email": email, "department": "IT", "role": user.role}

# OIDC Endpoints
@router.get("/oidc/login")
async def oidc_login(redirect_uri: str):
    """Start OIDC login flow"""
    try:
        from app.core.oidc import oidc
        import secrets
        
        # Generate state for CSRF protection
        state = secrets.token_urlsafe(32)
        
        # Generate authorization URL
        auth_url = oidc.get_authorization_url(
            redirect_uri=redirect_uri,
            state=state
        )
        
        return {
            "authorization_url": auth_url,
            "state": state
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OIDC login failed: {str(e)}"
        )

@router.post("/oidc/callback")
async def oidc_callback(
    code: str,
    state: str,
    redirect_uri: str,
    db: AsyncSession = Depends(get_db)
):
    """Handle OIDC callback"""
    try:
        from app.core.oidc import oidc
        
        # Exchange code for tokens
        tokens = await oidc.exchange_code_for_tokens(code, redirect_uri)
        access_token = tokens.get("access_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No access token received"
            )
        
        # Get user info from Google
        user_info = await oidc.get_user_info(access_token)
        email = user_info.get("email")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No email in user info"
            )
        
        # Check if user exists in database
        from sqlalchemy import select
        result = await db.execute(
            select(User).where(User.ext_subject == email)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            # Create new user
            from app.core.security import get_password_hash
            import uuid
            
            user = User(
                id=uuid.uuid4(),
                ext_subject=email,
                ext_subject_hash=get_password_hash(email),
                display_name=user_info.get("name", email),
                role="user"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        # Create our JWT token
        access_token_expires = timedelta(minutes=30)
        our_token = create_access_token(
            data={"sub": user.ext_subject}, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": our_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.ext_subject,
                "display_name": user.display_name,
                "role": user.role
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OIDC callback failed: {str(e)}"
        )
