import "./style.css"

// Lazy load Canvas for code splitting
let canvasInstance: any = null
let animationFrameId: number | null = null
let isRunning = true

async function initCanvas() {
  // Only load canvas when needed (after initial page load)
  const { default: Canvas } = await import("./canvas")
  canvasInstance = new Canvas()
  render()
  }

function render() {
  if (!isRunning || !canvasInstance) return
  
  canvasInstance.render()
  animationFrameId = requestAnimationFrame(render)
}

// Initialize canvas after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // Small delay to prioritize initial render
    requestAnimationFrame(() => {
      initCanvas()
    })
  })
} else {
  requestAnimationFrame(() => {
    initCanvas()
  })
}

// Cleanup function
function stop() {
  isRunning = false
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
}

// Export for potential cleanup
export default { stop }
