import subprocess
import os
from renderer.build_srt import build_srt

def render(video_path: str, out_path: str, caption_color: str):
    srt_path = "data/captions.srt"
    temp_video = "data/video_subs.mp4"

    os.makedirs("data", exist_ok=True)

    # 1️⃣ Generate subtitles using Whisper
    build_srt(video_path, srt_path)

    if not os.path.exists(srt_path):
        raise RuntimeError("SRT generation failed")

    # 2️⃣ Burn subtitles (GOOD SIZE, NOT ON FACE)
    subprocess.run([
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf",
        f"subtitles={srt_path}:force_style="
        f"'FontSize=26,PrimaryColour=&H{caption_color}&,"
        f"OutlineColour=&H000000&,Outline=1,MarginV=40'",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-af", "volume=2.0",
        temp_video
    ], check=True)

    # 3️⃣ Output
    os.replace(temp_video, out_path)
