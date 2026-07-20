from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./data.db"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"

    # MS Graph (Outlook)
    ms_graph_client_id: str = ""
    ms_graph_client_secret: str = ""
    ms_graph_tenant_id: str = ""

    # Google Calendar
    google_client_id: str = ""
    google_client_secret: str = ""

    # Remote AI fallback
    openai_api_key: str = ""

    model_config = {"env_file": ".env"}


settings = Settings()
