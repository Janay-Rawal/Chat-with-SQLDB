import hashlib
import time
from collections import OrderedDict
from typing import Any, Optional

class QueryCache:
    """
    In-memory cache for database query results.
    Features:
    - LRU eviction (Least Recently Used)
    - TTL (Time To Live) expiration
    - SHA-256 hashed keys for efficient indexing
    """

    def __init__(self, max_size: int = 100, ttl_seconds: int = 300):
        self.max_size = max_size
        self.ttl_seconds = ttl_seconds
        self.cache: OrderedDict[str, dict] = OrderedDict()

    def _hash_key(self, query: str, db_type: str) -> str:
        """Create a unique SHA-256 hash for the query and db_type."""
        raw = f"{query.strip().lower()}:{db_type}"
        return hashlib.sha256(raw.encode()).hexdigest()

    def get(self, query: str, db_type: str) -> Optional[Any]:
        """
        Retrieve an item from cache if it exists and hasn't expired.
        Returns None on miss or expiry.
        """
        key = self._hash_key(query, db_type)
        if key not in self.cache:
            return None

        entry = self.cache[key]
        
        # Check TTL
        if time.time() - entry["timestamp"] > self.ttl_seconds:
            self.cache.pop(key, None)
            return None

        # Move to end (LRU)
        self.cache.move_to_end(key)
        return entry["value"]

    def set(self, query: str, db_type: str, value: Any):
        """
        Store an item in cache. Evicts oldest item if limit is reached.
        """
        key = self._hash_key(query, db_type)
        
        # If already exists, delete so it can be re-inserted at the end
        self.cache.pop(key, None)

        # Check size limit
        if len(self.cache) >= self.max_size:
            self.cache.popitem(last=False)

        self.cache[key] = {
            "value": value,
            "timestamp": time.time()
        }

    def clear(self):
        """Clear all entries."""
        self.cache.clear()

# Global singleton instance
query_cache = QueryCache(max_size=100, ttl_seconds=300)
