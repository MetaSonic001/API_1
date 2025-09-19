import asyncio
import json
from services.vector_store import upsert_pois
from tools.crawl import crawl_url

async def scrape_pois(num_pois=500):
    pois = []
    # Fallback mock data in case crawling fails
    mock_pois = [
        {"desc": "Eiffel Tower - iconic iron lattice tower in Paris", "type": "architecture", "location": "Paris", "vibes": ["romantic", "sightseeing"]},
        {"desc": "Street food market in Bangkok - authentic Thai cuisine", "type": "culinary", "location": "Bangkok", "vibes": ["food-focused"]},
        {"desc": "Colosseum - ancient amphitheater in Rome", "type": "history", "location": "Rome", "vibes": ["historical"]}
    ]

    # Scrape OpenTripMap for attractions (free)
    otm_url = "https://api.opentripmap.com/0.1/en/places/bbox?lon_min=-180&lon_max=180&lat_min=-90&lat_max=90&kinds=interesting_places&rate=3&format=json"
    instructions = "Extract attractions as JSON list with fields: name, description, type (e.g., architecture, culinary), location, vibes (e.g., romantic, adventure)."
    try:
        otm_result = await crawl_url(otm_url, instructions)  # Returns CrawlResult
        # Use extracted_content instead of json_content
        otm_data = json.loads(otm_result.extracted_content) if otm_result.extracted_content else []
        otm_pois = [
            {
                "desc": f"{d.get('name', 'Unknown')} - {d.get('description', 'No description')}",
                "type": d.get('type', 'unknown'),
                "location": d.get('location', 'Unknown'),
                "vibes": d.get('vibes', ['general'])
            } for d in otm_data
        ]
    except (json.JSONDecodeError, AttributeError, TypeError) as e:
        print(f"Error parsing OpenTripMap data: {e}")
        otm_pois = mock_pois  # Use mock data as fallback

    # Scrape Wikipedia for more (e.g., landmarks)
    wiki_url = "https://en.wikipedia.org/wiki/List_of_tourist_attractions_by_country"
    wiki_instructions = "Extract landmarks as JSON list with fields: name, desc, type, location, vibes."
    try:
        wiki_result = await crawl_url(wiki_url, wiki_instructions)
        wiki_data = json.loads(wiki_result.extracted_content) if wiki_result.extracted_content else []
        wiki_pois = [
            {
                "desc": f"{d.get('name', 'Unknown')} - {d.get('desc', 'No description')}",
                "type": d.get('type', 'unknown'),
                "location": d.get('location', 'Unknown'),
                "vibes": d.get('vibes', ['general'])
            } for d in wiki_data
        ]
    except (json.JSONDecodeError, AttributeError, TypeError) as e:
        print(f"Error parsing Wikipedia data: {e}")
        wiki_pois = mock_pois  # Use mock data as fallback

    pois = otm_pois[:200] + wiki_pois[:300]  # Combine to ~500
    if not pois:  # Ensure at least some data
        pois = mock_pois
    return pois

if __name__ == "__main__":
    pois = asyncio.run(scrape_pois())
    upsert_pois(pois)
    print(f"Qdrant initialized with {len(pois)} scraped POIs.")