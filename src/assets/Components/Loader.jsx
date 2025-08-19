import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import img1 from './image1.png'
import img2 from './image3.png'
import img3 from './image4.png'
import Image1 from './imag1.jpg'
import Image2 from './load2.jpg'
import Image3 from './load3.jpg'

const Loader = ({ onComplete } = {}) => {
  const containerRef = useRef(null)
  const imgRefs = useRef([])
  const whiteRef = useRef(null)

  useEffect(() => {
    // preload critical images used in the loader so the browser has them before paint
    const imgs = [Image1, Image2, Image3].map(src => {
      const i = new Image()
      i.src = src
      return i
    })

    // set initial positions and stacking
    gsap.set(containerRef.current, { yPercent: 0 })
    gsap.set(imgRefs.current, { yPercent: 160, autoAlpha: 0, scale: 0.94, rotation: 0 })
    gsap.set(whiteRef.current, { yPercent: 160, scale: 1, transformOrigin: 'center center', autoAlpha: 0, rotation: 0 })

    let tl = null
    const startTimeline = () => {
      if (tl) return
      tl = gsap.timeline()

      // images rise slowly and overlap (stacked) with a wider stagger
      tl.to(imgRefs.current, {
        yPercent: 0,
        autoAlpha: 1,
        scale: 1,
        rotation: (i) => gsap.utils.random(-30, 30),
        duration: 1.2, // Reduced duration for smoother animation
        stagger: 0.5, // Adjusted stagger for better flow
        ease: 'power3.out'
      }, 0.3) // Start slightly earlier

      // overlay rises into center at full image size
      tl.to(whiteRef.current, {
        yPercent: 0,
        autoAlpha: 1,
        rotation: () => gsap.utils.random(-30, 30),
        duration: 0.9,
        ease: 'power3.out'
      }, 2.2) // Adjusted timing for smoother transition

      // small tilt + little grow before full surround (subtle increase)
      tl.to(whiteRef.current, {
        scale: 1.05,
        rotation: () => gsap.utils.random(-60, 60),
        duration: 0.6,
        ease: 'power2.out'
      }, 3.7)

      // finally expand overlay to cover the whole screen (surround)
      tl.to(whiteRef.current, {
        scale: 140,
        duration: 0.8,
        ease: 'power4.inOut'
      }, 3.9)

      // slide loader up off screen after surround completes
      const isPlayground = (typeof window !== 'undefined' && window.location && window.location.pathname === '/playground')

      if (isPlayground) {
        tl.call(() => {
          window.dispatchEvent(new Event('startLanding'))
          if (typeof onComplete === 'function') onComplete()
          else window.dispatchEvent(new Event('loaderComplete'))
        }, null, 4.8)
      } else {
        tl.to(containerRef.current, {
          yPercent: -120,
          duration: 0.8,
          ease: 'power4.inOut',
          onComplete: () => {
            window.dispatchEvent(new Event('startLanding'))
            if (typeof onComplete === 'function') onComplete()
            else window.dispatchEvent(new Event('loaderComplete'))
          }
        }, 4.8)
      }
    }

    const starter = requestAnimationFrame(() => startTimeline())

    return () => {
      cancelAnimationFrame(starter)
      if (tl) tl.kill()
    }
  }, [onComplete])

  const containerStyle = {
    position: 'fixed',
    inset: 0,
    background: '#212427',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    overflow: 'hidden',
    border: 'none' // Remove any dark borders from the container
  }

  const stageStyle = {
    position: 'relative',
    width: 360,
    height: 260,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const imgStyle = {
    width: 280,
    height: 340,
    borderRadius: 0,
    boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
    position: 'absolute',
    objectFit: 'cover',
    border: '6px solid white',
    paddingBottom: "52px",
    background:"#fff"
  }

  const cardStyle = {
    width: 280,
    height: 340,
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
    padding: '8px 0', // Add padding to center the text within the white area
    background: '#fff', // Ensure text background matches the white padding
    fontFamily: 'trial'
  }

  const whiteOverlayStyle = {
    width: 280,
    height: 340,
    borderRadius: 0,
    backgroundColor: '#E1E1E1',
    zIndex: 40,
    backgroundPosition: '0 0, 0 0',
    backgroundRepeat: 'repeat, repeat'
  }

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={stageStyle}>
  <div ref={el => imgRefs.current[0] = el} style={{ ...cardStyle, zIndex: 10 }}>
    <img src={Image1} alt="i1" style={imgStyle} />
    <div className='text-3xl text-black' style={overlayTextStyle}><div>Designing</div></div>
  </div>

  <div ref={el => imgRefs.current[1] = el} style={{ ...cardStyle, zIndex: 20 }}>
    <img src={Image2} alt="i2" style={imgStyle} />
    <div className='text-3xl text-black' style={overlayTextStyle}><div>And</div></div>
  </div>

  <div ref={el => imgRefs.current[2] = el} style={{ ...cardStyle, zIndex: 30 }}>
    <img src={Image3} alt="i3" style={imgStyle} />
    <div className='text-3xl text-black' style={overlayTextStyle}><div>developing</div></div>
  </div>

  {/* overlay that rises and then expands to cover (starts same size as images) */}
  <div
    className='flex font-["demo"] justify-center loader-overlay pt-8 text-4xl'
    ref={whiteRef}
    style={whiteOverlayStyle}
  >Welcome</div>
      </div>
    </div>
  )
}

export default Loader
