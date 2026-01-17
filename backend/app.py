from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import os
import json
import time

from renderer.whisper_transcribe import transcribe
from renderer.render_video import render

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

INPUT = "data/input.mp4"
PLAN = "data/plan.json"
OUTPUT = "data/output.mp4"

@app.post("/process")
async def process_video(
    video: UploadFile = File(...),
    themeSettings: str = Form("{}")
):
    os.makedirs("data", exist_ok=True)

    # Save uploaded video
    with open(INPUT, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    print(f"📥 Video saved: {INPUT}")

    # Parse theme settings
    try:
        theme_data = json.loads(themeSettings) if themeSettings and themeSettings != "{}" else {"theme": "default"}
    except:
        theme_data = {"theme": "default"}
    
    print(f"🎨 Theme settings: {theme_data}")

    # 1️⃣ Whisper → plan.json
    try:
        print("🎤 Starting Whisper transcription...")
        transcribe(INPUT)
        print("✅ Transcription complete")
    except Exception as e:
        print(f"❌ Transcription failed: {e}")
        return {"status": "error", "message": f"Transcription failed: {str(e)}"}

    # 2️⃣ Inject theme into plan
    with open(PLAN, "r", encoding="utf-8") as f:
        plan = json.load(f)

    plan["theme_settings"] = theme_data

    with open(PLAN, "w", encoding="utf-8") as f:
        json.dump(plan, f, indent=2)

    print(f"📋 Plan updated with {len(plan['segments'])} segments")

    # 3️⃣ Render with theme
    try:
        print("🎬 Starting video rendering...")
        render(INPUT, PLAN, OUTPUT)
        print("✅ Rendering complete")
    except Exception as e:
        print(f"❌ Rendering failed: {e}")
        return {"status": "error", "message": f"Rendering failed: {str(e)}"}

    return {"status": "success", "message": "Video processed successfully"}

@app.get("/output-video")
def output_video():
    if os.path.exists(OUTPUT):
        # Add timestamp to prevent caching
        timestamp = int(time.time())
        return FileResponse(
            OUTPUT,
            media_type="video/mp4",
            filename=f"enhanced_video_{timestamp}.mp4",
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
        )
    else:
        return {"error": "Video not found. Please process a video first."}

@app.get("/")
def root():
    return {
        "service": "AI Video Enhancer API",
        "status": "running",
        "data_files": os.listdir("data") if os.path.exists("data") else []
    }