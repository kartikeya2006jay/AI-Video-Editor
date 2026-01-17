import json
import subprocess
import os
import sys

PLAN_PATH = "data/plan.json"

def transcribe(video_path: str):
    os.makedirs("data", exist_ok=True)

    print("🎵 Extracting audio for Whisper...")
    
    # Extract audio as WAV for Whisper (16kHz mono)
    audio_wav = "data/audio.wav"
    audio_cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        audio_wav
    ]
    
    result = subprocess.run(audio_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"⚠️ Audio extraction warning: {result.stderr}")
    
    # Check if audio file was created
    if not os.path.exists(audio_wav) or os.path.getsize(audio_wav) == 0:
        # Try alternative extraction method
        print("🔄 Trying alternative audio extraction...")
        subprocess.run([
            "ffmpeg", "-y",
            "-i", video_path,
            "-vn",
            audio_wav
        ], capture_output=True)
    
    print("🗣️ Running Whisper transcription...")
    
    # Run Whisper with proper CPU settings
    cmd = [
        sys.executable, "-m", "whisper",
        audio_wav,
        "--model", "base",
        "--output_format", "json",
        "--output_dir", "data",
        "--fp16", "False",  # Important for CPU
        "--language", "en",
        "--task", "transcribe",
        "--verbose", "False"
    ]
    
    try:
        print(f"🔧 Running command: {' '.join(cmd[:5])}...")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"⚠️ Whisper stderr: {result.stderr[:500]}")
        
        # Whisper creates audio.json
        whisper_json = "data/audio.json"
        
        # Alternative names Whisper might use
        if not os.path.exists(whisper_json):
            base_name = os.path.splitext(os.path.basename(audio_wav))[0]
            whisper_json = f"data/{base_name}.json"
        
        if not os.path.exists(whisper_json):
            base_name = os.path.splitext(os.path.basename(video_path))[0]
            whisper_json = f"data/{base_name}.json"
        
        if not os.path.exists(whisper_json):
            raise FileNotFoundError(f"Whisper output not found. Checked: {whisper_json}")
        
        print(f"📄 Found Whisper output: {whisper_json}")
        
        with open(whisper_json, "r", encoding="utf-8") as f:
            whisper_data = json.load(f)
        
        # Extract segments
        segments = []
        for seg in whisper_data.get("segments", []):
            segments.append({
                "start": float(seg["start"]),
                "end": float(seg["end"]),
                "text": seg["text"].strip()
            })
        
        print(f"📝 Found {len(segments)} transcription segments")
        
        # Create plan
        plan = {
            "segments": segments,
            "theme": "default",
            "whisper_file": os.path.basename(whisper_json),
            "video_duration": whisper_data.get("duration", 0)
        }
        
        with open(PLAN_PATH, "w", encoding="utf-8") as f:
            json.dump(plan, f, indent=2)
        
        print(f"✅ Plan saved to {PLAN_PATH}")
        
        # Cleanup
        try:
            if os.path.exists(audio_wav):
                os.remove(audio_wav)
        except:
            pass
            
        return PLAN_PATH
        
    except Exception as e:
        print(f"❌ Whisper transcription failed: {e}")
        print(f"Python executable: {sys.executable}")
        print(f"Current dir: {os.getcwd()}")
        
        # Check if whisper is installed
        try:
            import whisper
            print("✅ Whisper module is installed")
        except ImportError as ie:
            print(f"❌ Whisper not installed: {ie}")
            print("Try: pip install openai-whisper")
        
        raise