"""
tools/vector_store.py - Qdrant Vector Database
"""
from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import List, Dict, Any, Optional
import uuid

from config.settings import get_settings

settings = get_settings()
print(settings.OLLAMA_MODEL)  # should print "gemma2:2b" from your .env


class VectorStore:
    def __init__(self):
        self.settings = get_settings()
        self.client = QdrantClient(
            url=self.settings.QDRANT_URL,
            api_key=self.settings.QDRANT_API_KEY
        )
        self.collection_name = "travel_experiences"
        
    async def initialize(self):
        """Initialize vector store collections"""
        try:
            # Create collection if it doesn't exist
            collections = self.client.get_collections().collections
            if not any(c.name == self.collection_name for c in collections):
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=384,  # all-MiniLM-L6-v2 embedding size
                        distance=models.Distance.COSINE
                    )
                )
        except Exception as e:
            print(f"Error initializing vector store: {e}")
    
    async def search_experiences(self, query_embedding: List[float], limit: int = 10) -> List[Dict[str, Any]]:
        """Search for similar travel experiences"""
        try:
            search_result = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit
            )
            
            return [
                {
                    "id": hit.id,
                    "score": hit.score,
                    "payload": hit.payload
                }
                for hit in search_result
            ]
        except Exception as e:
            return []
    
    async def add_experience(self, experience_data: Dict[str, Any], embedding: List[float]):
        """Add travel experience to vector store"""
        try:
            self.client.upsert(
                collection_name=self.collection_name,
                points=[
                    models.PointStruct(
                        id=str(uuid.uuid4()),
                        vector=embedding,
                        payload=experience_data
                    )
                ]
            )
        except Exception as e:
            print(f"Error adding experience: {e}")