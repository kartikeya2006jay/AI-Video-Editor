'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Volume2, Captions } from 'lucide-react';

interface Caption {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

interface VideoPlayerWithCaptionsProps {
  videoUrl: string;
  captions?: Caption[];
  autoPlay?: boolean;
  showControls?: boolean;
}

export default function VideoPlayerWithCaptions({
  videoUrl,
  captions = [],
  autoPlay = false,
  showControls = true,
}: VideoPlayerWithCaptionsProps) {
  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showCaptions, setShowCaptions] = useState(true);
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const [playerReady, setPlayerReady] = useState(false);
  
  const handleDuration = (duration: number) => {
    setDuration(duration);
  };
  
  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
      setCurrentTime(state.playedSeconds);
      
      if (captions.length > 0 && showCaptions) {
        const currentCaptionObj = captions.find(
          caption => 
            state.playedSeconds >= caption.startTime && 
            state.playedSeconds <= caption.endTime
        );
        setCurrentCaption(currentCaptionObj?.text || '');
      }
    }
  };
  
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPlayed(value);
  };
  
  const handleSeekMouseDown = () => {
    setSeeking(true);
  };
  
  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setSeeking(false);
    if (playerRef.current) {
      const value = parseFloat((e.target as HTMLInputElement).value);
      playerRef.current.seekTo(value);
    }
  };
  
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (value === 0) {
      setMuted(true);
    } else if (muted) {
      setMuted(false);
    }
  };
  
  const toggleMute = () => {
    setMuted(!muted);
  };
  
  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleReady = () => {
    setPlayerReady(true);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;
      
      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          toggleCaptions();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (playerRef.current) {
            playerRef.current.seekTo(Math.max(0, currentTime - 5));
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (playerRef.current) {
            playerRef.current.seekTo(Math.min(duration, currentTime + 5));
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, muted, showCaptions, currentTime, duration]);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto bg-black rounded-xl overflow-hidden shadow-2xl"
      tabIndex={0}
    >
      <div className="relative pt-[56.25%] bg-black">
        <div className="absolute inset-0">
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            playing={isPlaying}
            volume={volume}
            muted={muted}
            width="100%"
            height="100%"
            onReady={handleReady}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onDuration={handleDuration}
            onProgress={handleProgress}
            progressInterval={100}
            playsinline
          />
          
          {showCaptions && currentCaption && (
            <div className="absolute bottom-24 left-0 right-0 px-4">
              <div className="bg-black/70 backdrop-blur-sm text-white text-center py-3 px-6 rounded-lg max-w-2xl mx-auto">
                <p className="text-lg font-medium">{currentCaption}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showControls && (
        <div className="bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={0.999999}
              step="any"
              value={played}
              onChange={handleSeekChange}
              onMouseDown={handleSeekMouseDown}
              onMouseUp={handleSeekMouseUp}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-300 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <Volume2 className="w-5 h-5 text-white" />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleCaptions}
                className={`p-2 rounded-full transition-colors ${
                  showCaptions 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'hover:bg-white/20'
                }`}
              >
                <Captions className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          
          {captions.length > 0 && (
            <div className="mt-4 max-h-40 overflow-y-auto">
              <div className="text-sm text-gray-400 mb-2">Captions:</div>
              <div className="space-y-1">
                {captions.map((caption) => (
                  <div
                    key={caption.id}
                    className={`p-2 rounded text-sm ${
                      currentTime >= caption.startTime && 
                      currentTime <= caption.endTime
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                    onClick={() => {
                      if (playerRef.current) {
                        playerRef.current.seekTo(caption.startTime);
                      }
                    }}
                  >
                    <div className="text-xs text-gray-500">
                      {formatTime(caption.startTime)} - {formatTime(caption.endTime)}
                    </div>
                    <div>{caption.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!playerReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">Loading video...</div>
        </div>
      )}
      
      <div className="absolute top-4 right-4 hidden md:block">
        <div className="bg-black/70 backdrop-blur-sm text-white text-xs p-3 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
          <div className="font-bold mb-1">Keyboard Shortcuts:</div>
          <div>Space: Play/Pause</div>
          <div>M: Mute/Unmute</div>
          <div>C: Toggle Captions</div>
          <div>← →: Seek 5s</div>
        </div>
      </div>
    </div>
  );
}
