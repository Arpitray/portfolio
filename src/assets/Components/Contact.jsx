import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import Polaroid from './sc1.png'
import DragSvg from './drag.svg'
import Arpit3 from './Arpit3.png'

export default function Contact() {
  const elRef = useRef(null)
  const polaroidRef = useRef(null)
  const revealRef = useRef(null)
  const [dropped, setDropped] = useState(false)
  const [cursorText, setCursorText] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [screenDimensions, setScreenDimensions] = useState({ width: 0, height: 0 })

  // Check for mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 767
      setIsMobile(mobile)
      setScreenDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    gsap.registerPlugin(ScrollTrigger)
    
    // Use different behavior for mobile vs desktop
    const isMobileCheck = window.matchMedia('(max-width: 767px)').matches
    let tl
    
    if (isMobileCheck) {
      // For mobile, no GSAP animation - just show normally
      gsap.set(el, { yPercent: 0 })
      el.style.pointerEvents = 'auto'
      el.style.position = 'relative'
      el.style.height = 'auto'
      return
    } else {
      // Desktop behavior (original GSAP logic)
      gsap.set(el, { yPercent: 100 })
      el.style.pointerEvents = 'none'
      el.style.position = 'fixed'
      el.style.height = '100vh'
      
      const showcase = document.querySelector('.showcase-outer')
      if (!showcase) return

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: showcase,
          start: 'top top',
          end: () => `+=${Math.max(1, showcase.offsetHeight - window.innerHeight)}`,
          scrub: 0.3,
          onUpdate: self => {
            if (self.progress >= 0.65) el.style.pointerEvents = 'auto'
            else el.style.pointerEvents = 'none'
          }
        }
      })

      tl.to({}, { duration: 0.7 })
      tl.to(el, { yPercent: 0, duration: 0.9, ease: 'power3.out' })
    }

    ScrollTrigger.refresh()
    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      if (tl) tl.kill()
      ScrollTrigger.getAll().forEach(t => t.kill && t.kill())
    }
  }, [])

  // use Framer Motion drag: detect when image is moved to reveal text
  const handleDragStart = () => {
    const polaroid = polaroidRef.current
    if (!polaroid) return
    polaroid.classList.add('dragging')
    try {
      // Don't change positioning during drag to prevent teleportation
      polaroid.style.touchAction = 'none'
      polaroid.style.pointerEvents = 'auto'
      polaroid.style.cursor = 'grabbing'
      polaroid.style.zIndex = '9999'
    } catch (e) {}
  }

  const handleDrag = () => {
    // Reveal text as soon as the image starts moving
    if (!dropped) {
      setDropped(true)
      const reveal = revealRef.current
      if (reveal) {
        gsap.fromTo(reveal, 
          { y: 20, autoAlpha: 0 }, 
          { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }
        )
      }
    }
  }

  const handleDragEnd = () => {
    const pol = polaroidRef.current
    if (pol) {
      pol.classList.remove('dragging')
      pol.style.cursor = 'grab'
    }
  }

  const handleMouseEnter = () => {
    setCursorText('drag')
    // Dispatch custom event to update cursor glass text
    window.dispatchEvent(new CustomEvent('cursorGlass:customText', { detail: 'DRAG' }))
  }

  const handleMouseLeave = () => {
    setCursorText('')
    // Reset cursor glass to default text
    window.dispatchEvent(new CustomEvent('cursorGlass:customText', { detail: null }))
  }

  return (
    <>
      <style>
        {`
        .polaroid-container {
          touch-action: none;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          cursor: grab !important;
          will-change: transform;
          position: relative;
        }
        .polaroid-container:active {
          cursor: grabbing !important;
        }
        .dragging {
          pointer-events: auto !important;
          cursor: grabbing !important;
          z-index: 9999 !important;
        }
        .polaroid-container img {
          pointer-events: none;
          user-select: none;
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
        }
      `}</style>
  <section id="contact" className='md:fixed md:left-0 md:right-0 md:bottom-0 md:h-screen md:z-[5000] relative w-full' ref={elRef} aria-label="Contact section">
        {/* New centered heading */}
        <div className="absolute md:top-20 top-8 left-0 w-full flex font-['dk'] justify-center items-center py-4 bg-[#E1E1E1] z-10">
          <h1 className='font-semibold md:text-[5rem] text-4xl'>Contact Me</h1>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, height: 160, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 160" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
            <path d="M0,48 C240,0 360,80 720,48 C1080,16 1200,48 1440,32 L1440,160 L0,160 Z" fill="#E1E1E1" />
          </svg>
        </div>
 
        <div className="min-h-[60vh] md:h-screen flex items-center justify-center bg-[#E1E1E1] px-6 md:py-12 pt-24 pb-12">
        
          {/* Flexbox container for left SVG and right content */}
          <div className="max-w-7xl w-full flex md:flex-row flex-col items-center justify-between md:gap-12 gap-1">
          
            {/* Left side - Drag SVG */}
            <div className="flex-1 flex items-center justify-center md:mb-0 mb-6">
              <img 
                src={DragSvg} 
                alt="Drag instruction" 
                className="w-full md:max-w-md max-w-56 h-auto"
                style={{ 
                  opacity: 0.8,
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))'
                }}
              />
            </div>

            {/* Right side - Image and contact text */}
            <div className="flex-1 flex flex-col items-center md:mt-48 mt-12 justify-center relative">
              {/* Main draggable image positioned in center */}
              <div className="relative flex items-center justify-center md:mb-8 mb-">
                <motion.div
                  ref={polaroidRef}
                  className="polaroid-container"
                  drag
                  dragElastic={0.1}
                  dragMomentum={false}
                  dragPropagation={false}
                  dragConstraints={{ 
                    left: isMobile ? -screenDimensions.width * 0.7 : -screenDimensions.width * 0.8, 
                    right: isMobile ? screenDimensions.width * 0.7 : screenDimensions.width * 0.8, 
                    // increase vertical freedom on mobile to 60% of screen height
                    top: isMobile ? -screenDimensions.height * 0.6 : -screenDimensions.height * 0.4, 
                    bottom: isMobile ? screenDimensions.height * 0.6 : screenDimensions.height * 0.4 
                  }}
                  onDragStart={handleDragStart}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  style={{ 
                    cursor: 'grab', 
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    position: 'relative'
                  }}
                  whileDrag={{ 
                    cursor: 'grabbing', 
                    scale: 1.05,
                    zIndex: 9999
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 40,
                    mass: 1
                  }}
                  dragTransition={{ 
                    bounceStiffness: 600, 
                    bounceDamping: 30,
                    power: 0.3,
                    timeConstant: 300
                  }}
                >
                  <div className='rotate-8' style={{ 
                    width: isMobile ? 220 : 440, 
                    height: isMobile ? 280 : 540, 
                    backgroundColor: '#fff',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
                    border:"12px solid #fff",
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}>
                    <img className='contact-image'
                      src={Arpit3} 
                      alt="polaroid" 
                      draggable={false}
                      style={{ 
                        width: '100%', 
                        height: 'calc(100% - 60px)', 
                        objectFit: 'cover', 
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        pointerEvents: 'none'
                      }} 
                    />
                    <div style={{
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'end',
                      fontFamily: 'dk',
                      fontSize: isMobile ? '24px' : '36px',
                      fontWeight: '600',
                      color: '#313437',
                      backgroundColor: '#fff',
                      marginRight: '12px'
                    }}>
                      @Arpit
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Contact text positioned beneath the image */}
              <div 
                ref={revealRef} 
                style={{ 
                  position: 'absolute',
                  top: '50%', // Centered vertically relative to the image
                  left: '50%', // Centered horizontally relative to the image
                  transform: 'translate(-50%, -50%)', // Adjust for centering
                  textAlign: 'center',
                  opacity: dropped ? 1 : 0, // Initially hidden, becomes visible after dragging
                  zIndex: dropped ? 0 : -1, // Ensure it is beneath the image initially
                  width: isMobile ? '90vw' : 'auto', // Give more width on mobile
                  maxWidth: isMobile ? '400px' : 'none' // Limit max width on mobile
                }}
              >
                <div style={{ color: '#313437', fontWeight: 700 }}>
                  <div className='rotate-8' style={{ 
                    fontSize: isMobile ? 28 : 44,  
                    marginBottom: 20, 
                    fontFamily: 'dk' 
                  }}>LETS WORK TOGETHER!</div>
                  <div style={{ 
                    display: 'flex', 
                    gap: isMobile ? 16 : 24, 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    flexDirection: isMobile ? 'column' : 'row'
                  }}>
                    <a className='font-["dk"] tracking-wider'
                      href="mailto:rayarpit72@gmail.com" 
                      style={{ 
                        color: '#313437', 
                        fontWeight: 600, 
                        textDecoration: 'none',
                        fontSize: isMobile ? 20 : 28,
                        padding: '10px 20px',
                        
                        transition: 'all 0.3s ease',
                        backgroundColor: 'transparent'
                      }}
                  
                    >
                      Email
                    </a>
                    <a 
                      href="https://www.linkedin.com/in/arpit-arjun-ray-2ba326335/" 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ 
                        color: '#313437', 
                        fontWeight: 600, 
                        textDecoration: 'none',
                        fontSize: isMobile ? 20 : 28,
                        padding: '10px 20px',
                        fontFamily: 'dk',
                        transition: 'all 0.3s ease',
                        backgroundColor: 'transparent'
                      }}
                     
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}