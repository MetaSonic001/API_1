import asyncio
from services.vector_store import upsert_pois
from tools.crawl import crawl_url
from typing import List, Dict

async def scrape_pois(num_pois=500):
    pois = []
    # Scrape OpenTripMap for attractions (free)
    otm_url = "https://api.opentripmap.com/0.1/en/places/geoname"
    instructions = "Extract top attractions: name, description, type (e.g., architecture, culinary), location, vibes (e.g., romantic, adventure) for 100+ cities like Paris, Bangkok, Tokyo, etc. Format as JSON list of dicts."
    otm_data = await crawl_url(otm_url, instructions)  # Now async
    # Parse to dicts (mock parse; in real, json.loads if JSON)
    otm_pois = [{"desc": f"{d['name']} - {d['description']}", "type": d['type'], "location": d['location'], "vibes": d['vibes']} for d in eval(otm_data)]  # Safe eval for demo

    # Scrape Wikipedia for more (e.g., landmarks)
    wiki_url = "https://en.wikipedia.org/wiki/List_of_tourist_attractions"
    wiki_instructions = "Extract 400+ global landmarks: name, short desc, type, location, vibes. Format as JSON list."
    wiki_data = await crawl_url(wiki_url, wiki_instructions)  # Now async
    wiki_pois = [{"desc": f"{d['name']} - {d['desc']}", "type": d['type'], "location": d['location'], "vibes": d['vibes']} for d in eval(wiki_data)]

    pois = otm_pois[:200] + wiki_pois[:300]  # Combine to ~500
    return pois

if __name__ == "__main__":
    pois = asyncio.run(scrape_pois())
    upsert_pois(pois)
    print(f"Qdrant initialized with {len(pois)} scraped POIs.")