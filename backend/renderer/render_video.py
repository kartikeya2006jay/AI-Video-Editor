import json
import subprocess

def seconds_to_srt_time(seconds: float) -> str:
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{hrs:02}:{mins:02}:{secs:02},{ms:03}"

def build_srt(plan_path: str, srt_path: str):
    with open(plan_path, "r", encoding="utf-8") as f:
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
        lines.append("")
        idx += 1

    with open(srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

def render(video_path: str, plan_path: str, out_path: str):
    srt_path = "data/captions.srt"
    temp_video = "data/video_no_audio.mp4"

    # 1️⃣ Build subtitles
    build_srt(plan_path, srt_path)

    # 2️⃣ Burn subtitles (VIDEO ONLY)
    subprocess.run([
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", f"subtitles={srt_path}",
        "-an",
        "-c:v", "libx264",
        temp_video
    ], check=True)

    # 3️⃣ Merge audio WITH LOUDNESS NORMALIZATION (IMPORTANT)
    subprocess.run([
        "ffmpeg", "-y",
        "-i", temp_video,
        "-i", video_path,
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "copy",
        "-af", "loudnorm=I=-16:LRA=11:TP=-1.5",
        "-c:a", "aac",
        "-b:a", "192k",
        out_path
    ], check=True)
