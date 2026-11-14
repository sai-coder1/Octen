import threading
from backend.cache.lru_cache import LRUCache

cache = LRUCache(100)


def worker(thread_id):
    for i in range(1000):
        cache.put(f"key_{i}", f"value_{thread_id}_{i}")
        cache.get(f"key_{i}")


threads = []

for i in range(10):
    t = threading.Thread(target=worker, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print("Final cache size:", len(cache.cache))
print("Cache statistics:", cache.get_stats())
