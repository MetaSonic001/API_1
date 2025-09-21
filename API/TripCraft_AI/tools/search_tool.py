"""
tools/search_tool.py - Web Search using simple HTTP requests (No Playwright)
"""
import asyncio
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup
from config.settings import get_settings
from utils.logger import get_logger

logger = get_logger(__name__)

class SearchTool:
    def __init__(self):
        self.settings = get_settings()
        
    async def search_web(self, query: str, num_results: int = 5) -> List[Dict[str, Any]]:
        """Search web and extract structured information using simple HTTP requests"""
        search_urls = await self._get_search_urls(query, num_results)
        results = []
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            for url in search_urls:
                try:
                    response = await client.get(
                        url,
                        headers={
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    )
                    
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.text, 'html.parser')
                        
                        # Extract basic information
                        title = soup.find('title')
                        title_text = title.get_text().strip() if title else ""
                        
                        # Remove script and style elements
                        for script in soup(["script", "style"]):
                            script.decompose()
                        
                        # Get text content
                        text_content = soup.get_text()
                        lines = (line.strip() for line in text_content.splitlines())
                        content = ' '.join(line for line in lines if line)[:2000]  # Limit content
                        
                        results.append({
                            "url": url,
                            "title": title_text,
                            "content": content,
                            "raw_html": response.text[:1000] if response.text else ""
                        })
                except Exception as e:
                    logger.warning(f"Failed to fetch {url}: {e}")
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