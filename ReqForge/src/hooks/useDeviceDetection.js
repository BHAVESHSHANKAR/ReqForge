import { useState, useEffect } from 'react'

export const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const screenWidth = window.innerWidth
      
      // Check for mobile devices
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      const isMobileDevice = mobileRegex.test(userAgent)
      
      // Check screen size
      const isSmallScreen = screenWidth < 768 // Less than tablet size
      const isTabletScreen = screenWidth >= 768 && screenWidth < 1024 // Tablet size
      const isDesktopScreen = screenWidth >= 1024 // Desktop size
      
      // Determine device type
      const mobile = isMobileDevice || isSmallScreen
      const tablet = !mobile && (isTabletScreen || /ipad/i.test(userAgent))
      const desktop = !mobile && !tablet && isDesktopScreen
      
      setIsMobile(mobile)
      setIsTablet(tablet)
      setIsDesktop(desktop)
    }

    // Check on mount
    checkDevice()

    // Check on resize
    window.addEventListener('resize', checkDevice)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop,
    // Helper function to check if device should be restricted
    shouldRestrictAccess: () => isMobile || isTablet
  }
}