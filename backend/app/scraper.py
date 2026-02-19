import feedparser

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def fetch_feed(url: str, limit: int = 5):
    """Fetch and return top N entries from an RSS feed."""
    try:
        feed = feedparser.parse(url, agent=USER_AGENT)
        if feed.bozo and feed.bozo_exception:
            print(f"      ⚠️ Feed warning for {url}: {feed.bozo_exception}")
        return feed.entries[:limit]
    except Exception as e:
        print(f"      ⚠️ Feed error ({url}): {e}")
        return []


def fetch_headlines(urls: list, limit_per_feed: int = 5):
    """Fetch headlines from multiple RSS URLs. Returns a newline-joined string."""
    headlines = []
    for url in urls:
        entries = fetch_feed(url, limit_per_feed)
        for entry in entries:
            headlines.append(f"- {entry.title}")
    return "\n".join(headlines)
