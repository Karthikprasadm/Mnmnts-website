import Lenis from 'lenis';
import { gsap } from "gsap";

let lenisInstance = null;
let tickerCallback = null;

// Initializes smooth scrolling with Lenis.
// Function to set up smooth scrolling.
export const initSmoothScrolling = () => {
  // Clean up existing instance if any
  cleanupSmoothScrolling();
  
  // Initialize Lenis for smooth scroll effects. Lerp value controls the smoothness.
  lenisInstance = new Lenis({ lerp: 0.15 });
  
  // Create ticker callback function
  tickerCallback = (time) => {
    if (lenisInstance) {
      lenisInstance.raf(time * 1000); // Convert GSAP's time to milliseconds for Lenis.
    }
  };
  
  // Ensure GSAP animations are in sync with Lenis' scroll frame updates.
  gsap.ticker.add(tickerCallback);

  // Turn off GSAP's default lag smoothing to avoid conflicts with Lenis.
  gsap.ticker.lagSmoothing(0);
  
  return lenisInstance;
};

// Cleanup function to remove listeners and destroy Lenis instance
export const cleanupSmoothScrolling = () => {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }
  
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
};
