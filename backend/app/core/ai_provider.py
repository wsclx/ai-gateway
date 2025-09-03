import asyncio
import random
from typing import Dict, Any, Optional
from fastapi import HTTPException
import httpx
from app.core.config import settings


class AIProvider:
    """AI Provider abstraction layer with demo mode support"""
    
    def __init__(self):
        self.provider = settings.AI_PROVIDER or "demo"
        self.client = httpx.AsyncClient(timeout=30.0)
        
    async def get_completion(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Get AI completion with fallback to demo mode"""
        
        if self.provider == "demo":
            return await self._demo_response(prompt, **kwargs)
        elif self.provider == "openai":
            return await self._openai_completion(prompt, **kwargs)
        elif self.provider == "anthropic":
            return await self._anthropic_completion(prompt, **kwargs)
        elif self.provider == "ollama":
            return await self._ollama_completion(prompt, **kwargs)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported AI provider: {self.provider}")
    
    async def _demo_response(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Simulierte AI-Antworten für Demo-Zwecke"""
        
        # Simulierte Typing-Verzögerung
        await asyncio.sleep(random.uniform(0.5, 1.5))
        
        # Pattern matching für Demo-Antworten
        prompt_lower = prompt.lower()
        
        demo_responses = {
            "hello": "Hallo! Ich bin der Demo-Assistent von AI Gateway. In der Produktionsumgebung würde hier eine echte AI-Antwort stehen. Sie können mich alles fragen!",
            "help": "Dies ist der Demo-Modus von AI Gateway. Konfigurieren Sie einen AI-Provider in den Einstellungen für echte AI-Funktionalität. Ich kann trotzdem Ihre Fragen beantworten!",
            "hr": "Als HR-Assistent helfe ich Ihnen gerne bei Personalmanagement-Fragen. In der Demo-Version gebe ich allgemeine Antworten. Für spezifische Beratung konfigurieren Sie bitte einen echten AI-Provider.",
            "it": "Als IT-Support Assistent kann ich Ihnen bei technischen Problemen helfen. In der Demo-Version sind meine Antworten allgemeiner Natur. Für detaillierte technische Unterstützung aktivieren Sie bitte einen echten AI-Provider.",
            "business": "Als Business-Assistent kann ich Ihnen bei strategischen Fragen helfen. In der Demo-Version gebe ich allgemeine Geschäftsberatung. Für spezifische Analysen konfigurieren Sie bitte einen echten AI-Provider.",
            "marketing": "Als Marketing-Assistent helfe ich Ihnen bei Marketing-Strategien und Kampagnen. In der Demo-Version sind meine Antworten allgemeiner Natur. Für detaillierte Marketing-Beratung aktivieren Sie bitte einen echten AI-Provider.",
            "finance": "Als Finance-Assistent kann ich Ihnen bei Finanzfragen helfen. In der Demo-Version gebe ich allgemeine Finanzberatung. Für spezifische Finanzanalysen konfigurieren Sie bitte einen echten AI-Provider.",
            "legal": "Als Legal-Assistent kann ich Ihnen bei rechtlichen Fragen helfen. In der Demo-Version sind meine Antworten allgemeiner Natur. Für spezifische Rechtsberatung aktivieren Sie bitte einen echten AI-Provider.",
            "sales": "Als Sales-Assistent helfe ich Ihnen bei Verkaufsstrategien und Kundenbeziehungen. In der Demo-Version gebe ich allgemeine Verkaufsberatung. Für detaillierte Sales-Unterstützung konfigurieren Sie bitte einen echten AI-Provider.",
            "customer": "Als Customer-Service-Assistent helfe ich Ihnen bei Kundenfragen und Support. In der Demo-Version sind meine Antworten allgemeiner Natur. Für spezifischen Kundenservice aktivieren Sie bitte einen echten AI-Provider."
        }
        
        # Check for specific patterns
        for pattern, response in demo_responses.items():
            if pattern in prompt_lower:
                return {
                    "content": response,
                    "model": "demo-gpt-4o-mini",
                    "usage": {
                        "prompt_tokens": len(prompt.split()),
                        "completion_tokens": len(response.split()),
                        "total_tokens": len(prompt.split()) + len(response.split())
                    },
                    "finish_reason": "stop"
                }
        
        # Default demo response
        default_responses = [
            f"[Demo-Modus] Ihre Anfrage: '{prompt[:50]}{'...' if len(prompt) > 50 else ''}' würde an die konfigurierte AI weitergeleitet werden. Dies ist eine simulierte Antwort.",
            f"Im Demo-Modus kann ich Ihre Frage '{prompt[:30]}...' verstehen, aber für eine echte AI-Antwort konfigurieren Sie bitte einen AI-Provider in den Einstellungen.",
            f"Demo-Antwort: Ich verstehe Ihre Anfrage '{prompt[:40]}...'. Für detaillierte Antworten aktivieren Sie bitte einen echten AI-Provider.",
            f"Als Demo-Assistent kann ich Ihre Frage '{prompt[:35]}...' verarbeiten. Für spezifische Antworten konfigurieren Sie bitte einen AI-Provider.",
            f"Demo-Modus: Ihre Anfrage '{prompt[:45]}...' wird simuliert. Für echte AI-Funktionalität konfigurieren Sie bitte einen Provider."
        ]
        
        return {
            "content": random.choice(default_responses),
            "model": "demo-gpt-4o-mini",
            "usage": {
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": 25,
                "total_tokens": len(prompt.split()) + 25
            },
            "finish_reason": "stop"
        }
    
    async def _openai_completion(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """OpenAI API completion"""
        if not settings.OPENAI_API_KEY:
            raise HTTPException(status_code=400, detail="OpenAI API key not configured")
        
        try:
            response = await self.client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": kwargs.get("model", "gpt-4o-mini"),
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": kwargs.get("temperature", 0.7),
                    "max_tokens": kwargs.get("max_tokens", 1000)
                }
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "content": data["choices"][0]["message"]["content"],
                "model": data["model"],
                "usage": data["usage"],
                "finish_reason": data["choices"][0]["finish_reason"]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"OpenAI API error: {str(e)}")
    
    async def _anthropic_completion(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Anthropic API completion"""
        if not settings.ANTHROPIC_API_KEY:
            raise HTTPException(status_code=400, detail="Anthropic API key not configured")
        
        try:
            response = await self.client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.ANTHROPIC_API_KEY,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": kwargs.get("model", "claude-3-sonnet-20240229"),
                    "max_tokens": kwargs.get("max_tokens", 1000),
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "content": data["content"][0]["text"],
                "model": data["model"],
                "usage": data["usage"],
                "finish_reason": "stop"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Anthropic API error: {str(e)}")
    
    async def _ollama_completion(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Ollama local completion"""
        try:
            response = await self.client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": kwargs.get("model", "llama2"),
                    "prompt": prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            data = response.json()
            
            return {
                "content": data["response"],
                "model": data["model"],
                "usage": {
                    "prompt_tokens": data.get("prompt_eval_count", 0),
                    "completion_tokens": data.get("eval_count", 0),
                    "total_tokens": data.get("prompt_eval_count", 0) + data.get("eval_count", 0)
                },
                "finish_reason": "stop"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Ollama API error: {str(e)}")
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


# Global AI provider instance
ai_provider = AIProvider()
