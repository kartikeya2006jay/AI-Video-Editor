"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, Loader2, Video, Sparkles, Download, Play, Settings, Volume2, Captions, Zap, Shield, Clock, FileVideo, Bold, Italic, Type, Palette, Save, Droplets } from "lucide-react"

interface ThemeSettings {
  captions: {
    bold: boolean
    italic: boolean
    fontSize: number
    fontColor: string
    backgroundColor: string
    position: 'top' | 'middle' | 'bottom'
  }
  video: {
    brightness: number
    contrast: number
    saturation: number
  }
}

interface Subtitle {
  id: string
  text: string
  startTime: number  // in seconds
  endTime: number    // in seconds
}

// Color palette options
const COLOR_PRESETS = [
  { name: "Transparent", value: "#00000000", textColor: "#ffffff" },
  { name: "Dark", value: "#000000", textColor: "#ffffff" },
  { name: "Light", value: "#ffffff", textColor: "#000000" },
  { name: "Blue", value: "#0000ff", textColor: "#ffffff" },
  { name: "Red", value: "#ff0000", textColor: "#ffffff" },
  { name: "Green", value: "#00ff00", textColor: "#000000" },
  { name: "Yellow", value: "#ffff00", textColor: "#000000" },
  { name: "Purple", value: "#800080", textColor: "#ffffff" },
  { name: "Orange", value: "#ffa500", textColor: "#000000" },
  { name: "Pink", value: "#ff69b4", textColor: "#000000" },
]

const BACKGROUND_PRESETS = [
  { name: "Transparent", value: "#00000000", textColor: "#ffffff" },
  { name: "Dark", value: "#00000080", textColor: "#ffffff" },
  { name: "Light", value: "#ffffff80", textColor: "#000000" },
  { name: "Blue", value: "#0000ff80", textColor: "#ffffff" },
  { name: "Red", value: "#ff000080", textColor: "#ffffff" },
  { name: "Green", value: "#00ff0080", textColor: "#000000" },
  { name: "Yellow", value: "#ffff0080", textColor: "#000000" },
  { name: "Purple", value: "#80008080", textColor: "#ffffff" },
]

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoDuration, setVideoDuration] = useState<number>(0)
  const [videoResolution, setVideoResolution] = useState({ width: 0, height: 0 })
  
  // Subtitle state
  const [subtitles, setSubtitles] = useState<Subtitle[]>([
    { 
      id: "1", 
      text: "Hi everyone, I am Srivindu Kumar and basically what I am going to show you, this is a demo of", 
      startTime: 0, 
      endTime: 5 
    },
    { 
      id: "2", 
      text: "Welcome to AI Video Studio Pro", 
      startTime: 5, 
      endTime: 10 
    },
    { 
      id: "3", 
      text: "This is subtitle number three", 
      startTime: 10, 
      endTime: 15 
    },
    { 
      id: "4", 
      text: "Thanks for watching!", 
      startTime: 15, 
      endTime: 20 
    },
  ])
  
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null)
  
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    captions: {
      bold: true,
      italic: false,
      fontSize: 57,
      fontColor: '#ffffff', // White text
      backgroundColor: '#00000080', // Dark background
      position: 'bottom'
    },
    video: {
      brightness: 100,
      contrast: 100,
      saturation: 100
    }
  })
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const [forceUpdate, setForceUpdate] = useState(0)

  // Extract video metadata when file changes
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      const tempVideo = document.createElement('video')
      tempVideo.src = url
      
      tempVideo.addEventListener('loadedmetadata', () => {
        setVideoDuration(tempVideo.duration)
        setVideoResolution({
          width: tempVideo.videoWidth,
          height: tempVideo.videoHeight
        })
        URL.revokeObjectURL(url)
        
        // Auto-play the video when loaded
        if (videoRef.current) {
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.error)
            }
          }, 500)
        }
      })
    }
  }, [file])

  // Handle video time updates for subtitle synchronization
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime
      
      // Find the subtitle that should be active
      const activeSubtitle = subtitles.find(
        sub => currentTime >= sub.startTime && currentTime <= sub.endTime
      )
      
      // Only update if subtitle changed
      if (activeSubtitle?.id !== currentSubtitle?.id) {
        setCurrentSubtitle(activeSubtitle || null)
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
    
    // Also check on play/pause
    video.addEventListener("play", handleTimeUpdate)
    video.addEventListener("pause", handleTimeUpdate)
    
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("play", handleTimeUpdate)
      video.removeEventListener("pause", handleTimeUpdate)
    }
  }, [subtitles, currentSubtitle])

  // Force update when caption settings change
  useEffect(() => {
    setForceUpdate(prev => prev + 1)
  }, [themeSettings.captions])

  const generate = async () => {
    if (!file) {
      alert("Please upload a video")
      return
    }

    const form = new FormData()
    form.append("video", file)
    
    // Send theme settings and subtitles to backend in serializable format
    const processingData = {
      themeSettings: {
        captions: {
          ...themeSettings.captions,
          // Ensure all values are primitives
          bold: themeSettings.captions.bold,
          italic: themeSettings.captions.italic,
          fontSize: Number(themeSettings.captions.fontSize),
          fontColor: String(themeSettings.captions.fontColor),
          backgroundColor: String(themeSettings.captions.backgroundColor),
          position: String(themeSettings.captions.position)
        },
        video: {
          brightness: Number(themeSettings.video.brightness),
          contrast: Number(themeSettings.video.contrast),
          saturation: Number(themeSettings.video.saturation)
        }
      },
      subtitles: subtitles.map(sub => ({
        id: String(sub.id),
        text: String(sub.text),
        startTime: Number(sub.startTime),
        endTime: Number(sub.endTime)
      }))
    }
    
    form.append("processingData", JSON.stringify(processingData))

    setLoading(true)
    setUploadProgress(0)

    // Real progress simulation
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const res = await fetch("http://localhost:8000/process", {
        method: "POST",
        body: form
      })

      clearInterval(progressInterval)
      
      if (!res.ok) {
        throw new Error("Backend error")
      }

      const result = await res.json()
      
      if (result.status === "success") {
        // Add cache busting timestamp
        const timestamp = new Date().getTime()
        setVideoUrl(`http://localhost:8000/output-video?t=${timestamp}`)
        setUploadProgress(100)
      } else {
        throw new Error(result.message || "Processing failed")
      }
      
      // Clean up after 2 seconds
      setTimeout(() => setUploadProgress(0), 2000)

    } catch (error) {
      alert(`Error processing video: ${error}`)
    } finally {
      setTimeout(() => setLoading(false), 500)
    }
  }

  const handleDownload = () => {
    if (videoUrl) {
      const a = document.createElement('a')
      a.href = videoUrl
      a.download = `enhanced-video-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const updateCaptionSetting = (key: keyof ThemeSettings['captions'], value: any) => {
    setThemeSettings(prev => ({
      ...prev,
      captions: {
        ...prev.captions,
        [key]: value
      }
    }))
  }

  const updateVideoSetting = (key: keyof ThemeSettings['video'], value: number) => {
    setThemeSettings(prev => ({
      ...prev,
      video: {
        ...prev.video,
        [key]: value
      }
    }))
  }

  // Function to update subtitle text
  const updateSubtitleText = (id: string, text: string) => {
    setSubtitles(prev => prev.map(sub => 
      sub.id === id ? { ...sub, text } : sub
    ))
  }

  // Function to update subtitle timing
  const updateSubtitleTiming = (id: string, startTime: number, endTime: number) => {
    setSubtitles(prev => prev.map(sub => 
      sub.id === id ? { ...sub, startTime, endTime } : sub
    ))
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Apply video filters dynamically
  const getVideoFilterStyle = () => {
    return {
      filter: `brightness(${themeSettings.video.brightness}%) contrast(${themeSettings.video.contrast}%) saturate(${themeSettings.video.saturation}%)`
    }
  }

  // Get video source URL
  const getVideoSrc = () => {
    if (videoUrl) {
      return videoUrl
    } else if (file) {
      return URL.createObjectURL(file)
    }
    return undefined
  }

  // Get position style for subtitle
  const getSubtitlePositionStyle = () => {
    switch (themeSettings.captions.position) {
      case 'top':
        return { top: '10%', transform: 'translateY(0)' }
      case 'middle':
        return { top: '50%', transform: 'translateY(-50%)' }
      case 'bottom':
        return { top: '85%', transform: 'translateY(0)' }
      default:
        return { top: '85%', transform: 'translateY(0)' }
    }
  }

  // Handle color selection from presets
  const selectTextColor = (color: string) => {
    updateCaptionSetting('fontColor', color)
  }

  const selectBackgroundColor = (color: string) => {
    updateCaptionSetting('backgroundColor', color)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Video Studio Pro</h1>
                <p className="text-sm text-gray-400">Professional video enhancement with real-time preview</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium text-white">Save Theme</span>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold cursor-pointer">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel - Upload & Controls */}
          <div className="col-span-4 space-y-8">
            {/* Upload Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Upload className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Upload Video</h2>
                  <p className="text-sm text-gray-400">Supported: MP4, MOV, AVI up to 500MB</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className={`block relative border-2 ${file ? 'border-green-500/30' : 'border-dashed border-gray-600/50'} rounded-xl p-6 transition-all duration-300 hover:border-blue-500/50 hover:bg-gray-800/30 cursor-pointer`}>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700/50 mb-4">
                      {file ? (
                        <Video className="w-8 h-8 text-green-400" />
                      ) : (
                        <FileVideo className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-medium text-white mb-2">
                      {file ? file.name : "Drop video here or click to browse"}
                    </h3>
                    {file && (
                      <p className="text-sm text-gray-400 mb-4">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {videoResolution.width}x{videoResolution.height}
                      </p>
                    )}
                    <div className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 inline-block">
                      {file ? "Change Video" : "Browse Files"}
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null
                      setFile(selectedFile)
                      setVideoUrl("")
                      setCurrentSubtitle(null)
                    }}
                  />
                </label>

                {/* File Details */}
                {file && (
                  <div className="bg-gray-700/30 rounded-xl p-4 animate-slide-up">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Duration</p>
                        <p className="text-sm font-medium text-white">{formatDuration(videoDuration)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Resolution</p>
                        <p className="text-sm font-medium text-white">{videoResolution.width} × {videoResolution.height}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Size</p>
                        <p className="text-sm font-medium text-white">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400">Status</p>
                        <p className="text-sm font-medium text-green-400 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Ready
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Caption Customization - FIXED */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Type className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Caption Settings</h2>
                  <p className="text-sm text-gray-400">Customize how captions appear</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Subtitle List */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Subtitles</label>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {subtitles.map((subtitle, index) => (
                      <div key={subtitle.id} className="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-400">
                            {formatDuration(subtitle.startTime)} - {formatDuration(subtitle.endTime)}
                          </span>
                          <span className="text-xs text-blue-400 font-medium">#{index + 1}</span>
                        </div>
                        <textarea
                          value={subtitle.text}
                          onChange={(e) => updateSubtitleText(subtitle.id, e.target.value)}
                          className="w-full bg-transparent text-white text-sm border-none outline-none placeholder-gray-500 resize-none h-12"
                          placeholder="Enter subtitle text..."
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text Style */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white">Text Style</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateCaptionSetting('bold', !themeSettings.captions.bold)}
                      className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${themeSettings.captions.bold ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-400'}`}
                    >
                      <Bold className="w-4 h-4" />
                      Bold
                    </button>
                    <button
                      onClick={() => updateCaptionSetting('italic', !themeSettings.captions.italic)}
                      className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all ${themeSettings.captions.italic ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-400'}`}
                    >
                      <Italic className="w-4 h-4" />
                      Italic
                    </button>
                  </div>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-white">Font Size</label>
                    <span className="text-sm text-gray-400">{themeSettings.captions.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={themeSettings.captions.fontSize}
                    onChange={(e) => updateCaptionSetting('fontSize', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                  />
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Text Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_PRESETS.slice(0, 4).map((color) => (
                      <button
                        key={color.value}
                        onClick={() => selectTextColor(color.value)}
                        className={`relative w-full h-8 rounded-lg border-2 transition-all ${themeSettings.captions.fontColor === color.value ? 'border-white scale-105' : 'border-gray-600 hover:scale-105'}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        <span className="text-xs" style={{ color: color.textColor }}>
                          {color.name}
                        </span>
                        {themeSettings.captions.fontColor === color.value && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Background Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BACKGROUND_PRESETS.slice(0, 4).map((bg) => (
                      <button
                        key={bg.value}
                        onClick={() => selectBackgroundColor(bg.value)}
                        className={`relative w-full h-8 rounded-lg border-2 transition-all ${themeSettings.captions.backgroundColor === bg.value ? 'border-white scale-105' : 'border-gray-600 hover:scale-105'}`}
                        style={{ backgroundColor: bg.value }}
                        title={bg.name}
                      >
                        <span className="text-xs" style={{ color: bg.textColor }}>
                          {bg.name}
                        </span>
                        {themeSettings.captions.backgroundColor === bg.value && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Position</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['top', 'middle', 'bottom'] as const).map((position) => (
                      <button
                        key={position}
                        onClick={() => updateCaptionSetting('position', position)}
                        className={`py-2 rounded-lg text-sm transition-all ${themeSettings.captions.position === position ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-400'}`}
                      >
                        {position.charAt(0).toUpperCase() + position.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              disabled={loading || !file}
              className="w-full group relative overflow-hidden py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white font-semibold text-lg hover:from-blue-500 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl active:scale-[0.98] border border-blue-500/30"
            >
              <div className="flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Generate Enhanced Video</span>
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>

            {/* Progress Bar */}
            {loading && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    <span className="font-medium text-white">Processing Video</span>
                  </div>
                  <span className="text-lg font-bold text-blue-400">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-4 text-center">
                  {uploadProgress < 50 ? "Uploading to server..." : 
                   uploadProgress < 80 ? "Processing with AI..." : 
                   "Finalizing and encoding..."}
                </p>
              </div>
            )}
          </div>

          {/* Center Panel - Video Preview */}
          <div className="col-span-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Video Preview</h2>
                  <p className="text-gray-400">
                    {file ? `Editing: ${file.name}` : "Upload a video to begin editing"}
                  </p>
                </div>
                {videoUrl && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <Download className="w-4 h-4" />
                    Download Video
                  </button>
                )}
              </div>

              {/* Video Player */}
              <div className="space-y-6">
                {/* Video Container - FIXED SUBTITLE PREVIEW */}
                <div className="relative rounded-xl overflow-hidden border-2 border-blue-500/30 bg-gray-900 aspect-video">
                  {file || videoUrl ? (
                    <video
                      ref={videoRef}
                      src={getVideoSrc()}
                      controls
                      className="w-full h-full"
                      style={getVideoFilterStyle()}
                      autoPlay
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <div className="text-center">
                        <div className="w-24 h-24 rounded-full bg-gray-700/50 border-4 border-gray-600 flex items-center justify-center mx-auto mb-4">
                          <Play className="w-12 h-12 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-500 mb-2">Preview will appear here</h3>
                        <p className="text-gray-600 max-w-md">
                          Upload a video to see the preview
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* DYNAMIC SUBTITLE OVERLAY - NOW UPDATES PROPERLY */}
                  {file && currentSubtitle && (
                    <div 
                      key={`subtitle-${currentSubtitle.id}-${forceUpdate}`}
                      className="absolute left-0 right-0 px-4 z-10 pointer-events-none"
                      style={getSubtitlePositionStyle()}
                    >
                      <div 
                        className="mx-auto px-6 py-3 rounded-lg text-center"
                        style={{
                          backgroundColor: themeSettings.captions.backgroundColor,
                          fontSize: `${themeSettings.captions.fontSize}px`,
                          color: themeSettings.captions.fontColor,
                          fontWeight: themeSettings.captions.bold ? 'bold' : 'normal',
                          fontStyle: themeSettings.captions.italic ? 'italic' : 'normal',
                          textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          lineHeight: '1.2',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          borderRadius: '8px',
                          padding: '12px 20px',
                          maxWidth: '90%',
                          margin: '0 auto',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {currentSubtitle.text}
                      </div>
                    </div>
                  )}

                  {/* Current Time Display */}
                  {file && (
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 z-10">
                      <span className="text-white text-sm font-medium">
                        {videoRef.current ? formatDuration(videoRef.current.currentTime) : "0:00"}
                      </span>
                    </div>
                  )}

                  {/* Current Subtitle Indicator */}
                  {currentSubtitle && (
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 z-10">
                      <span className="text-blue-400 text-sm font-medium flex items-center gap-2">
                        <Captions className="w-3 h-3" />
                        {formatDuration(currentSubtitle.startTime)} - {formatDuration(currentSubtitle.endTime)}
                      </span>
                    </div>
                  )}

                  {/* Video Stats Overlay */}
                  {(file || videoUrl) && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="px-3 py-1.5 bg-black/80 backdrop-blur-sm rounded-lg">
                        <span className="text-white text-sm font-medium flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          {videoResolution.width || 1280}p
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Current Subtitle Info */}
                {currentSubtitle && (
                  <div className="bg-gray-800/30 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Captions className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Current Caption</p>
                        <p className="text-lg font-semibold text-white mb-1">{currentSubtitle.text}</p>
                        <p className="text-xs text-gray-500">
                          {formatDuration(currentSubtitle.startTime)} - {formatDuration(currentSubtitle.endTime)} • Subtitle #{subtitles.findIndex(s => s.id === currentSubtitle.id) + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Adjustments */}
                {file && (
                  <div className="bg-gray-800/30 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Video Adjustments</h3>
                    <div className="space-y-6">
                      {(['brightness', 'contrast', 'saturation'] as const).map((setting) => (
                        <div key={setting} className="space-y-2">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium text-white capitalize">
                              {setting}
                            </label>
                            <span className="text-sm text-gray-400">{themeSettings.video[setting]}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={themeSettings.video[setting]}
                            onChange={(e) => updateVideoSetting(setting, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                {(file || videoUrl) && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-700/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-sm text-gray-400">Duration</p>
                          <p className="text-lg font-semibold text-white">{formatDuration(videoDuration)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Palette className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-sm text-gray-400">Caption Style</p>
                          <p className="text-lg font-semibold text-white">
                            {themeSettings.captions.bold ? 'Bold' : 'Regular'}
                            {themeSettings.captions.italic ? ', Italic' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-sm text-gray-400">Resolution</p>
                          <p className="text-lg font-semibold text-white">
                            {videoResolution.width || 1280} × {videoResolution.height || 720}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {!videoUrl && !loading && !file && (
                  <div className="pt-8 border-t border-gray-700/50">
                    <h3 className="text-lg font-semibold text-white mb-4">How It Works</h3>
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { step: "1", title: "Upload", desc: "Select video from your computer" },
                        { step: "2", title: "Customize", desc: "Adjust captions & video settings" },
                        { step: "3", title: "Process", desc: "AI enhances and adds captions" }
                      ].map((item) => (
                        <div key={item.step} className="text-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3">
                            <span className="text-blue-400 font-bold text-lg">{item.step}</span>
                          </div>
                          <h4 className="font-medium text-white mb-2">{item.title}</h4>
                          <p className="text-sm text-gray-400">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 z-50">
        <div className="container mx-auto px-8 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${file ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-gray-300">
                  {file ? `Ready: ${file.name}` : "No video selected"}
                </span>
              </div>
              {videoDuration > 0 && (
                <>
                  <div className="text-gray-500">|</div>
                  <div className="text-gray-400">
                    Duration: {formatDuration(videoDuration)}
                  </div>
                </>
              )}
              {currentSubtitle && (
                <>
                  <div className="text-gray-500">|</div>
                  <div className="text-blue-400 flex items-center gap-2">
                    <Captions className="w-3 h-3" />
                    "{currentSubtitle.text.substring(0, 30)}..."
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Backend Connected</span>
              </div>
              <div className="text-gray-500">|</div>
              <span>localhost:8000</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .aspect-video {
          aspect-ratio: 16/9;
        }
        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1f2937;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1f2937;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        input[type="color"] {
          -webkit-appearance: none;
          border: none;
          padding: 0;
        }
        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 6px;
        }
      `}</style>
    </main>
  )
}