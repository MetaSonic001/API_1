from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance
from sentence_transformers import SentenceTransformer
from config import QDRANT_URL

client = QdrantClient(url=QDRANT_URL)
COLLECTION_NAME = "travel_pois"
model = SentenceTransformer('all-MiniLM-L6-v2')

def ensure_collection():
    try:
        # Check if collection exists using get_collection
        client.get_collection(COLLECTION_NAME)
    except Exception:
        # Create collection if it doesn't exist
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )

def upsert_pois(pois: list[dict]):
    points = []
    for i, poi in enumerate(pois):
        embedding = model.encode(poi['desc'])
        points.append({
            "id": i,
            "vector": embedding,
            "payload": poi
        })
    ensure_collection()
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

def search_pois(query: str, limit: int = 10) -> list[dict]:
    query_vector = model.encode(query)
    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=limit
    )
    return [hit.payload for hit in results]