import whisper
import json
import os

MODEL = "base"  # fast + accurate enough for hackathon

def transcribe(video_path: str, plan_path: str):
    model = whisper.load_model(MODEL)

    result = model.transcribe(
        video_path,
        word_timestamps=False,
        fp16=False
    )

    segments = []
    for s in result["segments"]:
        segments.append({
            "start": float(s["start"]),
            "end": float(s["end"]),
            "text": s["text"].strip()
        })

    plan = {
        "segments": segments
    }

    os.makedirs(os.path.dirname(plan_path), exist_ok=True)

    with open(plan_path, "w", encoding="utf-8") as f:
        json.dump(plan, f, indent=2)

    return plan
