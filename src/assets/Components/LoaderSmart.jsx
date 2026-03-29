import React, { useMemo } from 'react'
import LoaderSimple from './LoaderSimple'
import Loader from './Loader'

// Smart loader that chooses the right implementation
const LoaderSmart = ({ onComplete }) => {
  const shouldUseSimple = useMemo(() => {
    if (typeof window === 'undefined') return false;
    
    // Check if mobile
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    // Check device capabilities
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 4;
    
    // Use simple loader on mobile OR low-end desktop
    if (isMobile) return true; // ALL mobile devices use simple loader
    if (cores <= 4 || memory <= 4) return true; // Low-end desktop
    
    return false; // High-end desktop can use fancy loader
  }, []);

  // Return the appropriate loader
  if (shouldUseSimple) {
    return <LoaderSimple onComplete={onComplete} />
  }
  
  return <Loader onComplete={onComplete} />
}

export default LoaderSmart
