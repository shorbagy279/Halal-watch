# scrapers/reddit_scraper.py

import requests
import time
import sys
from ddgs import DDGS


def get_reddit_links(movie_name):
    subs = "(site:reddit.com/r/movies OR site:reddit.com/r/TrueFilm OR site:reddit.com/r/MovieCritic)"
    query = f'{subs} intitle:"{movie_name}" review'

    links = []

    try:
        print(f"[SCRAPER] Searching Reddit threads...", file=sys.stderr)

        with DDGS() as ddgs:
            results = list(ddgs.text(query, backend="lite", max_results=30))

            for r in results:
                url = r.get('href', '')
                if "/comments/" in url and url not in links:
                    links.append(url)

                if len(links) >= 3:
                    break

    except Exception as e:
        print(f"[SCRAPER ERROR] Search failed: {e}", file=sys.stderr)

    return links

def extract_comments(comment_list):
    texts = []

    for comment in comment_list:
        if comment.get('kind') == 't1':
            data = comment.get('data', {})

            texts.append(data.get('body', ''))

            replies = data.get('replies')
            if replies and isinstance(replies, dict):
                child_comments = replies.get('data', {}).get('children', [])
                texts.extend(extract_comments(child_comments))

    return texts


def scrape_reddit(movie_name):
    links = get_reddit_links(movie_name)

    print(f"[SCRAPER] Found {len(links)} threads.", file=sys.stderr)

    all_comments = []

    headers = {
        'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
    }

    for url in links:
        json_url = url.split('?')[0].rstrip('/') + ".json?limit=500"

        try:
            res = requests.get(json_url, headers=headers)

            print(
                f"[SCRAPER] Fetching thread ({res.status_code})",
                file=sys.stderr
            )

            if res.status_code == 200:
                data = res.json()
                comment_data = data[1]['data']['children']

                new_comments = extract_comments(comment_data)

                print(
                    f"[SCRAPER] Extracted {len(new_comments)} comments.",
                    file=sys.stderr
                )

                all_comments.extend(new_comments)

            time.sleep(2)

        except Exception as e:
            print(f"[SCRAPER ERROR] {e}", file=sys.stderr)
            continue

    print(f"[SCRAPER] Total comments: {len(all_comments)}", file=sys.stderr)

    return all_comments
