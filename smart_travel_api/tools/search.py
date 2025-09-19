from duckduckgo_search import DDGS

def web_search(query: str, num_results: int = 10):
    with DDGS() as ddgs:
        return list(ddgs.text(query, max_results=num_results))