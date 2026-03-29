import React, { useEffect, useRef, memo } from 'react'
import './LoaderSimple.css'

// Ultra-simple loader for mobile devices - PURE CSS animations
const LoaderSimple = memo(({ onComplete } = {}) => {
  const containerRef = useRef(null)

  useEffect(() => {
    // Total animation time: 3 seconds (reduced from 4)
    const timer = setTimeout(() => {
      // Trigger landing page animation
      window.dispatchEvent(new Event('startLanding'))
      
      if (typeof onComplete === 'function') {
        onComplete()
      } else {
        window.dispatchEvent(new Event('loaderComplete'))
      }
    }, 3000) // Reduced from 4000 to 3000

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div ref={containerRef} className="loader-simple-container">
      <div className="loader-simple-stage">
        {/* Single animated element - ultra simple */}
        <div className="loader-simple-card">
          <div className="loader-simple-content">
            <div className="loader-simple-text">Welcome</div>
          </div>
        </div>
        
        {/* Expanding overlay */}
        <div className="loader-simple-overlay"></div>
      </div>
    </div>
  )
})

export default LoaderSimple
