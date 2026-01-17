"use client"

import { useState } from "react"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [color, setColor] = useState("#ffffff")
  const [videoUrl, setVideoUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!file) return alert("Upload a video")

    setLoading(true)
    const form = new FormData()
    form.append("video", file)
    form.append("caption_color", color.replace("#", "").toUpperCase())

    const res = await fetch("http://localhost:8000/process", {
      method: "POST",
      body: form
    })

    setLoading(false)
    if (!res.ok) return alert("Backend error")

    setVideoUrl(`http://localhost:8000/output-video?t=${Date.now()}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-8 w-[420px] space-y-4">
        <h1 className="text-2xl font-bold text-center">
          AI Talking-Head Video Editor
        </h1>

        <div>
          <label className="text-sm font-medium">Upload Video</label>
          <input
            type="file"
            accept="video/*"
            className="mt-1 block w-full"
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Caption Color</label>
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-full h-10"
          />
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Processing..." : "Generate Video"}
        </button>

        {videoUrl && (
          <video
            src={videoUrl}
            controls
            className="w-full rounded mt-4"
          />
        )}
      </div>
    </main>
  )
}
