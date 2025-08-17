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
    // overlay starts offscreen like images and at same size as images
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
        duration: 1.4,
        stagger: 0.6,
        ease: 'power3.out'
      }, 0.4)

      // overlay rises into center at full image size
      tl.to(whiteRef.current, {
        yPercent: 0,
        autoAlpha: 1,
        rotation: () => gsap.utils.random(-30, 30),
        duration: 0.95,
        ease: 'power3.out'
      }, 2.5)

      // small tilt + little grow before full surround (subtle increase)
      tl.to(whiteRef.current, {
        scale: 1.06,
        rotation: () => gsap.utils.random(-60, 60),
        duration: 0.7,
        ease: 'power2.out'
      }, 3.9)

      // finally expand overlay to cover the whole screen (surround)
      tl.to(whiteRef.current, {
        scale: 140,
        duration: 0.84,
        ease: 'power4.inOut'
      }, 4)

      // slide loader up off screen after surround completes
      tl.to(containerRef.current, {
        yPercent: -120,
        duration: 0.9,
        ease: 'power4.inOut',
        onComplete: () => {
          // once loader has slid up, start the landing so landing appears after the overlay has left
          window.dispatchEvent(new Event('startLanding'))
          if (typeof onComplete === 'function') onComplete()
          else window.dispatchEvent(new Event('loaderComplete'))
        }
      }, 5.06)
    }

    // start the timeline on next animation frame so paint can settle first
    const starter = requestAnimationFrame(() => startTimeline())

    return () => {
      cancelAnimationFrame(starter)
      if (tl) tl.kill()
      gsap.killTweensOf([containerRef.current, imgRefs.current, whiteRef.current])
    }
  }, [])

  const containerStyle = {
    position: 'fixed',
    inset: 0,
    background: '#212427',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  zIndex: 9999,
    overflow: 'hidden'
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
  backgroundColor: '#212427'
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
  bottom: 24,
  paddingBottom: 24,
  fontFamily: 'trial'
  }

  const labelStyle = {
    marginTop: 18,
    color: '#fff',
    fontWeight: 700,
    position: 'absolute',
    bottom: -46
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
    style={{
      width: 280,
      height: 340,
      borderRadius: 0,
      backgroundColor: '#E1E1E1',
      zIndex: 40,
      opacity: 0,
      backgroundPosition: '0 0, 0 0',
      backgroundRepeat: 'repeat, repeat'
    }}
  >Welcome</div>
      </div>
    </div>
  )
}

export default Loader
