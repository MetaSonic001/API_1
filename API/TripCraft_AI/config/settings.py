"""
Updated config/settings.py - Remove OpenAI dependencies
"""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings - All Free & Open Source"""
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Free API Keys (Optional)
    HUGGINGFACE_TOKEN: Optional[str] = None  # Free tier available
    GOOGLE_MAPS_API_KEY: Optional[str] = None  # Has free tier
    
    # Vector Database
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: Optional[str] = None
    
    # Ollama Settings (Completely Free)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "gemma2:2b"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"
    
    # Free Embedding Models
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    MULTIMODAL_MODEL: str = "microsoft/resnet-50"  # Free alternative
    
    # MCP Settings
    MCP_TIMEOUT: int = 60
    
    # Rate Limiting
    RATE_LIMIT_CALLS: int = 100
    RATE_LIMIT_PERIOD: int = 3600
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    return Settings()