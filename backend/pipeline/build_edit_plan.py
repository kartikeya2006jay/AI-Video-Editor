import re

IMPORTANT_KEYWORDS = {
    "ai", "auto", "automatic", "pipeline", "editor",
    "demo", "video", "model", "system"
}

def extract_highlight_words(text: str):
    words = text.split()
    highlights = []

    for w in words:
        clean = re.sub(r"[^\w]", "", w).lower()

        # numbers (age, years, counts)
        if clean.isdigit():
            highlights.append(w)

        # capitalized words (names)
        elif w[0].isupper():
            highlights.append(w)

        # domain keywords
        elif clean in IMPORTANT_KEYWORDS:
            highlights.append(w)

    return list(set(highlights))
