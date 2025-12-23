import { createRoot, Root } from "react-dom/client"
import { lazy, Suspense } from "react"

// Lazy load MusicPlayer for code splitting
const MusicPlayer = lazy(() => import("./components/MusicPlayer"))

// Prevent double mounting - store root reference globally
let rootInstance: Root | null = null

// Loading fallback component
const LoadingFallback = () => (
  <div className="music-player-overlay flex items-center justify-center">
    <div className="glass-card p-8 rounded-2xl">
      <div className="animate-pulse text-white/60">Loading player...</div>
    </div>
  </div>
)

const container = document.getElementById("music-player-overlay")
if (container) {
  // If already mounted, unmount first
  if (rootInstance) {
    (rootInstance as Root).unmount()
    rootInstance = null
  }
  
  // Clear container to ensure clean mount
  container.innerHTML = ''
  
  // Prevent scroll events from propagating to canvas
  const handleWheel = (e: WheelEvent) => {
    e.stopPropagation()
  }
  
  const handleTouchMove = (e: TouchEvent) => {
    e.stopPropagation()
  }

  container.addEventListener('wheel', handleWheel, { passive: false, capture: true })
  container.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true })

  rootInstance = createRoot(container)
  rootInstance.render(
    <Suspense fallback={<LoadingFallback />}>
      <MusicPlayer />
    </Suspense>
  )
}
