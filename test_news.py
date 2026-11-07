from backend.services.news_service import get_daily_news

briefing = get_daily_news()

for category, articles in briefing.items():
    print(f"\n{'=' * 50}")
    print(category)
    print("=" * 50)

    for index, article in enumerate(articles, start=1):
        print(f"\n{index}. {article.get('title', 'Untitled')}")
        print(article.get("url", "No URL available"))
