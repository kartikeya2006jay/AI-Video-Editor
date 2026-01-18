// app/page.tsx (COMPLETE ENHANCED VERSION)
"use client"

import { useState, useRef, useEffect } from "react"
import { Upload, Loader2, Video, Sparkles, Download, Play, Settings, Volume2, Captions, Zap, Shield, Clock, FileVideo, Bold, Italic, Type, Palette, Save, Droplets, Check, ChevronRight, Wand2 } from "lucide-react"

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
  const [isProcessingComplete, setIsProcessingComplete] = useState(false)
  
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
      fontColor: '#ffffff',
      backgroundColor: '#00000080',
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
  const [showSuccess, setShowSuccess] = useState(false)

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
      
      const activeSubtitle = subtitles.find(
        sub => currentTime >= sub.startTime && currentTime <= sub.endTime
      )
      
      if (activeSubtitle?.id !== currentSubtitle?.id) {
        setCurrentSubtitle(activeSubtitle || null)
      }
    }

    video.addEventListener("timeupdate", handleTimeUpdate)
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
    
    const processingData = {
      themeSettings: {
        captions: {
          ...themeSettings.captions,
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
    setIsProcessingComplete(false)
    setUploadProgress(0)

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
        const timestamp = new Date().getTime()
        setVideoUrl(`http://localhost:8000/output-video?t=${timestamp}`)
        setUploadProgress(100)
        setIsProcessingComplete(true)
        setShowSuccess(true)
        
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        throw new Error(result.message || "Processing failed")
      }
      
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

  const updateSubtitleText = (id: string, text: string) => {
    setSubtitles(prev => prev.map(sub => 
      sub.id === id ? { ...sub, text } : sub
    ))
  }

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

  const getVideoFilterStyle = () => {
    return {
      filter: `brightness(${themeSettings.video.brightness}%) contrast(${themeSettings.video.contrast}%) saturate(${themeSettings.video.saturation}%)`
    }
  }

  const getVideoSrc = () => {
    if (videoUrl) {
      return videoUrl
    } else if (file) {
      return URL.createObjectURL(file)
    }
    return undefined
  }

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

  const selectTextColor = (color: string) => {
    updateCaptionSetting('fontColor', color)
  }

  const selectBackgroundColor = (color: string) => {
    updateCaptionSetting('backgroundColor', color)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient(at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)" />
      </div>

      {/* Success notification */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg border border-green-500/30 rounded-xl p-4 flex items-center gap-3 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center animate-bounce-subtle">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-white">Processing Complete!</p>
              <p className="text-sm text-green-300">Video enhanced successfully</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-lg sticky top-0 z-40 animate-slide-down">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg hover-lift transition-all duration-300 group-hover:shadow-blue-500/20 group-hover:scale-105">
                <Video className="w-8 h-8 text-white animate-pulse-subtle" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span className="gradient-text">AI Video Studio Pro</span>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30 animate-glow">
                    BETA
                  </span>
                </h1>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Professional video enhancement
                  </span>
                  <span className="text-gray-600">•</span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                    Real-time preview
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-300 border border-gray-700/50 hover:border-blue-500/30 hover-lift group">
                  <Settings className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm font-medium text-white">Settings</span>
                  <ChevronRight className="w-3 h-3 text-gray-500 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-lg rounded-xl p-3 shadow-2xl border border-gray-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 origin-top-right scale-95 group-hover:scale-100">
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center justify-between">
                      <span>Theme Settings</span>
                      <Palette className="w-3 h-3" />
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center justify-between">
                      <span>Export Preferences</span>
                      <Download className="w-3 h-3" />
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors flex items-center justify-between">
                      <span>Keyboard Shortcuts</span>
                      <Zap className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold cursor-pointer hover-lift hover:scale-105 transition-transform shadow-lg hover:shadow-xl animate-bounce-subtle">
                  <span className="relative">
                    U
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-pink-500/30 blur-sm rounded-full -z-10" />
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8 animate-fade-in">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Panel - Upload & Controls */}
          <div className="col-span-4 space-y-8">
            {/* Upload Section */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover-lift transition-all duration-300 hover:border-blue-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Upload className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Upload Video</h2>
                  <p className="text-sm text-gray-400">Supported: MP4, MOV, AVI up to 500MB</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className={`block relative border-2 ${file ? 'border-green-500/50 shadow-lg shadow-green-500/20' : 'border-dashed border-gray-600/50 hover:border-blue-500/50'} rounded-xl p-6 transition-all duration-300 hover:bg-gray-800/30 cursor-pointer group ripple-effect`}>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-700/50 mb-4 group-hover:scale-110 transition-transform duration-500">
                      {file ? (
                        <div className="relative">
                          <Video className="w-8 h-8 text-green-400" />
                          <div className="absolute -inset-1 bg-green-500/20 blur-xl rounded-full animate-pulse" />
                        </div>
                      ) : (
                        <div className="relative">
                          <FileVideo className="w-8 h-8 text-gray-400 group-hover:text-blue-400 transition-colors" />
                          <div className="absolute -inset-1 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
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
                    <div className="relative overflow-hidden">
                      <div className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 group-hover:from-blue-500 group-hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 inline-block hover-lift shadow-lg group-hover:shadow-xl">
                        {file ? "Change Video" : "Browse Files"}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
                  <div className="bg-gradient-to-br from-gray-700/30 to-gray-800/30 rounded-xl p-4 animate-slide-up border border-gray-700/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1 group">
                        <p className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors">Duration</p>
                        <p className="text-sm font-medium text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400 group-hover:animate-spin-slow transition-all" />
                          {formatDuration(videoDuration)}
                        </p>
                      </div>
                      <div className="space-y-1 group">
                        <p className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors">Resolution</p>
                        <p className="text-sm font-medium text-white flex items-center gap-2">
                          <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-pink-500 group-hover:scale-110 transition-transform" />
                          {videoResolution.width} × {videoResolution.height}
                        </p>
                      </div>
                      <div className="space-y-1 group">
                        <p className="text-xs text-gray-400 group-hover:text-green-400 transition-colors">Size</p>
                        <p className="text-sm font-medium text-white flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 group-hover:animate-bounce-subtle" />
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                      <div className="space-y-1 group">
                        <p className="text-xs text-gray-400 group-hover:text-green-400 transition-colors">Status</p>
                        <p className="text-sm font-medium text-green-400 flex items-center gap-2 animate-pulse-subtle">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          Ready to Process
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Caption Customization */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover-lift transition-all duration-300 hover:border-purple-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Type className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Caption Settings</h2>
                  <p className="text-sm text-gray-400">Customize how captions appear</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Subtitle List */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center justify-between">
                    <span>Subtitles</span>
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                      {subtitles.length} items
                    </span>
                  </label>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                    {subtitles.map((subtitle, index) => (
                      <div 
                        key={subtitle.id} 
                        className="bg-gray-700/50 rounded-lg p-3 hover:bg-gray-700/70 transition-all duration-300 hover-lift group"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = subtitle.startTime
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors">
                            {formatDuration(subtitle.startTime)} - {formatDuration(subtitle.endTime)}
                          </span>
                          <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full">
                            #{index + 1}
                          </span>
                        </div>
                        <textarea
                          value={subtitle.text}
                          onChange={(e) => updateSubtitleText(subtitle.id, e.target.value)}
                          className="w-full bg-transparent text-white text-sm border-none outline-none placeholder-gray-500 resize-none h-12 focus:ring-2 focus:ring-blue-500/30 focus:bg-gray-800/30 rounded p-2 transition-all"
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
                      className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all hover-lift ${themeSettings.captions.bold ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white'}`}
                    >
                      <Bold className="w-4 h-4" />
                      Bold
                      {themeSettings.captions.bold && (
                        <Check className="w-3 h-3 animate-enter" />
                      )}
                    </button>
                    <button
                      onClick={() => updateCaptionSetting('italic', !themeSettings.captions.italic)}
                      className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all hover-lift ${themeSettings.captions.italic ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400 shadow-lg shadow-purple-500/10' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white'}`}
                    >
                      <Italic className="w-4 h-4" />
                      Italic
                      {themeSettings.captions.italic && (
                        <Check className="w-3 h-3 animate-enter" />
                      )}
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
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer progress-gradient [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-lg"
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
                        className={`relative w-full h-8 rounded-lg border-2 transition-all hover-lift ${themeSettings.captions.fontColor === color.value ? 'border-white scale-105 shadow-lg shadow-white/20' : 'border-gray-600 hover:border-gray-500'}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        <span className="text-xs font-medium" style={{ color: color.textColor }}>
                          {color.name}
                        </span>
                        {themeSettings.captions.fontColor === color.value && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center animate-enter shadow-md">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
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
                        className={`relative w-full h-8 rounded-lg border-2 transition-all hover-lift ${themeSettings.captions.backgroundColor === bg.value ? 'border-white scale-105 shadow-lg shadow-white/20' : 'border-gray-600 hover:border-gray-500'}`}
                        style={{ backgroundColor: bg.value }}
                        title={bg.name}
                      >
                        <span className="text-xs font-medium" style={{ color: bg.textColor }}>
                          {bg.name}
                        </span>
                        {themeSettings.captions.backgroundColor === bg.value && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center animate-enter shadow-md">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
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
                        className={`py-2 rounded-lg text-sm transition-all hover-lift ${themeSettings.captions.position === position ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white'}`}
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
              className="w-full group relative overflow-hidden py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-500 hover:via-blue-600 hover:to-purple-600 text-white font-semibold text-lg transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl active:scale-[0.98] border border-blue-500/30 hover:border-blue-400/50 hover-lift transform hover:-translate-y-0.5"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="relative">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <div className="absolute inset-0 animate-ping opacity-20">
                        <Loader2 className="w-5 h-5" />
                      </div>
                    </div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300 group-hover:text-yellow-300" />
                    <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Generate Enhanced Video
                    </span>
                  </>
                )}
              </div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 shimmer-effect opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              
              {/* Ripple effect */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
              </div>
              
              {/* Processing complete effect */}
              {isProcessingComplete && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 animate-pulse rounded-2xl" />
              )}
            </button>

            {/* Progress Bar */}
            {loading && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                    <span className="font-medium text-white">Processing Video</span>
                  </div>
                  <span className="text-lg font-bold text-blue-400 animate-pulse-subtle">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300 progress-gradient"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-4 text-center animate-pulse">
                  {uploadProgress < 50 ? "Uploading to server..." : 
                   uploadProgress < 80 ? "Processing with AI..." : 
                   "Finalizing and encoding..."}
                </p>
              </div>
            )}
          </div>

          {/* Center Panel - Video Preview */}
          <div className="col-span-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 hover-lift transition-all duration-300 hover:border-blue-500/30">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <span className="gradient-text">Video Preview</span>
                    {file && (
                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 animate-pulse">
                        LIVE
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-400 flex items-center gap-2">
                    {file ? (
                      <>
                        <span className="text-blue-400">Editing:</span>
                        <span className="text-white font-medium">{file.name}</span>
                      </>
                    ) : (
                      "Upload a video to begin editing"
                    )}
                  </p>
                </div>
                {videoUrl && (
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover-lift group"
                  >
                    <Download className="w-4 h-4 group-hover:animate-bounce-subtle" />
                    Download Video
                  </button>
                )}
              </div>

              {/* Video Player */}
              <div className="space-y-6">
                {/* Video Container */}
                <div className="relative rounded-xl overflow-hidden border-2 border-blue-500/30 bg-gray-900 aspect-video group hover:border-blue-500/50 transition-all duration-300">
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
                    <div className="w-full h-full flex items-center justify-center bg-gray-800/50">
                      <div className="text-center animate-fade-in">
                        <div className="w-24 h-24 rounded-full bg-gray-700/50 border-4 border-gray-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                          <Play className="w-12 h-12 text-gray-600 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-500 mb-2">Preview will appear here</h3>
                        <p className="text-gray-600 max-w-md">
                          Upload a video to see the preview with real-time subtitle rendering
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* DYNAMIC SUBTITLE OVERLAY */}
                  {file && currentSubtitle && (
                    <div 
                      key={`subtitle-${currentSubtitle.id}-${forceUpdate}`}
                      className="absolute left-0 right-0 px-4 z-10 pointer-events-none animate-fade-in"
                      style={getSubtitlePositionStyle()}
                    >
                      <div 
                        className="mx-auto px-6 py-3 rounded-lg text-center transition-all duration-300 hover:scale-105"
                        style={{
                          backgroundColor: themeSettings.captions.backgroundColor,
                          fontSize: `${themeSettings.captions.fontSize}px`,
                          color: themeSettings.captions.fontColor,
                          fontWeight: themeSettings.captions.bold ? 'bold' : 'normal',
                          fontStyle: themeSettings.captions.italic ? 'italic' : 'normal',
                          textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3), 0 0 30px rgba(59, 130, 246, 0.1)',
                          lineHeight: '1.2',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          borderRadius: '8px',
                          padding: '12px 20px',
                          maxWidth: '90%',
                          margin: '0 auto',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        {currentSubtitle.text}
                      </div>
                    </div>
                  )}

                  {/* Current Time Display */}
                  {file && (
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 z-10 animate-slide-up">
                      <span className="text-white text-sm font-medium flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {videoRef.current ? formatDuration(videoRef.current.currentTime) : "0:00"}
                      </span>
                    </div>
                  )}

                  {/* Current Subtitle Indicator */}
                  {currentSubtitle && (
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-1.5 z-10 animate-slide-up">
                      <span className="text-blue-400 text-sm font-medium flex items-center gap-2">
                        <Captions className="w-3 h-3 animate-pulse" />
                        {formatDuration(currentSubtitle.startTime)} - {formatDuration(currentSubtitle.endTime)}
                      </span>
                    </div>
                  )}

                  {/* Video Stats Overlay */}
                  {(file || videoUrl) && (
                    <div className="absolute top-4 right-4 z-10 animate-slide-up">
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
                  <div className="bg-gray-800/30 rounded-xl p-4 animate-fade-in hover-lift transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                        <Captions className="w-5 h-5 text-blue-400 animate-pulse-subtle" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Current Caption</p>
                        <p className="text-lg font-semibold text-white mb-1">{currentSubtitle.text}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <span>{formatDuration(currentSubtitle.startTime)} - {formatDuration(currentSubtitle.endTime)}</span>
                          <span className="text-gray-600">•</span>
                          <span>Subtitle #{subtitles.findIndex(s => s.id === currentSubtitle.id) + 1}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Video Adjustments */}
                {file && (
                  <div className="bg-gray-800/30 rounded-xl p-6 hover-lift transition-all duration-300">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-purple-400" />
                      Video Adjustments
                    </h3>
                    <div className="space-y-6">
                      {(['brightness', 'contrast', 'saturation'] as const).map((setting) => (
                        <div key={setting} className="space-y-2 group">
                          <div className="flex justify-between">
                            <label className="text-sm font-medium text-white capitalize group-hover:text-blue-400 transition-colors">
                              {setting}
                            </label>
                            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                              {themeSettings.video[setting]}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={themeSettings.video[setting]}
                            onChange={(e) => updateVideoSetting(setting, parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer progress-gradient [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:shadow-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Grid */}
                {(file || videoUrl) && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-700/30 rounded-xl p-4 hover-lift transition-all duration-300 group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg group-hover:scale-110 transition-transform">
                          <Clock className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors">Duration</p>
                          <p className="text-lg font-semibold text-white">{formatDuration(videoDuration)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4 hover-lift transition-all duration-300 group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg group-hover:scale-110 transition-transform">
                          <Palette className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 group-hover:text-green-400 transition-colors">Caption Style</p>
                          <p className="text-lg font-semibold text-white">
                            {themeSettings.captions.bold ? 'Bold' : 'Regular'}
                            {themeSettings.captions.italic ? ', Italic' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-700/30 rounded-xl p-4 hover-lift transition-all duration-300 group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg group-hover:scale-110 transition-transform">
                          <Video className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 group-hover:text-purple-400 transition-colors">Resolution</p>
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
                  <div className="pt-8 border-t border-gray-700/50 animate-fade-in">
                    <h3 className="text-lg font-semibold text-white mb-6 text-center gradient-text">How It Works</h3>
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { step: "1", title: "Upload", desc: "Select video from your computer", icon: Upload, color: "blue" },
                        { step: "2", title: "Customize", desc: "Adjust captions & video settings", icon: Settings, color: "purple" },
                        { step: "3", title: "Process", desc: "AI enhances and adds captions", icon: Sparkles, color: "green" }
                      ].map((item) => (
                        <div key={item.step} className="text-center group">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${item.color}-500/20 to-${item.color}-600/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className={`w-6 h-6 text-${item.color}-400 group-hover:animate-bounce-subtle`} />
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
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700/50 z-50 animate-slide-up">
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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Backend Connected</span>
              </div>
              <div className="text-gray-500">|</div>
              <span className="text-blue-400">localhost:8000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating action button */}
      {file && !loading && (
        <button
          onClick={() => videoRef.current?.play()}
          className="fixed bottom-24 right-8 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover-lift animate-bounce-subtle z-40"
        >
          <Play className="w-6 h-6 text-white" />
        </button>
      )}

      <style jsx>{`
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 1s linear;
        }
        
        .aspect-video {
          aspect-ratio: 16/9;
        }
        
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.1);
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        
        input[type="range"] {
          -webkit-appearance: none;
          background: transparent;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          cursor: pointer;
        }
        
        .ripple-effect:active::after {
          animation: ripple 0.6s linear;
        }
        
        .bg-radial-gradient {
          background-image: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </main>
  )
}