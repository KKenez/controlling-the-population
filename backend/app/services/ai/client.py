from abc import ABC, abstractmethod

import httpx

from app.config import settings


class LLMClient(ABC):
    @abstractmethod
    async def generate(self, prompt: str) -> str: ...


class OllamaClient(LLMClient):
    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.model = settings.ollama_model

    async def generate(self, prompt: str) -> str:
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
            )
            response.raise_for_status()
            return response.json()["response"]


class RemoteAPIClient(LLMClient):
    """OpenAI-compatible remote fallback."""

    def __init__(self):
        self.api_key = settings.openai_api_key

    async def generate(self, prompt: str) -> str:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]


def get_llm_client() -> LLMClient:
    if settings.openai_api_key:
        return RemoteAPIClient()
    return OllamaClient()
