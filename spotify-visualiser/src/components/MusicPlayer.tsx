import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react"
import { Play, Pause, SkipBack, SkipForward, Keyboard, Search, X, Music, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"
import SpotifyAuth from "./SpotifyAuth"
import { useSpotifyPlayer } from "../hooks/useSpotifyPlayer"
import { 
  getStoredToken, 
  getUserPlaylists, 
  getPlaylistTracks, 
  searchTracks, 
  getSavedTracks,
  getTopTracks,
  formatDuration,
  type SpotifyTrack 
} from "../services/spotify"

// Base URL for assets (handles subdirectory deployment)
const BASE_URL = import.meta.env.BASE_URL || "/spotify-visualiser/"

// Marquee text component that scrolls on hover when truncated
const MarqueeText = memo(({ text, className = "" }: { text: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const checkTruncation = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const textWidth = textRef.current.scrollWidth
        const truncated = textWidth > containerWidth
        setIsTruncated(truncated)
        if (truncated && containerRef.current) {
          // Calculate scroll distance: move text left by (textWidth - containerWidth)
          const scrollDistance = textWidth - containerWidth
          containerRef.current.style.setProperty('--scroll-distance', `-${scrollDistance}px`)
        }
      }
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(checkTruncation, 0)
    window.addEventListener('resize', checkTruncation)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', checkTruncation)
    }
  }, [text])

  return (
    <div ref={containerRef} className={`text-marquee-container ${className}`}>
      <div className="text-marquee">
        <span 
          ref={textRef}
          className={`text-marquee-wrapper ${isTruncated ? 'can-scroll' : ''}`}
        >
          {text}
        </span>
      </div>
    </div>
  )
})

MarqueeText.displayName = 'MarqueeText'

type SpotifyPlaylistTrack = {
  id: string
  title: string
  artist: string
  duration: string
  cover: string
  uri: string
  spotifyUrl: string
  explicit: boolean
  hasLyrics: boolean
}

const emptySpotifyTrack: SpotifyPlaylistTrack = {
  id: "spotify-empty",
  title: "Connect Spotify",
  artist: "Stream music through Spotify",
  duration: "0:00",
  cover: `${BASE_URL}placeholder.svg`,
  uri: "",
  spotifyUrl: "https://open.spotify.com/",
  explicit: false,
  hasLyrics: false,
}

export default function MusicPlayer() {
  // Spotify integration
  const spotifyClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
  const [spotifyPlaylist, setSpotifyPlaylist] = useState<SpotifyPlaylistTrack[]>([])
  const [spotifyTrackIndex, setSpotifyTrackIndex] = useState(0)
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false)
  
  const spotifyPlayer = useSpotifyPlayer()
  const isSpotifyAuthenticated = !!getStoredToken()
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(25)
  const [error, setError] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return "0:00"
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const currentTrack = useMemo(() => {
    return spotifyPlaylist[spotifyTrackIndex] || emptySpotifyTrack
  }, [spotifyPlaylist, spotifyTrackIndex])

  const hasSpotifyTracks = spotifyPlaylist.length > 0
  const spotifyTrackUrl = currentTrack.spotifyUrl

  // Sync Spotify player state
  useEffect(() => {
    if (spotifyPlayer.playbackState) {
      const state = spotifyPlayer.playbackState
      setIsPlaying(!state.paused)
      setCurrentTimeSeconds(state.position / 1000)
      setDurationSeconds(state.duration / 1000)
      setProgress((state.position / state.duration) * 100)
    }
  }, [spotifyPlayer.playbackState])

  // Load Spotify playlists when authenticated
  useEffect(() => {
    if (isSpotifyAuthenticated && spotifyPlaylist.length === 0 && !isLoadingSpotify) {
      loadSpotifyTracks()
    }
  }, [isSpotifyAuthenticated])

  const loadSpotifyTracks = async () => {
    setIsLoadingSpotify(true)
    try {
      const tracks = await getTopTracks('medium_term', 20)
      const formattedTracks = tracks.map((track: SpotifyTrack) => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        duration: formatDuration(track.duration_ms),
        cover: track.album.images[0]?.url || `${BASE_URL}placeholder.svg`,
        uri: track.uri,
        spotifyUrl: track.external_urls?.spotify || `https://open.spotify.com/track/${track.id}`,
        explicit: Boolean(track.explicit),
        hasLyrics: false,
      }))
      setSpotifyPlaylist(formattedTracks)
    } catch (err: any) {
      setError(`Failed to load Spotify tracks: ${err.message}`)
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoadingSpotify(false)
    }
  }

  const currentTime = formatTime(currentTimeSeconds)
  const remainingTime = durationSeconds
    ? `-${formatTime(Math.max(durationSeconds - currentTimeSeconds, 0))}`
    : "-0:00"
  
  // Filter playlist based on search query - memoized for performance
  const filteredPlaylist = useMemo(() => {
    const activePlaylist = spotifyPlaylist
    if (!searchQuery.trim()) return activePlaylist
    const query = searchQuery.toLowerCase()
    return activePlaylist.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
    )
  }, [searchQuery, spotifyPlaylist])

  const handlePlayPause = useCallback(async () => {
    if (!spotifyPlayer.isReady) {
      setError("Connect Spotify to start playback")
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      if (spotifyPlayer.isPlaying) {
        await spotifyPlayer.pause()
      } else {
        if (spotifyPlayer.currentTrack) {
          await spotifyPlayer.resume()
        } else if (currentTrack.uri) {
          await spotifyPlayer.play(currentTrack.uri)
        } else {
          setError("Choose a Spotify track to play")
          setTimeout(() => setError(null), 3000)
        }
      }
    } catch (err: any) {
      setError(`Spotify playback error: ${err.message}`)
      setTimeout(() => setError(null), 3000)
    }
  }, [spotifyPlayer, currentTrack])

  const handlePreviousTrack = useCallback(async () => {
    if (spotifyPlayer.isReady) {
      try {
        await spotifyPlayer.previousTrack()
      } catch (err: any) {
        setError(`Failed to play previous track: ${err.message}`)
        setTimeout(() => setError(null), 3000)
      }
      return
    }

    setError("Connect Spotify to use playback controls")
    setTimeout(() => setError(null), 3000)
  }, [spotifyPlayer])

  const handleNextTrack = useCallback(async () => {
    if (spotifyPlayer.isReady) {
      try {
        await spotifyPlayer.nextTrack()
      } catch (err: any) {
        setError(`Failed to play next track: ${err.message}`)
        setTimeout(() => setError(null), 3000)
      }
      return
    }

    setError("Connect Spotify to use playback controls")
    setTimeout(() => setError(null), 3000)
  }, [spotifyPlayer])

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
          handlePreviousTrack()
          break
        case "ArrowRight":
          e.preventDefault()
          handleNextTrack()
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
        className="glass-card relative w-full max-w-5xl h-auto md:h-[550px] rounded-3xl overflow-hidden shadow-2xl"
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
        <div className="glass-content relative z-[4] p-5 h-full flex flex-col" style={{ pointerEvents: 'auto' }}>
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
          
          {/* Spotify Authentication */}
          {spotifyClientId ? (
            <div className="mb-4 flex items-center justify-between gap-3">
              <SpotifyAuth 
                clientId={spotifyClientId}
                onAuthSuccess={() => {
                  const hasToken = !!getStoredToken()
                  if (!hasToken) {
                    setSpotifyPlaylist([])
                    setSpotifyTrackIndex(0)
                  }
                }}
                onAuthError={(err) => setError(err)}
              />
              {isSpotifyAuthenticated && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-300">
                  <Music className="w-3 h-3" />
                  Streaming Mode
                </div>
              )}
            </div>
          ) : null}
          <p className="mb-3 text-[11px] leading-snug text-[#e0e0e0]/55">
            Playback uses Spotify Web Playback SDK and requires Spotify Premium.
          </p>
          
          {/* Mnmnts Logo */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img 
                src={`${BASE_URL}favicon-logo.png`}
                alt="Mnmnts Logo" 
                className="w-7 h-7"
                onError={(e) => {
                  e.currentTarget.src = `${BASE_URL}placeholder.svg`
                }}
              />
              <span className="text-xl font-bold text-[#e0e0e0] font-sans">Mnmnts</span>
            </div>
            <a
              href="https://open.spotify.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/80 px-3 py-1.5 text-xs font-medium text-[#e0e0e0]/85 transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Open Spotify"
            >
              <img
                src={`${BASE_URL}icons/spotify.png`}
                alt=""
                className="h-[21px] w-[21px]"
                aria-hidden="true"
              />
              <span>Content from Spotify</span>
            </a>
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
                    <div><kbd className="bg-white/10 px-1.5 py-0.5 rounded">M</kbd> Mute</div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex min-h-0 flex-col gap-2 md:flex-row md:gap-5 flex-1 overflow-hidden">
            {/* Left Side - Album Art and Controls */}
            <div className="flex flex-col justify-between w-full md:w-[280px] mb-2 md:mb-0">
              {/* Album Art */}
              <motion.div
                className="bg-black/60 rounded-2xl p-2.5 backdrop-blur-md w-full max-w-xs md:w-[260px] mx-auto border border-white/5"
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
                  className="w-full aspect-square rounded-lg bg-black object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = `${BASE_URL}placeholder.svg`
                  }}
                />
              </motion.div>

              {/* Player Controls */}
              <motion.div
                className="bg-black/40 backdrop-blur-md rounded-2xl p-3 mt-1.5 border border-white/5"
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
                <div className="text-[#e0e0e0] mb-2.5">
                  <h3 className="font-semibold text-xs leading-tight line-clamp-2">{currentTrack.title} - {currentTrack.artist}</h3>
                  {spotifyTrackUrl && (
                    <a
                      href={spotifyTrackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-green-300 hover:text-green-200"
                    >
                      Listen on Spotify
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#e0e0e0] text-xs font-medium select-none">{currentTime}</span>
                  <div
                    className="flex-1 h-1.5 bg-white/20 rounded-full relative touch-none select-none cursor-default"
                    aria-label="Spotify playback progress"
                  >
                    <motion.div 
                      className="h-full bg-white rounded-full"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.1, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-[#e0e0e0] text-xs font-medium select-none">{remainingTime}</span>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-center gap-8">
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
                </div>
              </motion.div>
            </div>

            {/* Right Side - Spotify Playlist */}
            <motion.div
              className="music-panel-column flex-1 min-h-0 overflow-hidden flex flex-col -mt-6 md:-mt-5"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.4,
              }}
            >
              <div className="music-list-panel flex h-[34vh] min-h-[220px] flex-col overflow-hidden rounded-2xl border border-white/5 bg-black/25 backdrop-blur-md md:h-auto md:min-h-0 md:flex-1">
                <div className="sticky top-0 z-10 border-b border-white/5 bg-black/35 backdrop-blur-md p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e0e0e0]/55" />
                    <input
                      type="text"
                      id="search-input"
                      name="search"
                      placeholder="Search Spotify tracks or artists..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-xl bg-black/35 border border-white/5 pl-10 pr-10 py-2 text-[#e0e0e0] text-sm placeholder:text-[#e0e0e0]/35 focus:outline-none focus:border-white/15 focus:bg-black/45 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center w-7 h-7 rounded-lg text-[#e0e0e0]/60 hover:text-[#e0e0e0] hover:bg-white/5 transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="text-[#e0e0e0] text-sm font-semibold tracking-tight">
                      {searchQuery ? `Results (${filteredPlaylist.length})` : `Playlist (${spotifyPlaylist.length})`}
                    </div>
                    <div className="text-[#e0e0e0]/55 text-xs truncate">
                      Your top tracks from Spotify
                    </div>
                  </div>
                </div>

                <div
                  className="music-list-scroll min-h-0 flex-1 overflow-y-auto p-3 pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <div className="space-y-1" aria-label="Spotify tracks">
                    {!isSpotifyAuthenticated ? (
                      <div className="text-center py-8 text-[#e0e0e0]/60 text-sm">
                        Connect Spotify to load and play your tracks.
                      </div>
                    ) : isLoadingSpotify ? (
                      <div className="text-center py-8 text-[#e0e0e0]/60 text-sm">
                        Loading Spotify tracks...
                      </div>
                    ) : filteredPlaylist.length === 0 ? (
                      <div className="text-center py-8 text-[#e0e0e0]/60 text-sm">
                        No tracks found matching "{searchQuery}"
                      </div>
                    ) : (
                      filteredPlaylist.map((song, index) => {
                        const originalIndex = spotifyPlaylist.findIndex((s) => s.id === song.id)
                        const isActive = spotifyTrackIndex === originalIndex
                        return (
                          <motion.div
                            key={song.id}
                            role="button"
                            tabIndex={0}
                            aria-current={isActive ? "true" : undefined}
                            aria-label={`${isActive ? "Current track" : "Play"} ${song.title} by ${song.artist}`}
                            className={`relative flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer group border ${
                              isActive
                                ? "border-white/15 bg-white/6"
                                : "border-transparent hover:border-white/5 hover:bg-white/4"
                            }`}
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault()
                                e.currentTarget.click()
                              }
                            }}
                            onClick={async () => {
                              if (!spotifyPlayer.isReady) {
                                setError("Connect Spotify to start playback")
                                setTimeout(() => setError(null), 3000)
                                return
                              }
                              try {
                                await spotifyPlayer.play(song.uri)
                                setSpotifyTrackIndex(originalIndex)
                                setIsPlaying(true)
                              } catch (err: any) {
                                setError(`Failed to play track: ${err.message}`)
                                setTimeout(() => setError(null), 3000)
                              }
                            }}
                          >
                            <div
                              className={`absolute left-1 top-1.5 bottom-1.5 w-[3px] rounded-full ${
                                isActive ? "bg-white/60" : "bg-transparent group-hover:bg-white/20"
                              }`}
                              aria-hidden="true"
                            />
                            <motion.img
                              src={song.cover || `${BASE_URL}placeholder.svg`}
                              alt={song.title}
                              className="w-10 h-10 rounded-lg bg-black flex-shrink-0 ring-1 ring-white/5 object-contain"
                              loading="lazy"
                              decoding="async"
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              onError={(e) => {
                                e.currentTarget.src = `${BASE_URL}placeholder.svg`
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="mb-0.5 flex min-w-0 items-center gap-1.5">
                                <MarqueeText
                                  text={song.title}
                                  className="text-[#e0e0e0] font-medium text-sm tracking-tight"
                                />
                                {song.explicit && (
                                  <span
                                    className="inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] bg-[#e0e0e0]/85 px-1 text-[10px] font-bold leading-none text-black"
                                    aria-label="Explicit"
                                    title="Explicit"
                                  >
                                    E
                                  </span>
                                )}
                              </div>
                              <MarqueeText
                                text={song.artist}
                                className="text-[#e0e0e0]/70 text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.a
                                href={song.spotifyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="opacity-0 group-hover:opacity-100 text-green-300 hover:text-green-200 transition-all rounded-lg p-1 hover:bg-white/5"
                                aria-label={`Listen to ${song.title} on Spotify`}
                                title="Listen on Spotify"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </motion.a>
                              <span className="text-[#e0e0e0]/65 text-sm font-medium tabular-nums">
                                {song.duration}
                              </span>
                            </div>
                          </motion.div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

      </motion.div>
    </>
  )
}
