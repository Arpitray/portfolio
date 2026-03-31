import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import Arpit3 from './Arpit3.png'
import Magnetic from './Magnetic'

export default function Contact() {
  const elRef = useRef(null)
  const polaroidRef = useRef(null)
  const revealRef = useRef(null)
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
      el.style.pointerEvents = 'auto' // Make active
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
            if (self.progress >= 0.65) {
              el.style.pointerEvents = 'auto'
            } else {
              el.style.pointerEvents = 'none'
            }
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
    }
  }, [])

  // use Framer Motion drag:
  const handleDragStart = () => {
    const polaroid = polaroidRef.current
    if (!polaroid) return
    polaroid.classList.add('dragging')
    try {
      polaroid.style.touchAction = 'none'
      polaroid.style.pointerEvents = 'auto'
      polaroid.style.cursor = 'grabbing'
      polaroid.style.zIndex = '9999'
    } catch (e) {}
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
    window.dispatchEvent(new CustomEvent('cursorGlass:customText', { detail: 'DRAG' }))
  }

  const handleMouseLeave = () => {
    setCursorText('')
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
  <section 
    id="contact" 
    className="md:fixed md:left-0 md:right-0 md:bottom-0 md:h-screen md:z-[5000] z-[10000] relative w-full overflow-hidden bg-[#E1E1E1]" 
    ref={elRef} 
    aria-label="Contact section"
  >
        {/* Subtle noisy background texture overlay */}
        <div className="absolute inset-0 opacity-[0.2] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>

        {/* Huge dynamic background typography */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex items-center justify-center pointer-events-none opacity-10">
          <h1 className="font-black text-transparent tracking-[-0.05em] uppercase whitespace-nowrap" style={{ WebkitTextStroke: '2px #1a1a1a', fontSize: 'clamp(8rem, 25vw, 35rem)', lineHeight: 0.8 }}>
            CONNECT
          </h1>
        </div>

        <div className="relative w-full h-full min-h-[80vh] flex flex-col md:flex-row items-center justify-center pointer-events-auto z-10 px-4 md:px-12 gap-10 md:gap-16">
        
          {/* --- LEFT: DRAGGABLE CARD (Hidden on Mobile) --- */}
          <div className="hidden md:flex relative z-30 items-center justify-center w-full md:w-1/2 mt-16 md:mt-0">
            <motion.div
              ref={polaroidRef}
              className="polaroid-container"
              drag
              dragElastic={0.15}
              dragMomentum={true}
              dragConstraints={{
                left: isMobile ? -screenDimensions.width : -screenDimensions.width * 0.5,
                right: isMobile ? screenDimensions.width : screenDimensions.width * 0.5, 
                top: isMobile ? -screenDimensions.height : -screenDimensions.height * 0.5,
                bottom: isMobile ? screenDimensions.height : screenDimensions.height * 0.5
              }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{ cursor: 'grab' }}
              whileDrag={{ scale: 1.05, cursor: 'grabbing', rotate: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Card Container */}
              <div 
                className="relative group transition-all duration-300" 
                style={{ 
                  width: 380, 
                  height: 530, 
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.02)',
                  padding: '22px 22px 80px 22px',
                  transform: 'rotate(-4deg)'
                }}
              >
                {/* Polaroid Paper Texture */}
                <div className="absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")'}}></div>
                
                {/* Main Image */}
                <img 
                  className='contact-image'
                  src={Arpit3} 
                  alt="Arpit" 
                  draggable={false}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    filter: 'contrast(1.05) saturate(1.1) sepia(0.05)',
                  }} 
                />
                
                {/* Lower text area */}
                <div className="absolute bottom-0 left-0 w-full" style={{
                  height: isMobile ? '60px' : '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'primary',
                  fontSize: isMobile ? '18px' : '22px',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  color: '#1a1a1a',
                }}>
                  @Arpit
                </div>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT: REVEALED CONTENT --- */}
          <div 
            ref={revealRef} 
            className="w-full md:w-1/2 flex flex-col items-center md:items-start justify-center z-40 relative px-4"
          >
            <div className="flex flex-col items-center md:items-start gap-8 md:gap-10 mt-10 md:mt-0">
              <h2 className="text-center md:text-left font-black tracking-[-0.05em] leading-[0.85] text-[#1a1a1a]"
                  style={{ fontSize: 'clamp(3.8rem, 10vw, 7rem)' }}>
                LET'S BUILD<br/><span className="italic font-light opacity-80">SOMETHING.</span>
              </h2>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-[500px]">
                <Magnetic strength={0.2} className="w-full relative z-50">
                  <a 
                    href="mailto:rayarpit72@gmail.com" 
                    className="relative overflow-hidden group flex items-center justify-center w-full py-4 sm:py-5 rounded-full border border-[#1a1a1a]/20 bg-white/50 backdrop-blur-md text-[#1a1a1a] font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs md:text-sm transition-all duration-500 hover:text-white hover:border-[#1a1a1a]"
                  >
                     <span className="relative z-10 pointer-events-none">Email</span>
                     <div className="absolute inset-0 bg-[#1a1a1a] translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] pointer-events-none"></div>
                  </a>
                </Magnetic>
                <Magnetic strength={0.2} className="w-full relative z-50">
                  <a 
                    href="https://www.linkedin.com/in/arpit-arjun-ray-2ba326335/" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="relative overflow-hidden group flex items-center justify-center w-full py-4 sm:py-5 rounded-full border border-[#1a1a1a]/20 bg-white/50 backdrop-blur-md text-[#1a1a1a] font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs md:text-sm transition-all duration-500 hover:text-white hover:border-[#1a1a1a]"
                  >
                     <span className="relative z-10 pointer-events-none">LinkedIn</span>
                     <div className="absolute inset-0 bg-[#1a1a1a] translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] pointer-events-none"></div>
                  </a>
                </Magnetic>
                <Magnetic strength={0.2} className="w-full relative z-50">
                  <a 
                    href="https://github.com/ArpitRay" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="relative overflow-hidden group flex items-center justify-center w-full py-4 sm:py-5 rounded-full border border-[#1a1a1a]/20 bg-white/50 backdrop-blur-md text-[#1a1a1a] font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs md:text-sm transition-all duration-500 hover:text-white hover:border-[#1a1a1a]"
                  >
                     <span className="relative z-10 pointer-events-none">GitHub</span>
                     <div className="absolute inset-0 bg-[#1a1a1a] translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] pointer-events-none"></div>
                  </a>
                </Magnetic>
                <Magnetic strength={0.2} className="w-full relative z-50">
                  <a 
                    href="https://x.com/ArpitRay12" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="relative overflow-hidden group flex items-center justify-center w-full py-4 sm:py-5 rounded-full border border-[#1a1a1a]/20 bg-white/50 backdrop-blur-md text-[#1a1a1a] font-bold tracking-[0.2em] uppercase text-[10px] sm:text-xs md:text-sm transition-all duration-500 hover:text-white hover:border-[#1a1a1a]"
                  >
                     <span className="relative z-10 pointer-events-none">Twitter</span>
                     <div className="absolute inset-0 bg-[#1a1a1a] translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] pointer-events-none"></div>
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}