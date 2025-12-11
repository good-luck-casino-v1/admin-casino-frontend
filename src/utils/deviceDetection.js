/**
 * Device Detection Utility
 * Detects mobile devices (phones and tablets) and applies a class to the document
 * This ensures mobile optimizations only apply to actual mobile devices, not desktop browsers
 */

export const isMobileDevice = () => {
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // Regular expressions for mobile device detection
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  
  // Check if user agent matches mobile pattern
  const isMobileUA = mobileRegex.test(userAgent.toLowerCase());
  
  // Check screen size and touch capability
  const isSmallScreen = window.innerWidth <= 768;
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  
  // Device is considered mobile if:
  // 1. User agent indicates mobile device, OR
  // 2. Screen is small AND has touch capability AND coarse pointer (finger touch)
  return isMobileUA || (isSmallScreen && hasTouchScreen && hasCoarsePointer && noHover);
};

export const initializeDeviceDetection = () => {
  if (isMobileDevice()) {
    document.documentElement.classList.add('mobile-device');
    document.body.classList.add('mobile-device');
  } else {
    document.documentElement.classList.remove('mobile-device');
    document.body.classList.remove('mobile-device');
  }
};

// Listen for window resize to update on orientation changes
export const setupDeviceDetectionListener = () => {
  initializeDeviceDetection();
  
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      initializeDeviceDetection();
    }, 250);
  });
};

