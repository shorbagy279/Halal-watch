# Analysis/scorer.py
from config import SENSITIVITY, THRESHOLDS

def calculate_safety_scores(flagged_counts, total_comments):
    scores = {}
    
    for cat, count in flagged_counts.items():

        density = count / max(1, total_comments)

        score = max(0, round(100 - (density * 100 * SENSITIVITY), 1))
        scores[cat] = score
    
    avg_score = round(sum(scores.values()) / len(scores), 1)
    
    if avg_score > THRESHOLDS["APPROPRIATE"]:
        verdict = "APPROPRIATE"
    elif avg_score > THRESHOLDS["CAUTION"]:
        verdict = "CAUTION"
    else:
        verdict = "INAPPROPRIATE"
        
    return scores, avg_score, verdict