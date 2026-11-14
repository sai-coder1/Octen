import time
import logging
import threading

logger = logging.getLogger(__name__)


class Node:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None
        self.expires_at = None


class LRUCache:
    def __init__(self, capacity, ttl=600):
        self.capacity = capacity

        self.cache = {}
        self.head = Node(None, None)
        self.tail = Node(None, None)
        self.head.next = self.tail
        self.tail.prev = self.head
        self.ttl = ttl
        self.hits = 0
        self.misses = 0
        self.evictions = 0
        self.lock = threading.Lock()

    def add_to_mru(self, node):
        node.prev = self.tail.prev
        node.next = self.tail

        self.tail.prev.next = node
        self.tail.prev = node

    def remove_node(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def get(self, key):
        with self.lock:
            if key not in self.cache:
                self.misses += 1
                return None

            node = self.cache[key]

            if time.time() >= node.expires_at:
                logger.warning("Cache Entry expired")
                self.remove_node(node)
                self.misses += 1
                del self.cache[key]
                return None

            self.remove_node(node)

            self.add_to_mru(node)
            self.hits += 1
            return node.value

    def put(self, key, value):
        with self.lock:
            if key in self.cache:
                node = self.cache[key]
                node.expires_at = time.time() + self.ttl
                node.value = value
                self.remove_node(node)
                self.add_to_mru(node)

            else:
                node = Node(key, value)
                node.expires_at = time.time() + self.ttl
                self.cache[key] = node
                self.add_to_mru(node)

            if len(self.cache) > self.capacity:
                lru_node = self.head.next
                logger.info("Evicting least recently used cache entry")
                self.evictions += 1
                self.remove_node(lru_node)
                del self.cache[lru_node.key]

    def get_stats(self):
        total_requests = self.hits + self.misses

        hit_rate = 0
        if total_requests > 0:
            hit_rate = (self.hits / total_requests) * 100

        return {
            "hits": self.hits,
            "misses": self.misses,
            "evictions": self.evictions,
            "hit_rate": round(hit_rate, 2),
        }
