/**
 * Image optimization utilities
 * Supports WebP format detection and lazy loading
 */

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image()
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2)
    }
    webP.src =
      "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA"
  })
}

/**
 * Get optimized image URL with WebP fallback
 * @param src - Original image source
 * @param useWebP - Whether to prefer WebP (default: true)
 * @returns Optimized image URL
 */
export async function getOptimizedImageUrl(
  src: string,
  useWebP: boolean = true
): Promise<string> {
  if (!useWebP) return src

  const webPSupported = await supportsWebP()
  if (!webPSupported) return src

  // If already WebP, return as is
  if (src.endsWith(".webp")) return src

  // Try to find WebP version
  const basePath = src.replace(/\.[^.]+$/, "")
  const webpPath = `${basePath}.webp`

  // Check if WebP exists (in production, this would be handled by build process)
  // For now, return original if WebP doesn't exist
  return webpPath
}

/**
 * Preload image for better performance
 * @param src - Image source URL
 * @returns Promise that resolves when image is loaded
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Lazy load image with Intersection Observer
 * @param imgElement - Image element to lazy load
 * @param src - Image source URL
 */
export function lazyLoadImage(
  imgElement: HTMLImageElement,
  src: string
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imgElement.src = src
          observer.unobserve(imgElement)
        }
      })
    },
    {
      rootMargin: "50px", // Start loading 50px before image enters viewport
    }
  )

  observer.observe(imgElement)

  // Return cleanup function
  return () => observer.disconnect()
}

/**
 * Convert image to WebP format (client-side, for dynamic images)
 * Note: This is a fallback. Ideally, images should be converted at build time.
 */
export async function convertToWebP(
  imageUrl: string,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Could not get canvas context"))
        return
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            resolve(url)
          } else {
            reject(new Error("Failed to convert to WebP"))
          }
        },
        "image/webp",
        quality
      )
    }
    img.onerror = reject
    img.src = imageUrl
  })
}
