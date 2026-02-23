# Analysis/content_analyzer.py
import re
from config import KEYWORD_MAP

def analyze_text(text):
    if not text:
        return []
    
    text_lower = text.lower()
    matches_found = []
    
    for category, words in KEYWORD_MAP.items():

        if any(re.search(rf"\b{re.escape(w)}\b", text_lower) for w in words):
            matches_found.append(category)
            
    return matches_found