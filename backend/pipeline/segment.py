import json

def segment(transcript_path, out_path):
    with open(transcript_path) as f:
        transcript = json.load(f)

    segments = []
    for i, t in enumerate(transcript):
        segments.append({
            "id": f"seg_{i}",
            "start": t["start"],
            "end": t["end"],
            "text": t["text"]
        })

    with open(out_path, "w") as f:
        json.dump(segments, f, indent=2)
