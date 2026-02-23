from Scrapers.reddit_scraper import scrape_reddit
from Analysis.content_analyzer import analyze_text
from Analysis.scorer import calculate_safety_scores
import pandas as pd
import sys
import json


movie = sys.argv[1]

if not movie:
    print("[!] No name entered.")
    sys.exit()

# SCRAPE
print(f"[*] Scraping Reddit for {movie}...", file=sys.stderr)
raw_comments = scrape_reddit(movie)
total_count = len(raw_comments)

if total_count == 0:
    print("[!] No comments found.", file=sys.stderr)
    sys.exit()

# ANALYZE
counts = {'Nudity/Sex': 0, 'LGBT': 0, 'Islam/Arab Bias': 0}
detailed_report = []

for text in raw_comments:
    flags = analyze_text(text)
    if flags:
        for f in flags:
            if f in counts:
                counts[f] += 1
        detailed_report.append({
            "Movie": movie,
            "Flags": " | ".join(flags),
            "Text": text.replace('\n', ' ')[:300]
        })

# SCORE
scores, final_avg, verdict = calculate_safety_scores(counts, total_count)

# REPORT
result = {
    "movieName": movie,
    "scores": scores,
    "overallScore": final_avg,
    "verdict": verdict,
    "totalComments": total_count
}

print(json.dumps(result))
