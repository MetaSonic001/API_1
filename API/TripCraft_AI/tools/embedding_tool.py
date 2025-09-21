"""
Updated tools/embedding_tool.py - Free alternatives only
"""
from sentence_transformers import SentenceTransformer
from transformers import pipeline, AutoModel, AutoProcessor
from PIL import Image
import torch
import base64
import io
import httpx
from typing import List, Union, Dict, Any
from config.settings import get_settings

class EmbeddingTool:
    def __init__(self):
        self.settings = get_settings()
        self.text_model = SentenceTransformer(self.settings.EMBEDDING_MODEL)
        
        # Free image classification model
        self.image_classifier = pipeline(
            "image-classification", 
            model="microsoft/resnet-50",
            device=0 if torch.cuda.is_available() else -1
        )
        
        # Ollama embedding fallback
        self.use_ollama_embed = True
        
    async def encode_text(self, texts: Union[str, List[str]]) -> List[List[float]]:
        """Generate text embeddings using free models"""
        if isinstance(texts, str):
            texts = [texts]
        
        if self.use_ollama_embed:
            # Use Ollama's free embedding model
            embeddings = []
            for text in texts:
                embedding = await self._get_ollama_embedding(text)
                embeddings.append(embedding)
            return embeddings
        else:
            # Fallback to sentence transformers
            embeddings = self.text_model.encode(texts)
            return embeddings.tolist()
    
    async def _get_ollama_embedding(self, text: str) -> List[float]:
        """Get embedding from Ollama (completely free)"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.settings.OLLAMA_BASE_URL}/api/embeddings",
                    json={
                        "model": self.settings.OLLAMA_EMBED_MODEL,
                        "prompt": text
                    },
                    timeout=30.0
                )
                if response.status_code == 200:
                    return response.json().get("embedding", [0.0] * 384)
                else:
                    # Fallback to sentence transformers
                    return self.text_model.encode([text])[0].tolist()
        except Exception:
            # Fallback to sentence transformers
            return self.text_model.encode([text])[0].tolist()
    
    async def analyze_moodboard(self, images: List[str]) -> Dict[str, Any]:
        """Analyze moodboard images using free models"""
        travel_preferences = {
            "vibes": [],
            "activities": [],
            "styles": [],
            "themes": [],
            "confidence": 0.0
        }
        
        total_confidence = 0
        processed_images = 0
        
        for img_base64 in images:
            try:
                # Decode image
                img_data = base64.b64decode(img_base64)
                image = Image.open(io.BytesIO(img_data))
                
                # Classify image using free model
                results = self.image_classifier(image)
                
                processed_images += 1
                
                # Map classifications to travel preferences
                for result in results[:3]:  # Top 3 results
                    label = result['label'].lower()
                    confidence = result['score']
                    total_confidence += confidence
                    
                    if confidence > 0.2:  # Lower threshold for free model
                        # Map to travel concepts
                        if any(word in label for word in ['beach', 'ocean', 'water', 'coast']):
                            travel_preferences['vibes'].append('beach')
                        elif any(word in label for word in ['mountain', 'hill', 'landscape']):
                            travel_preferences['vibes'].append('mountain')
                        elif any(word in label for word in ['building', 'architecture', 'city']):
                            travel_preferences['vibes'].append('urban')
                        elif any(word in label for word in ['food', 'restaurant', 'dining']):
                            travel_preferences['activities'].append('culinary')
                        elif any(word in label for word in ['art', 'museum', 'culture']):
                            travel_preferences['activities'].append('cultural')
                        elif any(word in label for word in ['nature', 'park', 'forest']):
                            travel_preferences['vibes'].append('nature')
                            
            except Exception as e:
                continue
        
        # Calculate average confidence
        if processed_images > 0:
            travel_preferences['confidence'] = min(total_confidence / processed_images, 1.0)
        
        # Remove duplicates
        travel_preferences['vibes'] = list(set(travel_preferences['vibes']))
        travel_preferences['activities'] = list(set(travel_preferences['activities']))
        
        return travel_preferences