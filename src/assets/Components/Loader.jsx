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
  
  // Determine performance tier
  if (hasReducedMotion) return 'minimal';
  if (isMobile && (cores <= 4 || memory <= 2)) return 'low';
  if (isMobile && cores <= 6) return 'medium';
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
    
    // Adaptive settings based on device performance
    const perfSettings = {
      minimal: {
        useBlur: false,
        duration: 0.5,
        stagger: 0.2,
        scale: 1,
        rotation: 0,
        ease: 'power2.out',
        finalScale: 20
      },
      low: {
        useBlur: false,
        duration: 0.6,
        stagger: 0.25,
        scale: isMobile ? 0.95 : 0.9,
        rotation: 10,
        ease: 'power2.out',
        finalScale: isMobile ? 30 : 40
      },
      medium: {
        useBlur: false,
        duration: 0.8,
        stagger: 0.3,
        scale: isMobile ? 0.9 : 0.85,
        rotation: 15,
        ease: 'back.out(1.4)',
        finalScale: isMobile ? 35 : 50
      },
      high: {
        useBlur: true,
        duration: 1,
        stagger: 0.4,
        scale: 0.8,
        rotation: 25,
        ease: 'back.out(1.7)',
        finalScale: isMobile ? 40 : 60
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
      force3D: true,
      willChange: 'transform'
    })
    
    gsap.set(imgRefs.current, { 
      yPercent: 0, 
      autoAlpha: 0, 
      scale: settings.scale, 
      rotation: 0, 
      force3D: true, 
      transformOrigin: '50% 50%',
      filter: settings.useBlur ? 'blur(20px)' : 'none',
      willChange: 'transform, opacity'
    })
    
    gsap.set(whiteRef.current, { 
      yPercent: 0, 
      scale: settings.scale, 
      transformOrigin: '50% 50%', 
      autoAlpha: 0, 
      rotation: 0, 
      force3D: true,
      filter: settings.useBlur ? 'blur(20px)' : 'none',
      willChange: 'transform, opacity'
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
      
      // Use optimized timeline settings
      tl = gsap.timeline({ 
        force3D: true,
        onStart: () => {
          // Remove will-change after animation starts to free resources
          gsap.delayedCall(0.5, () => {
            if (containerRef.current) {
              containerRef.current.style.willChange = 'auto';
            }
          });
        }
      })

      // Simplified, optimized animation sequence
      // Images pop in with adaptive complexity
      tl.to(imgRefs.current, {
        autoAlpha: 1,
        scale: 1,
        filter: settings.useBlur ? 'blur(0px)' : 'none',
        rotation: (i) => {
          // Reduce rotation on low-end devices
          if (settings.rotation === 0) return 0;
          return gsap.utils.random(-settings.rotation, settings.rotation);
        },
        duration: settings.duration,
        stagger: settings.stagger,
        ease: settings.ease,
        overwrite: 'auto'
      }, 0.2)

      // Overlay pops into center
      tl.to(whiteRef.current, {
        autoAlpha: 1,
        scale: 1,
        filter: settings.useBlur ? 'blur(0px)' : 'none',
        rotation: () => {
          if (settings.rotation === 0) return 0;
          return gsap.utils.random(-settings.rotation * 0.8, settings.rotation * 0.8);
        },
        duration: settings.duration * 0.75,
        ease: settings.ease,
        overwrite: 'auto'
      }, settings.duration + settings.stagger * 2 + 0.2)

      // Small scale-up (skip on minimal performance)
      if (perf !== 'minimal') {
        tl.to(whiteRef.current, {
          scale: 1.05,
          rotation: () => {
            if (settings.rotation === 0) return 0;
            return gsap.utils.random(-settings.rotation * 1.5, settings.rotation * 1.5);
          },
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto'
        }, settings.duration * 2 + settings.stagger * 2 + 0.2)
      }

      // Final expansion with optimized timing
      const expandStart = perf === 'minimal' 
        ? settings.duration * 1.5 + settings.stagger * 2 + 0.3
        : settings.duration * 2.5 + settings.stagger * 2 + 0.2;
      
      tl.to(whiteRef.current, {
        scale: settings.finalScale,
        duration: perf === 'minimal' ? 0.6 : 0.8,
        ease: 'power3.inOut',
        overwrite: 'auto'
      }, expandStart)

      // Slide loader up off screen
      const isPlayground = (typeof window !== 'undefined' && window.location && window.location.pathname === '/playground')

      if (isPlayground) {
        const callbackTime = expandStart + (perf === 'minimal' ? 0.6 : 0.8);
        tl.call(() => {
          window.dispatchEvent(new Event('startLanding'))
          if (typeof onComplete === 'function') onComplete()
          else window.dispatchEvent(new Event('loaderComplete'))
        }, null, callbackTime)
      } else {
        const exitStart = expandStart + (perf === 'minimal' ? 0.5 : 0.7);
        tl.to(containerRef.current, {
          yPercent: -120,
          duration: perf === 'minimal' ? 0.5 : 0.7,
          ease: 'power3.inOut',
          overwrite: 'auto',
          onStart: () => {
            // Clear will-change before exit animation
            if (whiteRef.current) whiteRef.current.style.willChange = 'auto';
            imgRefs.current.forEach(ref => {
              if (ref) ref.style.willChange = 'auto';
            });
            
            // Start landing animation
            if (isMobile) {
              setTimeout(() => window.dispatchEvent(new Event('startLanding')), 50);
            } else {
              window.dispatchEvent(new Event('startLanding'));
            }
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
      ? '0 4px 8px rgba(0,0,0,0.15)' 
      : (isMobileDevice ? '0 6px 15px rgba(0,0,0,0.2)' : '0 12px 30px rgba(0,0,0,0.25)'),
    position: 'relative',
    objectFit: 'cover',
    border: isMobileDevice ? '8px solid white' : '12px solid white',
    boxSizing: 'border-box',
    background: '#f0f0f0',
    imageRendering: 'auto',
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    WebkitTransformStyle: 'preserve-3d',
    // Optimize image rendering
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale'
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
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    contain: 'layout style paint'
  }

  // Initial state optimized for performance
  const settings = {
    minimal: { scale: 1, blur: 'none' },
    low: { scale: isMobileDevice ? 0.95 : 0.9, blur: 'none' },
    medium: { scale: isMobileDevice ? 0.9 : 0.85, blur: 'none' },
    high: { scale: 0.8, blur: 'blur(20px)' }
  }[perf] || { scale: 0.95, blur: 'none' };
  
  const cardInitial = {
    opacity: 0,
    filter: settings.blur,
    transform: `scale(${settings.scale})`,
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
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d',
    WebkitTransformStyle: 'preserve-3d',
    contain: 'layout style paint'
  }

  const whiteInitial = {
    opacity: 0,
    filter: settings.blur,
    transform: `scale(${settings.scale})`,
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
