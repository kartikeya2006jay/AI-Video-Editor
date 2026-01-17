import json

def build_edit_plan(segments_path, out_path):
    with open(segments_path) as f:
        segments = json.load(f)

    plan = {
        "video": {"aspect_ratio": "16:9"},
        "segments": []
    }

    for i, s in enumerate(segments):
        plan["segments"].append({
            "id": s["id"],
            "start": s["start"],
            "end": s["end"],
            "text": s["text"],
            "captions": {
                "enabled": True,
                "animation": "fade",
                "highlight_words": s["text"].split()[:1]
            },
            "title": {
                "enabled": i == 0,
                "text": "Introduction",
                "animation": "slide"
            }
        })

    with open(out_path, "w") as f:
        json.dump(plan, f, indent=2)
