import subprocess
import json
import os
import sys
from pathlib import Path

from renderer.caption_renderer import render_ass

def render(video_path: str, plan_path: str, out_path: str):
    print("🎬 Starting video rendering pipeline...")
    
    # Create necessary directories
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    
    # Temporary files
    ass_path = "data/captions.ass"
    silent_video = "data/video_no_audio.mp4"
    audio_file = "data/audio.aac"
    
    with open(plan_path, "r", encoding="utf-8") as f:
        plan = json.load(f)
    
    segments = plan["segments"]
    theme_settings = plan.get("theme_settings", {})
    
    print(f"📊 Processing {len(segments)} caption segments")
    
    # 1️⃣ Generate ASS captions
    print("📝 Creating ASS captions file...")
    try:
        render_ass(segments, ass_path, plan)
        print(f"✅ ASS file created: {ass_path}")
    except Exception as e:
        print(f"❌ ASS creation failed: {e}")
        raise
    
    # 2️⃣ Extract audio
    print("🔊 Extracting audio from video...")
    audio_cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vn",
        "-c:a", "aac",
        audio_file
    ]
    
    result = subprocess.run(audio_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"⚠️ Audio extraction warning: {result.stderr}")
    
    # 3️⃣ Burn captions into video
    print("🔥 Burning captions into video...")
    
    # Get video dimensions for proper subtitle scaling
    probe_cmd = [
        "ffprobe",
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "csv=p=0",
        video_path
    ]
    
    try:
        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        dimensions = result.stdout.strip().split(',')
        if len(dimensions) == 2:
            width, height = dimensions
            print(f"📐 Video dimensions: {width}x{height}")
    except:
        print("⚠️ Could not get video dimensions")
        width, height = 1280, 720
    
    # Apply video filters if specified in theme
    video_filters = []
    
    # Check if ASS file exists
    if not os.path.exists(ass_path):
        print(f"❌ ASS file not found at {ass_path}")
        raise FileNotFoundError(f"ASS file not found: {ass_path}")
    
    video_filters.append(f"ass={ass_path}")
    
    # Build filter chain
    filter_chain = ",".join(video_filters)
    
    print(f"🎞️ Applying filter: {filter_chain}")
    
    # Render video with captions
    video_cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", filter_chain,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-an",  # No audio in this pass
        silent_video
    ]
    
    print(f"🚀 Running: {' '.join(video_cmd[:5])}...")
    result = subprocess.run(video_cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ Video rendering failed: {result.stderr}")
        raise RuntimeError(f"FFmpeg error: {result.stderr}")
    
    print(f"✅ Video with captions rendered: {silent_video}")
    
    # 4️⃣ Merge audio back
    print("🔄 Merging audio with captioned video...")
    
    # Check if audio file exists
    if not os.path.exists(audio_file):
        print("⚠️ No audio file found, extracting from video...")
        subprocess.run([
            "ffmpeg", "-y",
            "-i", video_path,
            "-vn",
            "-c:a", "copy",
            audio_file
        ], capture_output=True)
    
    # Enhance audio volume
    enhanced_audio = "data/audio_enhanced.aac"
    enhance_cmd = [
        "ffmpeg", "-y",
        "-i", audio_file,
        "-af", "volume=1.5",
        "-c:a", "aac",
        "-b:a", "192k",
        enhanced_audio
    ]
    
    subprocess.run(enhance_cmd, capture_output=True)
    
    # Final merge
    merge_cmd = [
        "ffmpeg", "-y",
        "-i", silent_video,
        "-i", enhanced_audio if os.path.exists(enhanced_audio) else audio_file,
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        out_path
    ]
    
    result = subprocess.run(merge_cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"⚠️ Merge warning: {result.stderr}")
    
    # Check if output was created
    if os.path.exists(out_path):
        size = os.path.getsize(out_path) / (1024*1024)
        print(f"✅ Final video created: {out_path} ({size:.1f} MB)")
        
        # Cleanup temporary files
        for temp_file in [silent_video, audio_file, ass_path, enhanced_audio]:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except:
                pass
                
        return out_path
    else:
        print(f"❌ Output file not created: {out_path}")
        raise FileNotFoundError(f"Output video not created: {out_path}")