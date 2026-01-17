import json
import subprocess
from pathlib import Path

def seconds_to_srt_time(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{hrs:02}:{mins:02}:{secs:02},{ms:03}"

def build_srt(plan_path: str, srt_path: str):
    with open(plan_path) as f:
        plan = json.load(f)

    lines = []
    idx = 1

    for s in plan["segments"]:
        start = seconds_to_srt_time(s["start"])
        end = seconds_to_srt_time(s["end"])
        text = s["text"].strip()

        lines.append(str(idx))
        lines.append(f"{start} --> {end}")
        lines.append(text)
        lines.append("")  # blank line

        idx += 1

    with open(srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

def render(video_path, plan_path, out_path):
    srt_path = "data/captions.srt"

    build_srt(plan_path, srt_path)

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", f"subtitles={srt_path}",
        "-c:a", "copy",
        out_path
    ]

    subprocess.run(cmd, check=True)
