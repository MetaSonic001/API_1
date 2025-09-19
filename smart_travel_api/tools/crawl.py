from crawl4ai import AsyncWebCrawler

async def crawl_url(url: str, instructions: str):
    async with AsyncWebCrawler() as crawler:
        result = await crawler.arun(url=url, instructions=instructions)
        return result
