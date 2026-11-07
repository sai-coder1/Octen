import time
from backend.cache.lru_cache import LRUCache

cache = LRUCache(2, 3)

cache.put("Python", "Old results")

print(cache.get("Python"))  # Should return Old results

time.sleep(4)

print(cache.get("Python"))  # Should return None
