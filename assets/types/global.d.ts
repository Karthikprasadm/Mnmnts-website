/**
 * Global TypeScript Definitions
 * Type definitions for global variables and APIs used throughout the main website
 */

// ============================================================================
// Global Utilities
// ============================================================================

/**
 * Logger utility for standardized logging
 * Available as window.Logger
 */
interface Logger {
  /**
   * Log info messages (only in development)
   */
  info(...args: any[]): void;

  /**
   * Log warnings (always shown, but formatted)
   */
  warn(...args: any[]): void;

  /**
   * Log errors (always shown, but formatted)
   */
  error(...args: any[]): void;

  /**
   * Log debug messages (only in development)
   */
  debug(...args: any[]): void;

  /**
   * Log success messages (only in development)
   */
  success(...args: any[]): void;
}

/**
 * Error handler utility for displaying user-friendly error messages
 * Available as window.errorHandler
 */
interface ErrorHandler {
  /**
   * Show an error message to the user
   * @param title - Error title
   * @param message - Error message
   * @param retryCallback - Optional callback for retry button
   */
  showError(title: string, message: string, retryCallback?: () => void): void;

  /**
   * Handle image loading errors
   * @param imageElement - The image element that failed to load
   * @param error - The error object
   */
  handleImageError(imageElement: HTMLImageElement | null, error: Error | Event): void;

  /**
   * Retry the last failed operation
   */
  retry(): void;
}

/**
 * Service Worker utilities for offline support and background sync
 * Available as window.serviceWorkerUtils
 */
interface ServiceWorkerUtils {
  /**
   * Initialize the service worker
   * @returns Promise that resolves when service worker is registered
   */
  init(): Promise<void>;

  /**
   * Register background sync for form submissions
   * @param formData - Form data to sync
   * @param url - Endpoint URL to sync to
   * @returns Promise that resolves when sync is registered
   */
  registerBackgroundSync(formData: FormData, url: string): Promise<void>;

  /**
   * Check if service worker is supported
   * @returns true if service worker is supported
   */
  isSupported(): boolean;

  /**
   * Check if service worker is active
   * @returns true if service worker is active
   */
  isActive(): boolean;

  /**
   * Add online/offline event listener
   * @param callback - Callback function for online/offline events
   */
  onConnectionChange(callback: (isOnline: boolean) => void): void;
}

// ============================================================================
// Gallery Data Types
// ============================================================================

/**
 * Gallery image data structure
 */
interface GalleryImage {
  /** Unique identifier for the image */
  id: number;
  /** Full-size image URL (ImageKit CDN) */
  image: string;
  /** Thumbnail image URL (ImageKit CDN) */
  thumbnail: string;
  /** Alt text for accessibility */
  alt: string;
}

/**
 * Gallery video data structure
 */
interface GalleryVideo {
  /** Unique identifier for the video */
  id: number;
  /** Video source URL */
  video: string;
  /** Video thumbnail URL */
  thumbnail: string;
  /** Alt text for accessibility */
  alt: string;
}

/**
 * Gallery data structure from gallery-data.json
 */
interface GalleryData {
  /** Array of gallery images */
  images: GalleryImage[];
  /** Default image to show if loading fails */
  defaultImage: GalleryImage;
}

/**
 * Videos data structure from videos-data.json
 */
interface VideosData {
  /** Array of gallery videos */
  videos: GalleryVideo[];
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * ImageKit signature API response
 */
interface ImageKitSignatureResponse {
  /** ImageKit signature token */
  signature: string;
  /** ImageKit expiration timestamp */
  expire: number;
  /** ImageKit token */
  token: string;
}

/**
 * Standard API response wrapper
 */
interface APIResponse<T = any> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message if request failed */
  error?: string;
}

// ============================================================================
// Window Extensions
// ============================================================================

interface Window {
  /** Logger utility */
  Logger?: Logger;
  /** Error handler utility */
  errorHandler?: ErrorHandler;
  /** Service worker utilities */
  serviceWorkerUtils?: ServiceWorkerUtils;
}

// ============================================================================
// Global Error Handler Types
// ============================================================================

/**
 * Global error event handler
 */
type GlobalErrorHandler = (
  message: string,
  source: string | null,
  lineno: number | null,
  colno: number | null,
  error: Error | null
) => boolean | void;

/**
 * Unhandled promise rejection handler
 */
type UnhandledRejectionHandler = (event: PromiseRejectionEvent) => void;

// ============================================================================
// Service Worker Types
// ============================================================================

/**
 * Service Worker registration
 */
interface ServiceWorkerRegistration {
  /** Sync manager for background sync */
  sync?: SyncManager;
}

/**
 * Sync manager for background sync API
 */
interface SyncManager {
  /**
   * Register a sync tag
   * @param tag - Unique tag for the sync operation
   * @returns Promise that resolves when sync is registered
   */
  register(tag: string): Promise<void>;
  /**
   * Get all registered sync tags
   * @returns Promise that resolves with array of tags
   */
  getTags(): Promise<string[]>;
}

// ============================================================================
// Export for module systems
// ============================================================================

export {};
export type {
  Logger,
  ErrorHandler,
  ServiceWorkerUtils,
  GalleryImage,
  GalleryVideo,
  GalleryData,
  VideosData,
  ImageKitSignatureResponse,
  APIResponse,
  GlobalErrorHandler,
  UnhandledRejectionHandler,
  ServiceWorkerRegistration,
  SyncManager,
};
