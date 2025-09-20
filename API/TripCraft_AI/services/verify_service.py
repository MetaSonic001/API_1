"""
services/verify_service.py - Lightweight RAG & Citations Service

Reduces hallucinations by providing citations and confidence scores for factual claims.
Uses free DuckDuckGo search and optional web scraping.
"""

import asyncio
import httpx
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from urllib.parse import urlparse, urljoin
import re
import hashlib
from datetime import datetime
import os
from pathlib import Path

# Free search libraries
from duckduckgo_search import DDGS
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer

@dataclass
class Citation:
    url: str
    title: str
    snippet: str
    confidence_score: float
    retrieved_at: str
    domain: str
    
class FactVerificationService:
    def __init__(self):
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.cache_dir = Path("data/verification_cache")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Trusted domains for higher confidence
        self.trusted_domains = {
            'wikipedia.org': 0.9,
            'britannica.com': 0.85,
            'gov': 0.9,  # Government sites
            'edu': 0.85,  # Educational institutions
            'unesco.org': 0.9,
            'lonelyplanet.com': 0.7,
            'timeout.com': 0.7,
            'tripadvisor.com': 0.6
        }
        
        # Rate limiting
        self.last_search_time = 0
        self.search_delay = 1.0  # 1 second between searches
    
    async def verify_claims(self, claims: List[str], top_k: int = 3) -> List[List[Citation]]:
        """
        Verify multiple claims and return citations for each
        
        Args:
            claims: List of factual claims to verify
            top_k: Number of citations to return per claim
            
        Returns:
            List of citation lists (one list per claim)
        """
        results = []
        
        for claim in claims:
            try:
                citations = await self.verify_single_claim(claim, top_k)
                results.append(citations)
            except Exception as e:
                print(f"Error verifying claim '{claim}': {e}")
                results.append([])
        
        return results
    
    async def verify_single_claim(self, claim: str, top_k: int = 3) -> List[Citation]:
        """Verify a single claim and return citations"""
        
        # Check cache first
        cache_key = self._get_cache_key(claim)
        cached_citations = self._load_from_cache(cache_key)
        if cached_citations:
            return cached_citations[:top_k]
        
        # Search for supporting evidence
        search_results = await self._search_claim(claim)
        
        # Process and score results
        citations = []
        for result in search_results[:top_k * 2]:  # Get extra to filter
            try:
                citation = await self._process_search_result(result, claim)
                if citation and citation.confidence_score > 0.3:  # Minimum confidence
                    citations.append(citation)
            except Exception as e:
                print(f"Error processing search result: {e}")
                continue
        
        # Sort by confidence and take top_k
        citations.sort(key=lambda x: x.confidence_score, reverse=True)
        final_citations = citations[:top_k]
        
        # Cache results
        self._save_to_cache(cache_key, final_citations)
        
        return final_citations
    
    async def _search_claim(self, claim: str) -> List[Dict[str, Any]]:
        """Search for information about a claim using DuckDuckGo"""
        
        # Rate limiting
        current_time = asyncio.get_event_loop().time()
        if current_time - self.last_search_time < self.search_delay:
            await asyncio.sleep(self.search_delay - (current_time - self.last_search_time))
        self.last_search_time = current_time
        
        try:
            # Use DuckDuckGo search (free)
            with DDGS() as ddgs:
                results = []
                for result in ddgs.text(claim, max_results=10):
                    results.append({
                        'title': result.get('title', ''),
                        'snippet': result.get('body', ''),
                        'url': result.get('href', ''),
                        'source': 'duckduckgo'
                    })
                return results
                
        except Exception as e:
            print(f"Search error: {e}")
            return []
    
    async def _process_search_result(self, result: Dict[str, Any], original_claim: str) -> Optional[Citation]:
        """Process a search result into a citation with confidence score"""
        
        try:
            url = result.get('url', '')
            title = result.get('title', '')
            snippet = result.get('snippet', '') or result.get('body', '')
            
            if not url or not snippet:
                return None
            
            # Parse domain
            domain = urlparse(url).netloc.lower()
            
            # Calculate confidence score
            confidence = self._calculate_confidence(snippet, original_claim, domain)
            
            # Clean snippet
            clean_snippet = self._clean_snippet(snippet)
            
            return Citation(
                url=url,
                title=title,
                snippet=clean_snippet,
                confidence_score=confidence,
                retrieved_at=datetime.now().isoformat(),
                domain=domain
            )
            
        except Exception as e:
            print(f"Error processing result: {e}")
            return None
    
    def _calculate_confidence(self, snippet: str, claim: str, domain: str) -> float:
        """Calculate confidence score for a citation"""
        
        # Base confidence from domain trustworthiness
        domain_confidence = 0.5  # Default
        for trusted_domain, confidence in self.trusted_domains.items():
            if trusted_domain in domain:
                domain_confidence = confidence
                break
        
        # Semantic similarity between claim and snippet
        try:
            claim_embedding = self.embedding_model.encode([claim])
            snippet_embedding = self.embedding_model.encode([snippet])
            
            # Cosine similarity
            similarity = float(claim_embedding @ snippet_embedding.T)
            semantic_score = max(0, similarity)  # Ensure non-negative
            
        except Exception:
            semantic_score = 0.3  # Default if embedding fails
        
        # Text overlap score
        claim_words = set(claim.lower().split())
        snippet_words = set(snippet.lower().split())
        overlap_ratio = len(claim_words & snippet_words) / len(claim_words) if claim_words else 0
        
        # Combined confidence score
        confidence = (
            0.4 * domain_confidence +
            0.4 * semantic_score +
            0.2 * overlap_ratio
        )
        
        return min(1.0, max(0.0, confidence))
    
    def _clean_snippet(self, snippet: str) -> str:
        """Clean and truncate snippet text"""
        # Remove HTML tags if any
        clean_text = re.sub(r'<[^>]+>', '', snippet)
        
        # Remove extra whitespace
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        # Truncate to reasonable length
        if len(clean_text) > 300:
            clean_text = clean_text[:300] + "..."
        
        return clean_text
    
    def _get_cache_key(self, claim: str) -> str:
        """Generate cache key for a claim"""
        return hashlib.md5(claim.encode()).hexdigest()
    
    def _load_from_cache(self, cache_key: str) -> Optional[List[Citation]]:
        """Load citations from cache"""
        cache_file = self.cache_dir / f"{cache_key}.json"
        
        try:
            if cache_file.exists():
                # Check if cache is recent (24 hours)
                if datetime.now().timestamp() - cache_file.stat().st_mtime < 86400:
                    import json
                    with open(cache_file, 'r') as f:
                        data = json.load(f)
                        return [Citation(**item) for item in data]
        except Exception as e:
            print(f"Cache load error: {e}")
        
        return None
    
    def _save_to_cache(self, cache_key: str, citations: List[Citation]):
        """Save citations to cache"""
        cache_file = self.cache_dir / f"{cache_key}.json"
        
        try:
            import json
            with open(cache_file, 'w') as f:
                json.dump([{
                    'url': c.url,
                    'title': c.title,
                    'snippet': c.snippet,
                    'confidence_score': c.confidence_score,
                    'retrieved_at': c.retrieved_at,
                    'domain': c.domain
                } for c in citations], f, indent=2)
        except Exception as e:
            print(f"Cache save error: {e}")
    
    async def verify_poi_info(self, poi_name: str, city: str = "") -> Dict[str, Any]:
        """Verify information about a specific point of interest"""
        
        # Construct search query
        search_query = f"{poi_name} {city} history facts information"
        if city:
            search_query += f" {city}"
        
        citations = await self.verify_single_claim(search_query, top_k=5)
        
        # Extract key facts from citations
        facts = []
        for citation in citations:
            if citation.confidence_score > 0.6:  # High confidence facts only
                facts.append({
                    "fact": citation.snippet[:200] + "..." if len(citation.snippet) > 200 else citation.snippet,
                    "source": citation.url,
                    "confidence": citation.confidence_score,
                    "domain": citation.domain
                })
        
        return {
            "poi_name": poi_name,
            "city": city,
            "verified_facts": facts,
            "total_sources": len(citations),
            "average_confidence": sum(c.confidence_score for c in citations) / len(citations) if citations else 0,
            "verification_timestamp": datetime.now().isoformat()
        }
    
    def generate_citation_text(self, citations: List[Citation]) -> str:
        """Generate citation text for inclusion in content"""
        if not citations:
            return ""
        
        citation_text = "\n\nSources:\n"
        for i, citation in enumerate(citations, 1):
            citation_text += f"{i}. {citation.title} - {citation.domain} (Confidence: {citation.confidence_score:.2f})\n"
            citation_text += f"   {citation.url}\n"
        
        return citation_text

# Convenience functions
async def verify_travel_claim(claim: str, top_k: int = 3) -> List[Citation]:
    """Verify a travel-related claim"""
    service = FactVerificationService()
    return await service.verify_single_claim(claim, top_k)

async def verify_poi_facts(poi_name: str, city: str = "") -> Dict[str, Any]:
    """Verify facts about a point of interest"""
    service = FactVerificationService()
    return await service.verify_poi_info(poi_name, city)

# Example usage and testing
if __name__ == "__main__":
    async def test_verification():
        service = FactVerificationService()
        
        # Test claims
        test_claims = [
            "The Eiffel Tower was built in 1889",
            "Rome has seven hills",
            "Tokyo is the largest city in the world"
        ]
        
        print("Testing fact verification...")
        
        for claim in test_claims:
            print(f"\nVerifying: {claim}")
            citations = await service.verify_single_claim(claim, top_k=3)
            
            for citation in citations:
                print(f"  Source: {citation.domain}")
                print(f"  Confidence: {citation.confidence_score:.3f}")
                print(f"  Snippet: {citation.snippet[:100]}...")
                print(f"  URL: {citation.url}")
        
        # Test POI verification
        print("\n" + "="*50)
        print("Testing POI verification...")
        
        poi_info = await service.verify_poi_info("Colosseum", "Rome")
        print(f"POI: {poi_info['poi_name']}")
        print(f"Average confidence: {poi_info['average_confidence']:.3f}")
        print(f"Total sources: {poi_info['total_sources']}")
        
        for fact in poi_info['verified_facts']:
            print(f"  Fact: {fact['fact'][:100]}...")
            print(f"  Confidence: {fact['confidence']:.3f}")
    
    asyncio.run(test_verification())