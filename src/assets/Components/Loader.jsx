import React, { useEffect, useRef, memo } from 'react'
import gsap from 'gsap'

// Optimize GSAP globally for this component
gsap.config({ 
  force3D: true,
  nullTargetWarn: false
});

// Detect device capabilities for adaptive performance
const getDevicePerformance = () => {
  if (typeof window === 'undefined') return 'high';
  
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 2;
  
  // Memory check (if available)
  const memory = navigator.deviceMemory || 4;
  
  // Check if it's a touch device (more likely to be low-power)
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Determine performance tier - VERY CONSERVATIVE for mobile
  if (hasReducedMotion) return 'minimal';
  
  // Be aggressive: assume most mobile devices are low-end
  if (isMobile) {
    // Only use 'high' tier if device has excellent specs
    if (cores >= 8 && memory >= 6) return 'high';
    // Medium tier only for good devices
    if (cores >= 6 && memory >= 4) return 'medium';
    // Default mobile to LOW for maximum smoothness
    return 'low';
  }
  
  // Desktop devices
  if (cores <= 4 || memory <= 4) return 'medium';
  return 'high';
};

const Loader = memo(({ onComplete } = {}) => {
  const containerRef = useRef(null)
  const imgRefs = useRef([])
  const whiteRef = useRef(null)
  const isMobileDevice = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const performanceTier = useRef(getDevicePerformance());

  useEffect(() => {
    const isMobile = isMobileDevice;
    const perf = performanceTier.current;
    
    // Mobile-optimized settings - SLOWER and SIMPLER for smoothness
    const perfSettings = {
      minimal: {
        useBlur: false,
        duration: 0.8,
        stagger: 0.3,
        scale: 1,
        rotation: 0,
        ease: 'power1.out',
        finalScale: 25,
        skipMiddleStep: true
      },
      low: {
        useBlur: false,
        duration: 1.2,  // MUCH slower for smoothness
        stagger: 0.5,   // More time between cards
        scale: 1,       // No initial scale - simpler
        rotation: 0,    // NO rotation on low-end - causes lag
        ease: 'power1.out', // Simpler easing
        finalScale: isMobile ? 35 : 40,
        skipMiddleStep: true
      },
      medium: {
        useBlur: false,
        duration: 1.0,
        stagger: 0.4,
        scale: 0.95,    // Minimal scale
        rotation: 8,    // Very slight rotation
        ease: 'power2.out',
        finalScale: isMobile ? 40 : 50,
        skipMiddleStep: false
      },
      high: {
        useBlur: !isMobile, // NO blur on mobile even in high tier
        duration: isMobile ? 1.0 : 1.2,
        stagger: isMobile ? 0.4 : 0.5,
        scale: isMobile ? 0.95 : 0.85,
        rotation: isMobile ? 0 : 20,  // NO rotation on mobile
        ease: isMobile ? 'power2.out' : 'back.out(1.5)',
        finalScale: isMobile ? 40 : 60,
        skipMiddleStep: isMobile
      }
    };
    
    const settings = perfSettings[perf] || perfSettings.low;
    
    // Image URLs (match what's used in JSX)
    const imageUrls = [
      "https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/imag1_qig1hl.jpg",
      "https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/load2_z4atye.jpg",
      "https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/load3_oqxway.jpg"
    ];

    // set initial positions with optimized properties
    gsap.set(containerRef.current, { 
      yPercent: 0, 
      force3D: true
    })
    
    // Simpler initial state - no transforms to avoid repaint
    gsap.set(imgRefs.current, { 
      autoAlpha: 0,
      scale: settings.scale,
      rotation: 0,
      force3D: true,
      transformOrigin: '50% 50%'
    })
    
    gsap.set(whiteRef.current, { 
      autoAlpha: 0,
      scale: settings.scale,
      rotation: 0,
      force3D: true,
      transformOrigin: '50% 50%'
    })

    let tl = null;
    let preloadAborted = false;

    // Optimized preload for faster startup
    const preloadImages = async () => {
      try {
        // On low-end devices, don't wait for all images - start animating immediately
        if (perf === 'low' || perf === 'minimal') {
          requestAnimationFrame(() => {
            setTimeout(() => {
              if (!preloadAborted) startTimeline();
            }, 100);
          });
          return;
        }
        
        // For better devices, still preload but with timeout
        const imagePromises = imageUrls.map(src => {
          return Promise.race([
            new Promise((resolve) => {
              const img = new Image();
              img.crossOrigin = "anonymous";
              
              img.onload = async () => {
                try {
                  if (img.decode) await img.decode();
                  resolve(img);
                } catch {
                  resolve(img);
                }
              };
              
              img.onerror = () => resolve(null);
              img.src = src;
              
              if (img.complete) {
                if (img.decode) {
                  img.decode().then(() => resolve(img)).catch(() => resolve(img));
                } else {
                  resolve(img);
                }
              }
            }),
            // Timeout after 500ms on medium/high devices
            new Promise(resolve => setTimeout(() => resolve(null), 500))
          ]);
        });

        await Promise.all(imagePromises);
        
        if (!preloadAborted) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              if (!preloadAborted) startTimeline();
            }, 50);
          });
        }
      } catch (error) {
        if (!preloadAborted) {
          setTimeout(() => startTimeline(), 100);
        }
      }
    };

    const startTimeline = () => {
      if (tl) return
      
      // Ultra-optimized timeline for mobile
      tl = gsap.timeline({ 
        force3D: true,
        paused: false
      })

      // Simple fade + scale animation (NO rotation on mobile to prevent lag)
      tl.to(imgRefs.current, {
        autoAlpha: 1,
        scale: 1,
        rotation: settings.rotation === 0 ? 0 : (i) => gsap.utils.random(-settings.rotation, settings.rotation),
        duration: settings.duration,
        stagger: settings.stagger,
        ease: settings.ease,
        overwrite: 'auto',
        force3D: true
      }, 0.3) // Start slightly later for smoother feel

      // Calculate timing based on actual animation time
      const overlayStart = 0.3 + (settings.duration * 0.7) + (settings.stagger * 2);

      // Overlay appears (simplified)
      tl.to(whiteRef.current, {
        autoAlpha: 1,
        scale: 1,
        rotation: 0, // NO rotation for overlay on mobile
        duration: settings.duration * 0.8,
        ease: settings.ease,
        overwrite: 'auto',
        force3D: true
      }, overlayStart)

      // Skip middle step on mobile for smoother performance
      let expandStart = overlayStart + (settings.duration * 0.8);
      
      if (!settings.skipMiddleStep && !isMobile) {
        // Only do middle step on desktop
        tl.to(whiteRef.current, {
          scale: 1.05,
          duration: 0.4,
          ease: 'power1.out',
          overwrite: 'auto',
          force3D: true
        }, expandStart)
        expandStart += 0.4;
      } else {
        // Add pause on mobile for better pacing
        expandStart += 0.5;
      }

      // Final expansion - use CSS transform for maximum performance
      tl.to(whiteRef.current, {
        scale: settings.finalScale,
        duration: isMobile ? 1.0 : 0.9, // Slower expansion on mobile
        ease: 'power2.inOut', // Simpler easing
        overwrite: 'auto',
        force3D: true
      }, expandStart)

      // Exit animation
      const isPlayground = (typeof window !== 'undefined' && window.location && window.location.pathname === '/playground')

      if (isPlayground) {
        const callbackTime = expandStart + (isMobile ? 1.0 : 0.9) - 0.2;
        tl.call(() => {
          window.dispatchEvent(new Event('startLanding'))
          if (typeof onComplete === 'function') onComplete()
          else window.dispatchEvent(new Event('loaderComplete'))
        }, null, callbackTime)
      } else {
        const exitStart = expandStart + (isMobile ? 0.8 : 0.7);
        tl.to(containerRef.current, {
          yPercent: -120,
          duration: 0.8,
          ease: 'power2.inOut',
          overwrite: 'auto',
          force3D: true,
          onStart: () => {
            // Start landing animation
            const delay = isMobile ? 100 : 0;
            setTimeout(() => window.dispatchEvent(new Event('startLanding')), delay);
          },
          onComplete: () => {
            if (typeof onComplete === 'function') onComplete()
            else window.dispatchEvent(new Event('loaderComplete'))
          }
        }, exitStart)
      }
    }

    // Start preloading immediately
    preloadImages();

    return () => {
      preloadAborted = true;
      if (tl) tl.kill();
    }
  }, [onComplete])

  const containerStyle = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    paddingTop: 'env(safe-area-inset-top, 0px)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    background: '#212427',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    overflow: 'hidden',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    perspective: 1000,
    WebkitPerspective: 1000
  }

  const stageStyle = {
    position: 'relative',
    width: isMobileDevice ? '90vw' : 360,
    height: isMobileDevice ? '50vh' : 340,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden'
  }

  const perf = performanceTier.current;
  const useSimpleShadow = perf === 'low' || perf === 'minimal';

  const imgStyle = {
    width: '100%',
    height: 'calc(100% - 52px)',
    borderRadius: 0,
    boxShadow: useSimpleShadow 
      ? '0 2px 4px rgba(0,0,0,0.1)' // Minimal shadow for low-end
      : (isMobileDevice ? '0 4px 8px rgba(0,0,0,0.15)' : '0 8px 16px rgba(0,0,0,0.2)'),
    position: 'relative',
    objectFit: 'cover',
    border: isMobileDevice ? '6px solid white' : '10px solid white', // Thinner border = less repaints
    boxSizing: 'border-box',
    background: '#f0f0f0',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden'
  }

  const cardStyle = {
    width: isMobileDevice ? '75vw' : 280,
    height: isMobileDevice ? '45vh' : 340,
    position: 'absolute',
    inset: 0,
    margin: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden'
  }

  // Initial state optimized for performance - NO FILTERS
  const cardInitial = {
    opacity: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden'
  }

  const overlayTextStyle = {
    position: 'absolute',
    color: '#000',
    textAlign: 'center',
    pointerEvents: 'none',
    fontWeight: 700,
    left: 0,
    right: 0,
    bottom: 0,
    height: '52px',
    padding: '8px 0',
    background: '#fff',
    fontFamily: 'secondary',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden'
  }

  const whiteOverlayStyle = {
    width: isMobileDevice ? '75vw' : 280,
    height: isMobileDevice ? '45vh' : 340,
    borderRadius: 0,
    backgroundColor: '#E1E1E1',
    zIndex: 40,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden'
  }

  const whiteInitial = {
    opacity: 0,
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden'
  }

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={stageStyle}>
        <div ref={el => imgRefs.current[0] = el} style={{ ...cardStyle, ...cardInitial, zIndex: 10 }}>
          <img 
            className="loader-img" 
            src="https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/imag1_qig1hl.jpg" 
            alt="Designing" 
            style={imgStyle}
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
          <div className='text-3xl text-black' style={overlayTextStyle}>Designing</div>
        </div>

        <div ref={el => imgRefs.current[1] = el} style={{ ...cardStyle, ...cardInitial, zIndex: 20 }}>
          <img 
            className="loader-img" 
            src="https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/load2_z4atye.jpg" 
            alt="And" 
            style={imgStyle}
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
          <div className='text-3xl text-black' style={overlayTextStyle}>And</div>
        </div>

        <div ref={el => imgRefs.current[2] = el} style={{ ...cardStyle, ...cardInitial, zIndex: 30 }}>
          <img 
            className="loader-img" 
            src="https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/load3_oqxway.jpg" 
            alt="Developing" 
            style={imgStyle}
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
          <div className='text-3xl text-black' style={overlayTextStyle}>Developing</div>
        </div>

        {/* Overlay that expands to cover screen */}
        <div
          className='flex font-["primary"] justify-center loader-overlay'
          ref={whiteRef}
          style={{ 
            ...whiteOverlayStyle, 
            ...whiteInitial, 
            position: 'absolute', 
            inset: 0, 
            margin: 'auto', 
            display: 'flex', 
            alignItems: 'start',
            paddingTop: '2rem',
            justifyContent: 'center',
            fontSize: isMobileDevice ? '2rem' : '2.25rem',
            fontWeight: 700
          }}
        >Welcome</div>
      </div>
    </div>
  )
})

export default Loader
