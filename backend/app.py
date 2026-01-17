from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os

from renderer.render_video import render

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA = "data"
INPUT = f"{DATA}/input.mp4"
OUTPUT = f"{DATA}/output.mp4"

os.makedirs(DATA, exist_ok=True)


@app.post("/process")
async def process_video(
    video: UploadFile,
    caption_color: str = Form("FFFFFF")
):
    with open(INPUT, "wb") as f:
        f.write(await video.read())

    render(
        video_path=INPUT,
        out_path=OUTPUT,
        caption_color=caption_color
    )

    return {"status": "ok"}


@app.get("/output-video")
def output_video():
    return FileResponse(OUTPUT, media_type="video/mp4")
