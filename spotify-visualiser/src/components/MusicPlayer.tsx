import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react"
import { Play, Pause, SkipBack, SkipForward, Repeat, Star, MoreHorizontal, Keyboard, Search, Volume2, VolumeX, X, Plus, FileText } from "lucide-react"
import { motion } from "framer-motion"

// Base URL for assets (handles subdirectory deployment)
const BASE_URL = import.meta.env.BASE_URL || "/spotify-visualiser/"

// Lyrics data for tracks
const lyricsData: Record<number, string[]> = {
  1: [
    "I see you standing there",
    "With that look in your eyes",
    "And I know you're scared",
    "But you're trying to hide",
    "",
    "We've been through the fire",
    "And we've walked through the rain",
    "But I'll be by your side",
    "Until the end of days",
    "",
    "So die with a smile",
    "Knowing I was here",
    "Die with a smile",
    "There's nothing left to fear",
  ],
  2: [
    "In the depths of the water",
    "Where the shadows lie",
    "Ophelia's fate",
    "Was written in the sky",
    "",
    "She danced with the current",
    "And sang with the tide",
    "In her final moments",
    "She had nothing to hide",
    "",
    "The fate of Ophelia",
    "Was sealed long ago",
    "But her story lives on",
    "In the songs that we know",
  ],
  3: [
    "I'm like espresso",
    "In the morning light",
    "Got me feeling right",
    "All through the night",
    "",
    "You're my caffeine",
    "My daily dose",
    "Without you here",
    "I'm feeling lost",
    "",
    "Espresso, espresso",
    "You're all I need",
    "Espresso, espresso",
    "You're my everything",
  ],
  4: [
    "I see beautiful things",
    "When I look at you",
    "The way you move",
    "The things you do",
    "",
    "You light up my world",
    "Like the morning sun",
    "And I know you're the one",
    "My only one",
    "",
    "Beautiful things",
    "All around me",
    "Beautiful things",
    "That's what I see",
  ],
  5: [
    "I'm losing control",
    "When you're around",
    "My heart starts to race",
    "At the slightest sound",
    "",
    "You got me feeling",
    "Like I'm floating high",
    "And I don't want to",
    "Come back down",
    "",
    "Loose controls",
    "That's what you do",
    "Loose controls",
    "I'm falling for you",
  ],
  6: [
    "Good luck, babe",
    "You're gonna need it",
    "When you realize",
    "What you've been missing",
    "",
    "I gave you my heart",
    "And you threw it away",
    "But I'm moving on",
    "Starting a new day",
    "",
    "Good luck, babe",
    "Hope you find what you're looking for",
    "Good luck, babe",
    "I won't be waiting anymore",
  ],
}

const playlist = [
  {
    id: 1,
    title: "Die With a Smile",
    artist: "Lady Gaga & Bruno Mars",
    duration: "3:38",
    cover: `${BASE_URL}diewithasmile.jpeg`,
    // TODO: place your audio file in /spotify-visualiser/public/audio and update this path
    src: `${BASE_URL}audio/die-with-a-smile.mp3`,
    hasLyrics: true,
  },
  {
    id: 2,
    title: "The Fate of Ophelia",
    artist: "Fall Out Boy",
    duration: "3:45",
    cover: `${BASE_URL}fateofophelia.jpg`,
    src: `${BASE_URL}audio/the-fate-of-ophelia.mp3`,
    hasLyrics: true,
  },
  {
    id: 3,
    title: "Espresso",
    artist: "Sabrina Carpenter",
    duration: "2:55",
    cover: `${BASE_URL}espresso.jpeg`,
    src: `${BASE_URL}audio/espresso.mp3`,
    hasLyrics: true,
  },
  {
    id: 4,
    title: "Beautiful Things",
    artist: "Benson Boone",
    duration: "3:18",
    cover: `${BASE_URL}beautifulthings.jpg`,
    src: `${BASE_URL}audio/beautiful-things.mp3`,
    hasLyrics: true,
  },
  {
    id: 5,
    title: "Loose Controls",
    artist: "Teddy Swims",
    duration: "2:42",
    cover: `${BASE_URL}loosecontrols.jpg`,
    src: `${BASE_URL}audio/loose-controls.mp3`,
    hasLyrics: true,
  },
  {
    id: 6,
    title: "Good Luck Babe",
    artist: "Chappell Roan",
    duration: "3:25",
    cover: `${BASE_URL}goodluckbabe.jpeg`,
    src: `${BASE_URL}audio/good-luck-babe.mp3`,
    hasLyrics: true,
  },
]

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(25)
  const [isDragging, setIsDragging] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [queue, setQueue] = useState<typeof playlist>([])
  const [volume, setVolume] = useState(75)
  const [isMuted, setIsMuted] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [showLyrics, setShowLyrics] = useState(false)
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const lyricsRef = useRef<HTMLDivElement>(null)

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return "0:00"
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const currentTime = formatTime(currentTimeSeconds)
  const remainingTime = durationSeconds
    ? `-${formatTime(Math.max(durationSeconds - currentTimeSeconds, 0))}`
    : "-0:00"
  const currentTrack = useMemo(() => playlist[currentTrackIndex], [currentTrackIndex])
  
  // Get lyrics for current track - memoized for performance
  const currentLyrics = useMemo(() => {
    if (!currentTrack.hasLyrics) return null
    return lyricsData[currentTrack.id] || null
  }, [currentTrack])

  // Filter playlist based on search query - memoized for performance
  const filteredPlaylist = useMemo(() => {
    if (!searchQuery.trim()) return playlist
    const query = searchQuery.toLowerCase()
    return playlist.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // ----- Local audio playback -----

  // Create audio element once
  useEffect(() => {
    const audio = new Audio()
    audioRef.current = audio
    audio.volume = volume / 100

    const handleTimeUpdate = () => {
      if (!audio.duration) return
      setCurrentTimeSeconds(audio.currentTime)
      setDurationSeconds(audio.duration)
      setProgress((audio.currentTime / audio.duration) * 100)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)

    return () => {
      audio.pause()
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audioRef.current = null
    }
  }, [])

  // Update track source when track index changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const src = (playlist[currentTrackIndex] as any).src as string | undefined
    if (!src) return
    audio.src = src
    audio.load()
    setCurrentTimeSeconds(0)
    setProgress(0)
    if (isPlaying) {
      audio
        .play()
        .then(() => setError(null))
        .catch((err) => {
          console.error("Audio play failed", err)
          setError("Audio playback failed")
        })
    }
  }, [currentTrackIndex, isPlaying])

  // Sync volume to audio element
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = (isMuted ? 0 : volume) / 100
  }, [volume, isMuted])

  // ----- Progress handling -----

  const updateProgressFromRef = useCallback((ref: React.RefObject<HTMLDivElement | null>, clientX: number) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = (x / rect.width) * 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage))
    setProgress(clampedPercentage)
  }, [])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    updateProgressFromRef(progressRef, e.clientX)
  }, [updateProgressFromRef])

  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    updateProgressFromRef(progressRef, e.clientX)
  }, [updateProgressFromRef])

  const handleProgressMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    updateProgressFromRef(progressRef, e.clientX)
  }, [isDragging, updateProgressFromRef])

  const handleProgressMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      setIsDragging(false)
      const audio = audioRef.current
      const rect = progressRef.current?.getBoundingClientRect()
      if (audio && rect && audio.duration) {
        const ratio = (e.clientX - rect.left) / rect.width
        const clamped = Math.max(0, Math.min(1, ratio))
        audio.currentTime = clamped * audio.duration
        setProgress(clamped * 100)
      }
    },
    [isDragging]
  )

  const handleProgressTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    updateProgressFromRef(progressRef, touch.clientX)
  }, [isDragging, updateProgressFromRef])

  const handleProgressTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Global mouse/touch handlers for smooth dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleProgressMouseMove, { passive: false })
      document.addEventListener('mouseup', handleProgressMouseUp, { passive: false })
      document.addEventListener('touchmove', handleProgressTouchMove, { passive: false })
      document.addEventListener('touchend', handleProgressTouchEnd, { passive: false })
      return () => {
        document.removeEventListener('mousemove', handleProgressMouseMove)
        document.removeEventListener('mouseup', handleProgressMouseUp)
        document.removeEventListener('touchmove', handleProgressTouchMove)
        document.removeEventListener('touchend', handleProgressTouchEnd)
      }
    }
  }, [isDragging, handleProgressMouseMove, handleProgressMouseUp, handleProgressTouchMove, handleProgressTouchEnd])


  // Error handling functions
  const handleImageError = (songId: number, fallbackSrc: string = `${BASE_URL}placeholder.svg`) => {
    setImageErrors((prev) => new Set(prev).add(songId))
    setError(`Failed to load image for track ${songId}`)
    // Clear error after 3 seconds
    setTimeout(() => setError(null), 3000)
  }

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          setError(null)
        })
        .catch((err) => {
          console.error("Audio play failed", err)
          setError("Unable to play audio")
        })
    }
  }, [isPlaying])

  const handlePreviousTrack = useCallback(() => {
    try {
      setCurrentTrackIndex((prev) => (prev === 0 ? playlist.length - 1 : prev - 1))
      setProgress(0)
      setError(null)
      setIsPlaying(true)
    } catch (err) {
      setError("Failed to load previous track")
      setTimeout(() => setError(null), 3000)
    }
  }, [])

  const handleNextTrack = useCallback(() => {
    try {
      // Move to next track, looping at the end
      setCurrentTrackIndex((prev) => (prev + 1) % playlist.length)
      setProgress(0)
      setError(null)
      setIsPlaying(true)
    } catch (err) {
      setError("Failed to load next track")
      setTimeout(() => setError(null), 3000)
    }
  }, [])

  const addToQueue = useCallback((song: typeof playlist[0]) => {
    try {
      setQueue((prev) => [...prev, song])
      setError(null)
    } catch (err) {
      setError("Failed to add track to queue")
      setTimeout(() => setError(null), 3000)
    }
  }, [])

  const removeFromQueue = useCallback((index: number) => {
    try {
      setQueue((prev) => prev.filter((_, i) => i !== index))
      setError(null)
    } catch (err) {
      setError("Failed to remove track from queue")
      setTimeout(() => setError(null), 3000)
    }
  }, [])

  const [isVolumeDragging, setIsVolumeDragging] = useState(false)

  const handleVolumeChange = useCallback((newVolume: number) => {
    try {
      const clampedVolume = Math.max(0, Math.min(100, newVolume))
      setVolume(clampedVolume)
      setIsMuted(clampedVolume === 0)
      setError(null)
    } catch (err) {
      setError("Failed to change volume")
      setTimeout(() => setError(null), 3000)
    }
  }, [])

  const handleVolumeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleVolumeChange(Number(e.target.value))
  }, [handleVolumeChange])

  const handleVolumeMouseDown = useCallback(() => {
    setIsVolumeDragging(true)
  }, [])

  const handleVolumeMouseUp = useCallback(() => {
    setIsVolumeDragging(false)
  }, [])

  const toggleMute = useCallback(() => {
    try {
      setIsMuted((prev) => !prev)
      setError(null)
    } catch (err) {
      setError("Failed to toggle mute")
      setTimeout(() => setError(null), 3000)
    }
  }, [])

  const toggleLyrics = useCallback(() => {
    try {
      setShowLyrics((prev) => !prev)
      setError(null)
    } catch (err) {
      setError("Failed to toggle lyrics")
      setTimeout(() => setError(null), 3000)
    }
  }, [])

  // Close lyrics when track changes (optional - remove if you want lyrics to persist)
  useEffect(() => {
    setShowLyrics(false)
  }, [currentTrackIndex])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in an input/textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.code) {
        case "Space":
          e.preventDefault()
          handlePlayPause()
          break
        case "ArrowLeft":
          e.preventDefault()
          if (e.shiftKey) {
            // Shift + Left = seek backward 5%
            setProgress((prev) => Math.max(0, prev - 5))
          } else {
            handlePreviousTrack()
          }
          break
        case "ArrowRight":
          e.preventDefault()
          if (e.shiftKey) {
            // Shift + Right = seek forward 5%
            setProgress((prev) => Math.min(100, prev + 5))
          } else {
            handleNextTrack()
          }
          break
        case "ArrowUp":
          e.preventDefault()
          setVolume((prev) => Math.min(100, prev + 5))
          setIsMuted(false)
          break
        case "ArrowDown":
          e.preventDefault()
          setVolume((prev) => Math.max(0, prev - 5))
          break
        case "KeyM":
          e.preventDefault()
          setIsMuted((prev) => !prev)
          break
        case "KeyR":
          e.preventDefault()
          // Repeat toggle (placeholder for future implementation)
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [handlePlayPause, handlePreviousTrack, handleNextTrack])

  // Close shortcuts menu when clicking outside
  useEffect(() => {
    if (!showShortcuts) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (modalRef.current && !modalRef.current.contains(target)) {
        setShowShortcuts(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showShortcuts])

  // Prevent scroll events from propagating to the canvas
  useEffect(() => {
    let wheelTimeout: number | null = null
    let touchTimeout: number | null = null

    const handleWheel = (e: WheelEvent) => {
      // Only prevent if scrolling inside the music player
      const target = e.target as HTMLElement
      if (modalRef.current && modalRef.current.contains(target)) {
        // Throttle stopPropagation calls
        if (wheelTimeout) return
        wheelTimeout = requestAnimationFrame(() => {
          e.stopPropagation()
          wheelTimeout = null
        })
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      if (modalRef.current && modalRef.current.contains(target)) {
        // Throttle stopPropagation calls
        if (touchTimeout) return
        touchTimeout = requestAnimationFrame(() => {
          e.stopPropagation()
          touchTimeout = null
        })
      }
    }

    // Add event listeners with capture phase to catch events early
    document.addEventListener('wheel', handleWheel, { passive: false, capture: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true })

    return () => {
      if (wheelTimeout) cancelAnimationFrame(wheelTimeout)
      if (touchTimeout) cancelAnimationFrame(touchTimeout)
      document.removeEventListener('wheel', handleWheel, { capture: true })
      document.removeEventListener('touchmove', handleTouchMove, { capture: true })
    }
  }, [])

  return (
    <>
      {/* SVG Filter for Glass Distortion */}
      <svg style={{ display: "none" }}>
        <filter id="glass-distortion">
          <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
        </filter>
      </svg>

      <motion.div
        ref={modalRef}
        className="glass-card relative w-full max-w-5xl h-[650px] rounded-3xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          duration: 0.6,
        }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {/* Glass Filter Layer */}
        <div className="glass-filter" />

        {/* Glass Distortion Overlay */}
        <div className="glass-distortion-overlay" />

        {/* Glass Overlay */}
        <div className="glass-overlay" />

        {/* Content */}
        <div className="glass-content relative z-[4] p-8 h-full flex flex-col">
          {/* Error Toast */}
          {error && (
            <motion.div
              className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm z-50 border border-red-400/50 shadow-lg"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            </motion.div>
          )}
          
          {/* Mnmnts Logo */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <img 
                src={`${BASE_URL}favicon-logo.png`}
                alt="Mnmnts Logo" 
                className="w-8 h-8"
                onError={(e) => {
                  e.currentTarget.src = `${BASE_URL}placeholder.svg`
                }}
              />
              <span className="text-2xl font-bold text-[#e0e0e0] font-sans">Mnmnts</span>
            </div>
            {/* Keyboard Shortcuts Help */}
            <div className="relative">
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="text-[#e0e0e0]/60 hover:text-[#e0e0e0] transition-colors"
                aria-label="Keyboard shortcuts"
                title="Keyboard shortcuts"
              >
                <Keyboard className="w-5 h-5" />
              </button>
              {showShortcuts && (
                <motion.div
                  className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-md text-[#e0e0e0] text-xs p-3 rounded-lg border border-white/10 shadow-xl z-50 min-w-[200px]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="font-semibold mb-2 text-white">Keyboard Shortcuts</div>
                  <div className="space-y-1">
                    <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded">Space</kbd> Play/Pause</div>
                    <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded">←</kbd> Previous</div>
                    <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded">→</kbd> Next</div>
                    <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded">Shift</kbd> + <kbd className="bg-white/10 px-1.5 py-0.5 rounded">←</kbd> Seek -5%</div>
                    <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded">Shift</kbd> + <kbd className="bg-white/10 px-1.5 py-0.5 rounded">→</kbd> Seek +5%</div>
                    <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded">↑</kbd> Volume +5%</div>
                    <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded">↓</kbd> Volume -5%</div>
                    <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded">M</kbd> Mute</div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-8 flex-1 overflow-hidden">
            {/* Left Side - Album Art and Controls */}
            <div className="flex flex-col justify-between w-[320px]">
              {/* Album Art */}
              <motion.div
                className="bg-black/60 rounded-2xl p-3 backdrop-blur-md w-[290px] mx-auto border border-white/5"
                initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 12,
                  delay: 0.2,
                }}
              >
                <motion.img
                  src={currentTrack.cover || `${BASE_URL}music-1.jpg`}
                  alt={`${currentTrack.title} - ${currentTrack.artist}`}
                  className="w-full aspect-square object-cover rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = `${BASE_URL}placeholder.svg`
                    handleImageError(currentTrack.id)
                  }}
                />
              </motion.div>

              {/* Player Controls */}
              <motion.div
                className="bg-black/40 backdrop-blur-md rounded-2xl p-4 mt-4 border border-white/5"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.3,
                }}
              >
                {/* Song Info */}
                <div className="text-[#e0e0e0] mb-3">
                  <h3 className="font-semibold text-sm">{currentTrack.title} - {currentTrack.artist}</h3>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#e0e0e0] text-xs font-medium select-none">{currentTime}</span>
                  <div
                    ref={progressRef}
                    className="flex-1 h-1.5 bg-white/20 rounded-full cursor-pointer relative group touch-none select-none"
                    onClick={handleProgressClick}
                    onMouseDown={handleProgressMouseDown}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      const touch = e.touches[0]
                      setIsDragging(true)
                      updateProgressFromRef(progressRef, touch.clientX)
                    }}
                  >
                    <motion.div 
                      className="h-full bg-white rounded-full"
                      style={{ width: `${progress}%` }}
                      transition={{ 
                        duration: isDragging ? 0 : 0.1,
                        ease: "easeOut"
                      }}
                    />
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                      style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
                      animate={{ 
                        opacity: isDragging ? 1 : 0,
                        scale: isDragging ? 1.2 : 1
                      }}
                      transition={{ duration: 0.15 }}
                    />
                  </div>
                  <span className="text-[#e0e0e0] text-xs font-medium select-none">{remainingTime}</span>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2 mb-4">
                  <motion.button
                    onClick={toggleMute}
                    className="text-[#e0e0e0] touch-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </motion.button>
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full cursor-pointer relative group touch-none">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${isMuted ? 0 : volume}%` }}
                      transition={{ 
                        duration: isVolumeDragging ? 0 : 0.15,
                        ease: "easeOut"
                      }}
                    />
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-md"
                      style={{ left: `${isMuted ? 0 : volume}%`, transform: "translate(-50%, -50%)" }}
                      animate={{ 
                        opacity: isVolumeDragging ? 1 : 0,
                        scale: isVolumeDragging ? 1.3 : 1
                      }}
                      transition={{ duration: 0.15 }}
                    />
                    <input
                      type="range"
                      id="volume-control"
                      name="volume"
                      min="0"
                      max="100"
                      step="1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeInput}
                      onMouseDown={handleVolumeMouseDown}
                      onMouseUp={handleVolumeMouseUp}
                      onTouchStart={handleVolumeMouseDown}
                      onTouchEnd={handleVolumeMouseUp}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Volume control"
                    />
                  </div>
                  <span className="text-[#e0e0e0] text-xs font-medium w-8 text-right select-none">
                    {isMuted ? "0" : volume}%
                  </span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <motion.button
                    className="text-[#e0e0e0]"
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Star className="w-5 h-5" />
                  </motion.button>
                  {currentTrack.hasLyrics && (
                    <motion.button
                      onClick={toggleLyrics}
                      className={`text-[#e0e0e0] ${showLyrics ? "text-white" : ""}`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      aria-label={showLyrics ? "Hide lyrics" : "Show lyrics"}
                      title={showLyrics ? "Hide lyrics" : "Show lyrics"}
                    >
                      <FileText className="w-5 h-5" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={handlePreviousTrack}
                    className="text-[#e0e0e0]"
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    aria-label="Previous track"
                  >
                    <SkipBack className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={handlePlayPause}
                    className="bg-white text-black rounded-full p-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    <motion.div animate={{ rotate: isPlaying ? 360 : 0 }} transition={{ duration: 0.3 }}>
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </motion.div>
                  </motion.button>
                  <motion.button
                    onClick={handleNextTrack}
                    className="text-[#e0e0e0]"
                    whileHover={{ scale: 1.1, x: 2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    aria-label="Next track"
                  >
                    <SkipForward className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    className="text-[#e0e0e0]"
                    whileHover={{ scale: 1.1, rotate: -15 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Repeat className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Playlist or Lyrics */}
            <motion.div
              className="flex-1 overflow-hidden flex flex-col"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.4,
              }}
            >
              {/* Lyrics Display */}
              {showLyrics && currentLyrics && (
                <motion.div
                  ref={lyricsRef}
                  className="flex-1 overflow-y-auto pr-2 mb-4 bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-white/5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[#e0e0e0] font-semibold text-lg">
                      Lyrics
                    </h3>
                    <motion.button
                      onClick={toggleLyrics}
                      className="text-[#e0e0e0]/60 hover:text-[#e0e0e0] transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Close lyrics"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    {currentLyrics.map((line, index) => (
                      <motion.p
                        key={index}
                        className={`text-[#e0e0e0] ${
                          line.trim() === "" ? "h-4" : "leading-relaxed"
                        } ${line.trim() === "" ? "" : "text-sm"}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: index * 0.05,
                          duration: 0.3,
                        }}
                      >
                        {line || "\u00A0"}
                      </motion.p>
                    ))}
                  </div>
                  {currentLyrics.length === 0 && (
                    <div className="text-center py-8 text-[#e0e0e0]/60 text-sm">
                      No lyrics available for this track
                    </div>
                  )}
                </motion.div>
              )}

              {/* Playlist (hidden when lyrics are shown) */}
              {!showLyrics && (
                <>
                  {/* Search Bar */}
                  <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e0e0e0]/60" />
                <input
                  type="text"
                  id="search-input"
                  name="search"
                  placeholder="Search tracks or artists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-md border border-white/5 rounded-xl pl-10 pr-4 py-2 text-[#e0e0e0] text-sm placeholder:text-[#e0e0e0]/40 focus:outline-none focus:border-white/20 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e0e0e0]/60 hover:text-[#e0e0e0] transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                  </div>

                  {/* Queue Toggle */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#e0e0e0] text-sm font-medium">
                      {searchQuery ? `Search Results (${filteredPlaylist.length})` : `Playlist (${playlist.length})`}
                    </span>
                    <button
                      onClick={() => setShowQueue(!showQueue)}
                      className="text-[#e0e0e0]/60 hover:text-[#e0e0e0] text-xs transition-colors flex items-center gap-1"
                      title={`Queue (${queue.length})`}
                    >
                      Queue {queue.length > 0 && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{queue.length}</span>}
                    </button>
                  </div>

                  {/* Queue Display */}
                  {showQueue && queue.length > 0 && (
                    <motion.div
                      className="mb-4 p-3 bg-black/30 backdrop-blur-sm rounded-xl border border-white/5"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="text-[#e0e0e0] text-xs font-semibold mb-2">Up Next ({queue.length})</div>
                      <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                        {queue.map((song, idx) => (
                          <div
                            key={`queue-${song.id}-${idx}`}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                          >
                            <span className="text-[#e0e0e0]/40 text-[10px] w-4">{idx + 1}</span>
                            <span className="text-[#e0e0e0] text-xs flex-1 truncate">{song.title}</span>
                            <button
                              onClick={() => removeFromQueue(idx)}
                              className="opacity-0 group-hover:opacity-100 text-[#e0e0e0]/60 hover:text-red-400 transition-all"
                              aria-label="Remove from queue"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div
                    className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    <div className="space-y-2">
                  {filteredPlaylist.length === 0 ? (
                    <div className="text-center py-8 text-[#e0e0e0]/60 text-sm">
                      No tracks found matching "{searchQuery}"
                    </div>
                  ) : (
                    filteredPlaylist.map((song, index) => {
                      const originalIndex = playlist.findIndex((s) => s.id === song.id)
                      return (
                    <motion.div
                      key={song.id}
                      className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group border ${
                        currentTrackIndex === originalIndex ? "border-white/20 bg-white/5" : "border-transparent"
                      } hover:border-white/5`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                        delay: 0.5 + index * 0.1,
                      }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        try {
                          setCurrentTrackIndex(originalIndex)
                          setIsPlaying(false)
                          setProgress(0)
                          setError(null)
                        } catch (err) {
                          setError("Failed to load track")
                          setTimeout(() => setError(null), 3000)
                        }
                      }}
                    >
                      <motion.img
                        src={imageErrors.has(song.id) ? `${BASE_URL}placeholder.svg` : (song.cover || `${BASE_URL}placeholder.svg`)}
                        alt={song.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        loading="lazy"
                        decoding="async"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        onError={(e) => {
                          e.currentTarget.src = `${BASE_URL}placeholder.svg`
                          handleImageError(song.id)
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[#e0e0e0] font-medium text-sm truncate">{song.title}</h4>
                        <p className="text-[#e0e0e0]/70 text-xs truncate">{song.artist}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation()
                            addToQueue(song)
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[#e0e0e0]/60 hover:text-[#e0e0e0] transition-all"
                          aria-label="Add to queue"
                          title="Add to queue"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                        <span className="text-[#e0e0e0]/70 text-sm font-medium">{song.duration}</span>
                      </div>
                    </motion.div>
                      )
                    })
                  )}
                </div>
              </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
