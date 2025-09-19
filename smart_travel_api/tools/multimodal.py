from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import requests
from io import BytesIO
from services.vector_store import search_pois

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

def interpret_image(image_url: str):
    response = requests.get(image_url)
    image = Image.open(BytesIO(response.content))
    texts = ["street food", "adventure", "nightlife", "culture", "nature", "romantic", "relaxing"]
    inputs = processor(text=texts, images=image, return_tensors="pt", padding=True)
    outputs = model(**inputs)
    probs = outputs.logits_per_image.softmax(dim=1)[0]
    top_indices = probs.topk(3).indices.tolist()
    top_vibes = [texts[i] for i in top_indices]
    pois = search_pois(" ".join(top_vibes))
    return {"vibes": top_vibes, "suggested_pois": pois}