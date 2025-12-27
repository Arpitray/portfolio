import React, { useEffect, useRef, memo } from 'react'
import gsap from 'gsap'

// Optimize GSAP globally for this component
gsap.config({ force3D: true });

const Loader = memo(({ onComplete } = {}) => {
  const containerRef = useRef(null)
  const imgRefs = useRef([])
  const whiteRef = useRef(null)

  useEffect(() => {
    // Ensure GSAP works properly even if ScrollTrigger config affects it
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    // Image URLs (match what's used in JSX)
    const imageUrls = [
      "https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/imag1_qig1hl.jpg",
      "https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/load2_z4atye.jpg",
      "https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/load3_oqxway.jpg"
    ];

    // set initial positions and stacking
    gsap.set(containerRef.current, { yPercent: 0, force3D: true })
    gsap.set(imgRefs.current, { 
      yPercent: 0, 
      autoAlpha: 0, 
      scale: 0.8, 
      rotation: 0, 
      force3D: true, 
      transformOrigin: 'center center',
      filter: 'blur(20px)'
    })
    gsap.set(whiteRef.current, { 
      yPercent: 0, 
      scale: 0.8, 
      transformOrigin: 'center center', 
      autoAlpha: 0, 
      rotation: 0, 
      force3D: true,
      filter: 'blur(20px)'
    })

    let tl = null;
    let preloadAborted = false;

    // Preload and decode images before starting animation
    const preloadImages = async () => {
      try {
        const imagePromises = imageUrls.map(src => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Handle CORS for Cloudinary
            
            img.onload = async () => {
              try {
                // Use decode() API for async decoding (prevents main thread blocking)
                if (img.decode) {
                  await img.decode();
                }
                resolve(img);
              } catch (decodeError) {
                // Decode failed but image loaded, still resolve
                resolve(img);
              }
            };
            
            img.onerror = () => {
              // Image failed to load, but don't block animation
              console.warn(`Failed to load: ${src}`);
              resolve(null);
            };
            
            img.src = src;
            
            // If image is already cached, resolve immediately
            if (img.complete) {
              if (img.decode) {
                img.decode().then(() => resolve(img)).catch(() => resolve(img));
              } else {
                resolve(img);
              }
            }
          });
        });

        await Promise.all(imagePromises);
        
        // Only start timeline if not aborted
        if (!preloadAborted) {
          // Use requestAnimationFrame to ensure browser is ready for animation
          requestAnimationFrame(() => {
            setTimeout(() => {
              if (!preloadAborted) startTimeline();
            }, 50);
          });
        }
      } catch (error) {
        console.warn('Image preload error:', error);
        // Start anyway after brief delay
        if (!preloadAborted) {
          setTimeout(() => startTimeline(), 100);
        }
      }
    };

    const startTimeline = () => {
      if (tl) return
      tl = gsap.timeline({ force3D: true })

      // Creative "Fan-Out" reveal: cards pop from center with focus effect
      tl.to(imgRefs.current, {
        autoAlpha: 1,
        scale: 1,
        filter: 'blur(0px)',
        rotation: (i) => gsap.utils.random(-25, 25),
        duration: 1,
        stagger: 0.4,
        ease: 'back.out(1.7)' // Adds a nice organic "pop"
      }, 0.2)

      // overlay pops into center
      tl.to(whiteRef.current, {
        autoAlpha: 1,
        scale: 1,
        filter: 'blur(0px)',
        rotation: () => gsap.utils.random(-20, 20),
        duration: 0.8,
        ease: 'back.out(1.7)'
      }, 1.8)

      // small tilt + little grow before full surround
      tl.to(whiteRef.current, {
        scale: 1.1,
        rotation: () => gsap.utils.random(-45, 45),
        duration: 0.5,
        ease: 'power2.out'
      }, 2.8)

      // finally expand overlay to cover the whole screen
      tl.to(whiteRef.current, {
        scale: 60,
        duration: 0.9,
        ease: 'power4.inOut'
      }, 3.1)

      // slide loader up off screen after surround completes
      const isPlayground = (typeof window !== 'undefined' && window.location && window.location.pathname === '/playground')

      if (isPlayground) {
        tl.call(() => {
          window.dispatchEvent(new Event('startLanding'))
          if (typeof onComplete === 'function') onComplete()
          else window.dispatchEvent(new Event('loaderComplete'))
        }, null, 4.0)
      } else {
        tl.to(containerRef.current, {
          yPercent: -120,
          duration: 0.8,
          ease: 'power4.inOut',
          onStart: () => {
            // Start landing animation as soon as loader begins sliding up for a smoother rhythm
            window.dispatchEvent(new Event('startLanding'))
          },
          onComplete: () => {
            if (typeof onComplete === 'function') onComplete()
            else window.dispatchEvent(new Event('loaderComplete'))
          }
        }, 4.0)
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
    width: 'auto',
    height: 'auto',
    paddingTop: 'env(safe-area-inset-top, 0px)',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    background: '#212427',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    overflow: 'hidden',
    border: 'none', // Remove any dark borders from the container
    willChange: 'transform',
    backfaceVisibility: 'hidden'
  }

  const stageStyle = {
    position: 'relative',
  width: 360,
  height: 340, // ensure stage is tall enough for the images to animate into center
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const imgStyle = {
    width: '100%',
    height: 'calc(100% - 52px)', // fill the card up to the caption area
    borderRadius: 0,
    boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
    position: 'relative',
    objectFit: 'cover',
    border: '12px solid white',
    boxSizing: 'border-box',
    background: '#f0f0f0', // Light placeholder to prevent flash
    imageRendering: '-webkit-optimize-contrast', // Optimize rendering
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d'
  }

  const cardStyle = {
    width: 280,
    height: 340,
    position: 'absolute',
    inset: 0, // absolute center both axes
    margin: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden'
  }

  // initial inline state matches the GSAP set() so the browser paints elements
  // in the hidden/translated state before JS executes, preventing a flash.
  const cardInitial = {
  // let GSAP control translate (yPercent); only set opacity to avoid permanent hidden state
  opacity: 0,
  filter: 'blur(20px)',
  transform: 'scale(0.8)'
  }

  const overlayTextStyle = {
    position: 'absolute',
    color: '#000',
    textAlign: 'center',
    pointerEvents: 'none',
    fontWeight: 700,
    left: 0,
    right: 0,
  bottom: 0, // Align text to the bottom of the image
  height: '52px', // fixed caption height to match image calc
  padding: '8px 0', // Add padding to center the text within the white area
  background: '#fff', // Ensure text background matches the white padding
    fontFamily: 'trial',
  }

  const whiteOverlayStyle = {
    width: 280,
    height: 340,
    borderRadius: 0,
    backgroundColor: '#E1E1E1',
    zIndex: 40,
    backgroundPosition: '0 0, 0 0',
    backgroundRepeat: 'repeat, repeat',
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    transformStyle: 'preserve-3d'
  }

  // ensure overlay also doesn't flash before GSAP's timeline runs
  const whiteInitial = {
  // GSAP will set yPercent and autoAlpha; keep initial opacity 0 so element is hidden until animation
  opacity: 0,
  filter: 'blur(20px)',
  transform: 'scale(0.8)'
  }

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={stageStyle}>
  <div ref={el => imgRefs.current[0] = el} style={{ ...cardStyle, ...cardInitial, zIndex: 10 }}>
    <img 
      className="loader-img" 
      src="https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/imag1_qig1hl.jpg" 
      alt="i1" 
      style={imgStyle}
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
    <div className='text-3xl text-black' style={overlayTextStyle}><div>Designing</div></div>
  </div>

  <div ref={el => imgRefs.current[1] = el} style={{ ...cardStyle, ...cardInitial, zIndex: 20 }}>
    <img 
      className="loader-img" 
      src="https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/load2_z4atye.jpg" 
      alt="i2" 
      style={imgStyle}
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
    <div className='text-3xl text-black' style={overlayTextStyle}><div>And</div></div>
  </div>

  <div ref={el => imgRefs.current[2] = el} style={{ ...cardStyle, ...cardInitial, zIndex: 30 }}>
    <img 
      className="loader-img" 
      src="https://res.cloudinary.com/dsjjdnife/image/upload/q_auto,f_auto,w_800/v1755711983/load3_oqxway.jpg" 
      alt="i3" 
      style={imgStyle}
      loading="eager"
      decoding="async"
      fetchpriority="high"
    />
    <div className='text-3xl text-black' style={overlayTextStyle}><div>developing</div></div>
  </div>

  {/* overlay that rises and then expands to cover (starts same size as images) */}
  <div
    className='flex font-["demo"] justify-center loader-overlay pt-8 text-4xl'
    ref={whiteRef}
    style={{ ...whiteOverlayStyle, ...whiteInitial, position: 'absolute', inset: 0, margin: 'auto', display: 'flex', alignItems: 'start', justifyContent: 'center' }}
  >Welcome</div>
      </div>
    </div>
  )
})

export default Loader
