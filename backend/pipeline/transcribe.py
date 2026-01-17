import whisper
import json

def transcribe(audio_path, out_path):
    model = whisper.load_model("base")
    result = model.transcribe(audio_path)

    segments = [
        {
            "start": s["start"],
            "end": s["end"],
            "text": s["text"].strip()
        }
        for s in result["segments"]
    ]

    with open(out_path, "w") as f:
        json.dump(segments, f, indent=2)
