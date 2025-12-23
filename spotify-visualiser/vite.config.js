// vite.config.js
import glsl from "vite-plugin-glsl"
import { defineConfig } from "vite"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  // Base path for GitHub Pages deployment
  base: "/spotify-visualiser/",
  plugins: [
    react(), 
    glsl(), 
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2,otf}"],
        // Exclude chrome-extension and other unsupported schemes from navigation fallback
        navigateFallbackDenylist: [/chrome-extension:/, /moz-extension:/, /safari-extension:/],
        runtimeCaching: [
          {
            urlPattern: /\/api\/spotify\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "spotify-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
          {
            urlPattern: ({ url }) => {
              // Only cache HTTP/HTTPS image URLs, exclude chrome-extension and other schemes
              const isImage = /\.(?:png|jpg|jpeg|svg|webp|gif)(?:\?.*)?$/i.test(url.pathname)
              const isHttp = url.protocol === 'http:' || url.protocol === 'https:'
              return isImage && isHttp
            },
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      manifest: {
        name: "Spotify Visualiser | mnmnts",
        short_name: "mnmnts",
        description: "Interactive Spotify visualizer with music player",
        theme_color: "#0a0a0a",
        background_color: "#0a0a0a",
        display: "standalone",
        start_url: "/spotify-visualiser/",
        icons: [
          {
            src: "/spotify-visualiser/favicon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "/spotify-visualiser/spt-1-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  build: {
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate vendor chunks for better caching
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor"
            }
            if (id.includes("three")) {
              return "three-vendor"
            }
            if (id.includes("framer-motion") || id.includes("lucide-react")) {
              return "ui-vendor"
            }
            if (id.includes("normalize-wheel") || id.includes("lil-gui")) {
              return "utils-vendor"
            }
            // Other node_modules
            return "vendor"
          }
          // Split by feature for better code splitting
          if (id.includes("components/MusicPlayer")) {
            return "music-player"
          }
          if (id.includes("planes") || id.includes("canvas")) {
            return "visualizer"
          }
        },
        // Better naming for chunks
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Chunk size optimization
    chunkSizeWarningLimit: 1000,
    // Source maps for production (optional, set to false for smaller bundles)
    sourcemap: false,
  },
  server: {
    host: true,
    proxy: {
      // Proxy to your backend API (adjust port if needed)
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
