# 🎬 AI Video Studio Pro

> **Transform your raw footage into social-ready content with AI-driven captions and automated styling.**

AI Video Studio Pro is a comprehensive full-stack solution designed to automate the tedious parts of video editing. By leveraging OpenAI's Whisper and powerful rendering engines, it transcribes, styles, and "burns" captions directly into your video files through a sleek, modern interface.

---

## ✨ Key Features

### 🧠 Intelligent Processing
* **Speech-to-Text:** High-accuracy transcription using OpenAI Whisper.
* **Auto-Synchronization:** Perfectly timed captions based on audio timestamps.
* **Audio Preservation:** Crystal clear audio merging with zero quality loss.

### 🎨 Creative Control (Caption Styling)
Customize your captions to match your brand's aesthetic:
* **Typography:** Change font size, weights (Bold/Italic), and colors.
* **Visibility:** Toggle background highlights and adjust opacity.
* **Positioning:** Smart presets for **Top**, **Middle**, or **Bottom** placement.

### ⚡ Seamless UX
* **Real-time Feedback:** Live upload progress and processing status.
* **Instant Preview:** View metadata and original video before rendering.
* **Single-Click Export:** Download high-quality, rendered MP4 files directly.

---

## 🛠 Tech Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React, Tailwind CSS | UI/UX & API Communication |
| **Backend** | FastAPI / Flask (Python) | Video Processing Pipeline |
| **AI Model** | OpenAI Whisper | Speech Recognition |
| **Rendering** | FFmpeg, MoviePy | Video Encoding & Caption Burning |
| **State Management** | React Query / Zustand | Async data handling |

---

## 🏗 System Architecture



1.  **Upload:** Frontend sends video to the Python backend via multipart form data.
2.  **Transcription:** Whisper processes the audio track to generate an `.srt` or `.ass` file.
3.  **Styling:** User-defined styles from the UI are applied to the caption metadata.
4.  **Rendering:** FFmpeg overlays the captions onto the video stream.
5.  **Output:** The final processed file is served back to the client for download.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py