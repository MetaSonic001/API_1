"""
tools/search_tool.py - Web Search using crawl4ai
"""
import asyncio
from typing import List, Dict, Any, Optional
from crawl4ai import AsyncWebCrawler
from crawl4ai.extraction_strategy import LLMExtractionStrategy
import httpx
from config.settings import get_settings

class SearchTool:
    def __init__(self):
        self.settings = get_settings()
        
    async def search_web(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Search web and extract structured information"""
        search_urls = await self._get_search_urls(query, num_results)
        results = []
        
        async with AsyncWebCrawler(verbose=True) as crawler:
            for url in search_urls:
                try:
                    result = await crawler.arun(
                        url=url,
                        extraction_strategy=LLMExtractionStrategy(
                            provider="ollama",
                            api_token=self.settings.OPENAI_API_KEY,
                            instruction="Extract travel-related information including attractions, restaurants, activities, prices, and practical details."
                        )
                    )
                    
                    if result.success:
                        results.append({
                            "url": url,
                            "title": result.metadata.get("title", ""),
                            "content": result.extracted_content,
                            "raw_html": result.html[:1000] if result.html else ""
                        })
                except Exception as e:
                    continue
                    
        return results
    
    async def _get_search_urls(self, query: str, num_results: int) -> List[str]:
        """Get search URLs using DuckDuckGo"""
        search_query = f"{query} travel guide attractions restaurants"
        urls = []
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.duckduckgo.com/",
                    params={"q": search_query, "format": "json", "no_html": "1"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    for item in data.get("RelatedTopics", [])[:num_results]:
                        if "FirstURL" in item:
                            urls.append(item["FirstURL"])
                            
        except Exception as e:
            # Fallback URLs for common travel sites
            urls = [
                f"https://www.tripadvisor.com/Tourism-{query.replace(' ', '_')}.html",
                f"https://www.lonelyplanet.com/search?q={query}",
                f"https://www.timeout.com/search?q={query}"
            ]
            
        return urls[:num_results]