import os
from dotenv import load_dotenv
from octen import Octen

load_dotenv()

api_key = os.getenv("OCTEN_API_KEY")

if not api_key:
    raise ValueError("OCTEN_API_KEY is missing")

with Octen(api_key=api_key) as client:
    response = client.search.search(
        query="Latest developments in artificial intelligence research", count=3
    )

    print(f"found {len(response.results)} results \n")

    for index, result in enumerate(response.results, start=1):
        print(f"{index}. {result['title']}")
        print(f"URL: {result['url']}")
        print(f"Highlight: {result.get('highlight', 'No highlight available')}")
        print()
