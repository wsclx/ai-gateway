import asyncio
import logging
from typing import Any, Dict, List, Optional

import httpx
import openai
from app.core.config import settings

logger = logging.getLogger(__name__)


class OpenAIClient:
    """OpenAI API client for DUH AI Gateway"""
    
    def __init__(self):
        # Default client (still usable for Chat Completions fallback)
        self.client = openai.OpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
        )
        self.default_model = "gpt-4o-mini"
        self.max_tokens = 4000
        self.temperature = 0.7

        # Base headers for REST calls
        self._rest_headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
    
    # --------------------
    # Conversations/Responses (REST)
    # --------------------
    async def create_conversation(
        self, title: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create an OpenAI Conversation (Responses API)."""
        try:
            payload = {}
            if title:
                payload["title"] = title
                
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{settings.OPENAI_BASE_URL}/conversations",
                    headers=self._rest_headers,
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()
                return {
                    "id": data.get("id"),
                    "title": data.get("title", title or "Neue Konversation"),
                    "created": data.get("created"),
                    "status": "active"
                }
        except Exception as e:
            logger.error(f"Failed to create conversation: {e}")
            raise

    async def get_conversation(
        self, conversation_id: str
    ) -> Dict[str, Any]:
        """Get conversation details and metadata."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(
                    f"{settings.OPENAI_BASE_URL}/conversations/{conversation_id}",
                    headers=self._rest_headers,
                )
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            logger.error(
                f"Failed to get conversation {conversation_id}: {e}"
            )
            raise

    async def list_conversations(
        self, limit: int = 20, before: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List user conversations with pagination."""
        try:
            params = {"limit": limit}
            if before:
                params["before"] = before
                
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(
                    f"{settings.OPENAI_BASE_URL}/conversations",
                    headers=self._rest_headers,
                    params=params,
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Failed to list conversations: {e}")
            return []

    async def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.delete(
                    f"{settings.OPENAI_BASE_URL}/conversations/{conversation_id}",
                    headers=self._rest_headers,
                )
                resp.raise_for_status()
                return True
        except Exception as e:
            logger.error(
                f"Failed to delete conversation {conversation_id}: {e}"
            )
            return False

    async def responses_create(
        self,
        input_text: str,
        model: Optional[str] = None,
        conversation_id: Optional[str] = None,
        instructions: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Create a response via Responses API.
        Returns short text and the raw payload.

        Falls back to Chat Completions if /responses is unavailable.
        """
        payload: Dict[str, Any] = {
            "model": model or self.default_model,
            "input": input_text,
        }
        if instructions:
            payload["instructions"] = instructions
        if conversation_id:
            payload["conversation"] = conversation_id

        try:
            async with httpx.AsyncClient(timeout=45.0) as client_http:
                r = await client_http.post(
                    f"{settings.OPENAI_BASE_URL}/responses",
                    headers=self._rest_headers,
                    json=payload,
                )
                r.raise_for_status()
                data = r.json()
                # Prefer output_text if available; otherwise extract from output tree
                text = data.get("output_text")
                if not text:
                    try:
                        outputs = data.get("output") or []
                        if outputs and isinstance(outputs, list):
                            first = outputs[0]
                            content = (first.get("content") or [])
                            if content and isinstance(content, list):
                                text = content[0].get("text") or ""
                    except Exception:
                        text = None
                return {"text": text or "", "raw": data}
        except Exception as e:
            logger.warning(
                "Responses API failed, falling back to Chat Completions: %s",
                e,
            )
            # Fallback to Chat Completions
            result = await self.chat_completion(
                messages=[{"role": "user", "content": input_text}],
                model=model or self.default_model,
            )
            return {"text": result.get("content", ""), "raw": result}
    
    # ------------- (Deprecated: Assistants API) -------------
    # Keep placeholders to avoid breaking imports; no-op or raise in future.
    async def create_thread(self) -> Dict[str, Any]:
        """Deprecated: kept for backward compatibility; no longer used."""
        logger.warning(
            "create_thread (Assistants API) is deprecated and unused."
        )
        await asyncio.sleep(0)
        return {"id": "deprecated", "created_at": None}
    
    async def add_message_to_thread(
        self,
        thread_id: str,
        content: str,
        role: str = "user",
    ) -> Dict[str, Any]:
        logger.warning(
            "add_message_to_thread (Assistants API) is deprecated and unused."
        )
        await asyncio.sleep(0)
        return {
            "id": "deprecated",
            "thread_id": thread_id,
            "role": role,
            "content": content,
            "created_at": None,
        }
    
    async def run_assistant(
        self,
        thread_id: str,
        assistant_id: str,
    ) -> Dict[str, Any]:
        logger.warning(
            "run_assistant (Assistants API) is deprecated and unused."
        )
        await asyncio.sleep(0)
        return {
            "id": "deprecated",
            "thread_id": thread_id,
            "assistant_id": assistant_id,
            "status": "deprecated",
            "created_at": None,
        }
    
    async def get_run_status(
        self,
        thread_id: str,
        run_id: str,
    ) -> Dict[str, Any]:
        logger.warning(
            "get_run_status (Assistants API) is deprecated and unused."
        )
        await asyncio.sleep(0)
        return {
            "id": run_id,
            "status": "deprecated",
            "completed_at": None,
            "required_action": None,
        }
    
    async def get_thread_messages(
        self,
        thread_id: str,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        logger.warning(
            "get_thread_messages (Assistants API) is deprecated and unused."
        )
        await asyncio.sleep(0)
        return []
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Direct chat completion (alternative to Assistants API)"""
        try:
            response = self.client.chat.completions.create(
                model=model or self.default_model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            
            usage = response.usage
            return {
                "content": response.choices[0].message.content,
                "model": response.model,
                "usage": {
                    "prompt_tokens": usage.prompt_tokens,
                    "completion_tokens": usage.completion_tokens,
                    "total_tokens": usage.total_tokens
                },
                "finish_reason": response.choices[0].finish_reason
            }
        except Exception as e:
            logger.error(f"Failed to get chat completion: {e}")
            raise
    
    async def list_assistants(self) -> List[Dict[str, Any]]:
        logger.warning(
            "list_assistants (Assistants API) is deprecated and unused."
        )
        await asyncio.sleep(0)
        return []
    
    async def update_assistant(
        self,
        assistant_id: str,
        **kwargs,
    ) -> Dict[str, Any]:
        logger.warning(
            "update_assistant (Assistants API) is deprecated and unused."
        )
        await asyncio.sleep(0)
        return {"id": assistant_id, "updated": False, "kwargs": dict(kwargs)}
    
    async def delete_assistant(self, assistant_id: str) -> bool:
        logger.warning(
            "delete_assistant (Assistants API) is deprecated and unused."
        )
        await asyncio.sleep(0)
        return True

    # --------------------
    # Training & Finetuning
    # --------------------
    
    async def create_finetuning_job(
        self, 
        training_file_id: str,
        model: str = "gpt-4o-mini",
        hyperparameters: Optional[Dict[str, Any]] = None,
        suffix: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create an OpenAI fine-tuning job."""
        try:
            payload = {
                "training_file": training_file_id,
                "model": model
            }
            
            if hyperparameters:
                payload["hyperparameters"] = hyperparameters
            if suffix:
                payload["suffix"] = suffix
                
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{settings.OPENAI_BASE_URL}/fine_tuning/jobs",
                    headers=self._rest_headers,
                    json=payload,
                )
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            logger.error(f"Failed to create fine-tuning job: {e}")
            raise
    
    async def get_finetuning_job(self, job_id: str) -> Dict[str, Any]:
        """Get fine-tuning job details."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(
                    f"{settings.OPENAI_BASE_URL}/fine_tuning/jobs/{job_id}",
                    headers=self._rest_headers,
                )
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            logger.error(
                f"Failed to get fine-tuning job {job_id}: {e}"
            )
            raise
    
    async def list_finetuning_jobs(
        self, 
        limit: int = 20, 
        after: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List fine-tuning jobs."""
        try:
            params = {"limit": limit}
            if after:
                params["after"] = after
                
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(
                    f"{settings.OPENAI_BASE_URL}/fine_tuning/jobs",
                    headers=self._rest_headers,
                    params=params,
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Failed to list fine-tuning jobs: {e}")
            return []
    
    async def cancel_finetuning_job(self, job_id: str) -> Dict[str, Any]:
        """Cancel a fine-tuning job."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    f"{settings.OPENAI_BASE_URL}/fine_tuning/jobs/{job_id}/cancel",
                    headers=self._rest_headers,
                )
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            logger.error(
                f"Failed to cancel fine-tuning job {job_id}: {e}"
            )
            raise
    
    async def upload_training_file(
        self, 
        file_path: str, 
        purpose: str = "fine-tune"
    ) -> Dict[str, Any]:
        """Upload a training file for fine-tuning."""
        try:
            with open(file_path, 'rb') as f:
                files = {'file': f}
                data = {'purpose': purpose}
                
                async with httpx.AsyncClient(timeout=60.0) as client:
                    resp = await client.post(
                        f"{settings.OPENAI_BASE_URL}/files",
                        headers={
                            "Authorization": f"Bearer {settings.OPENAI_API_KEY}"
                        },
                        files=files,
                        data=data,
                    )
                    resp.raise_for_status()
                    return resp.json()
        except Exception as e:
            logger.error(f"Failed to upload training file: {e}")
            raise
    
    async def list_files(self) -> List[Dict[str, Any]]:
        """List uploaded files."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(
                    f"{settings.OPENAI_BASE_URL}/files",
                    headers=self._rest_headers,
                )
                resp.raise_for_status()
                data = resp.json()
                return data.get("data", [])
        except Exception as e:
            logger.error(f"Failed to list files: {e}")
            return []
    
    async def delete_file(self, file_id: str) -> Dict[str, Any]:
        """Delete an uploaded file."""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.delete(
                    f"{settings.OPENAI_BASE_URL}/files/{file_id}",
                    headers=self._rest_headers,
                )
                resp.raise_for_status()
                return resp.json()
        except Exception as e:
            logger.error(f"Failed to delete file {file_id}: {e}")
            raise


# Create global instance
openai_client = OpenAIClient()


def get_openai_client() -> OpenAIClient:
    """Get the global OpenAI client instance"""
    return openai_client
