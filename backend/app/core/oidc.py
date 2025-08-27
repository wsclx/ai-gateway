from typing import Optional, Dict, Any
import httpx
from fastapi import HTTPException, status
from app.core.config import settings


class GoogleOIDC:
    """Google OIDC/OAuth2 integration"""
    
    def __init__(self):
        self.client_id = settings.OIDC_CLIENT_ID
        self.client_secret = settings.OIDC_CLIENT_SECRET
        self.issuer = settings.OIDC_ISSUER
        self.discovery_url = f"{self.issuer}/.well-known/openid_configuration"
        self._discovery_doc: Optional[Dict[str, Any]] = None
    
    async def get_discovery_document(self) -> Dict[str, Any]:
        """Get OIDC discovery document"""
        if self._discovery_doc is None:
            async with httpx.AsyncClient() as client:
                response = await client.get(self.discovery_url)
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Failed to fetch OIDC discovery document"
                    )
                self._discovery_doc = response.json()
        return self._discovery_doc
    
    async def exchange_code_for_tokens(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange authorization code for tokens"""
        discovery_doc = await self.get_discovery_document()
        token_endpoint = discovery_doc.get("token_endpoint")
        
        if not token_endpoint:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Token endpoint not found in discovery document"
            )
        
        # Exchange code for tokens
        token_data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_endpoint, data=token_data)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to exchange code for tokens"
                )
            return response.json()
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user info from Google"""
        discovery_doc = await self.get_discovery_document()
        userinfo_endpoint = discovery_doc.get("userinfo_endpoint")
        
        if not userinfo_endpoint:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Userinfo endpoint not found in discovery document"
            )
        
        headers = {"Authorization": f"Bearer {access_token}"}
        async with httpx.AsyncClient() as client:
            response = await client.get(userinfo_endpoint, headers=headers)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get user info"
                )
            return response.json()
    
    def get_authorization_url(self, redirect_uri: str, state: str, scope: str = "openid email profile") -> str:
        """Generate Google OAuth2 authorization URL"""
        discovery_doc = self._discovery_doc or {}
        auth_endpoint = discovery_doc.get(
            "authorization_endpoint", 
            "https://accounts.google.com/o/oauth2/v2/auth"
        )
        
        params = {
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": scope,
            "state": state,
            "access_type": "offline",
            "prompt": "consent"
        }
        
        query_string = "&".join(
            [f"{k}={v}" for k, v in params.items()]
        )
        return f"{auth_endpoint}?{query_string}"


# Create OIDC instance
oidc = GoogleOIDC()
