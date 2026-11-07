import time
from backend.services.search_service import search_web

first = search_web("Python programming", 3)
second = search_web("Python programming", 3)

print("First search:", len(first))
print("Second search:", len(second))
