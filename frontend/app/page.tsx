"use client"

import { useState } from "react"
import UploadBox from "../components/UploadBox"
import OptionsPanel from "../components/OptionsPanel"
import VideoPreview from "../components/VideoPreview"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [outputUrl, setOutputUrl] = useState<string | null>(null)
  const [options, setOptions] = useState({
    theme: "default",
    animation: "fade",
    mode: "normal"
  })

  const generateVideo = async () => {
    if (!file) return

    const form = new FormData()
    form.append("video", file)
    form.append("options", JSON.stringify(options))

    await fetch("http://localhost:8000/process", {
      method: "POST",
      body: form
    })

    setOutputUrl("http://localhost:8000/output-video")
  }

  return (
    <main className="p-8 space-y-6 bg-black text-white min-h-screen">
      <h1 className="text-3xl font-bold">AI Talking-Head Video Editor</h1>

      <UploadBox onUpload={setFile} />

      <OptionsPanel options={options} setOptions={setOptions} />

      <button
        onClick={generateVideo}
        className="bg-blue-600 px-6 py-2 rounded"
      >
        Generate Video
      </button>

      {outputUrl && <VideoPreview url={outputUrl} />}
    </main>
  )
}
