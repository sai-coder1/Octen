import time
import logging

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

    def add_to_mru(self, node):
        node.prev = self.tail.prev
        node.next = self.tail

        self.tail.prev.next = node
        self.tail.prev = node

    def remove_node(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def get(self, key):
        if key not in self.cache:
            return None
        node = self.cache[key]

        if time.time() >= node.expires_at:
            logger.warning("Cache Entry expired")
            self.remove_node(node)
            del self.cache[key]
            return None

        self.remove_node(node)

        self.add_to_mru(node)
        return node.value

    def put(self, key, value):
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
            self.remove_node(lru_node)
            del self.cache[lru_node.key]
