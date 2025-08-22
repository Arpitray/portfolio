import React, { useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from 'gsap'
import { useNavigate, useLocation } from 'react-router-dom'
import Image1 from './image1.png'
import Image2  from './maincam.jpg'
import Image3 from './image3.png'
import Image4 from './image4.jpg'
import SnowCanvas from './SnowCanvas'
import LL1 from './ll1.png'
import LL2 from './ll2.png'
import { gsap as gsapCore } from 'gsap'
import LL4 from './ll4.png'
import LL5 from './ll5.png'

function Landing() {
  const sectionRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [navVisible, setNavVisible] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  // animate portal nav when it becomes visible
  useEffect(() => {
    if (!navVisible) return
    try {
      const el = document.getElementById('portal-nav')
      if (!el) return
      // start from hidden state to avoid flash; only animate opacity (no vertical motion)
      gsapCore.set(el, { autoAlpha: 0, force3D: true })
      const id = gsapCore.to(el, { autoAlpha: 1, duration: 1, ease: 'power3.out' })
      return () => { try { id.kill() } catch (error) { 
        console.warn('Failed to kill GSAP animation:', error)
      } }
    } catch (error) {
      console.warn('Portal nav animation failed:', error)
    }
  }, [navVisible])
  // close mobile menu if nav hides or when route changes
  useEffect(() => {
    if (!navVisible) setMobileMenuOpen(false)
  }, [navVisible, location.pathname])

  // close on ESC
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMobileMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileMenuOpen])
  const navItems = [
    { label: 'HOME', href: '#home' },
  { label: 'ABOUT', href: '#about' },
    { label: 'WORK', href: '#work' },
    { label: 'PLAYGROUND', href: '#playground' },
    { label: 'CONTACT', href: '#contact' },
  ]

  // const hideNav = () => setNavVisible(false) // Removed unused function

  // main heading animation
  const headingRef = useRef(null)
  const heroBlockRef = useRef(null)
  const originalHeadingHtmlRef = useRef(null)

  // Text animation that waits for loader to complete or the 'startLanding' event
  useLayoutEffect(() => {
    if (!headingRef.current) return
    
    const heading = headingRef.current
    let didSplit = false

    // Check if the heading has already been split into spans (e.g., by a previous effect run)
    const existingSpans = heading.querySelectorAll('span[data-char]')
    if (existingSpans.length === 0) {
      // Store original HTML before any manipulation
      originalHeadingHtmlRef.current = heading.innerHTML

      // Split text content into individual character spans for animation
      const splitText = (element) => {
        const walker = document.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT,
          null,
          false
        )
        const textNodes = []
        let node
        while ((node = walker.nextNode())) {
          if (node.nodeValue.trim()) textNodes.push(node)
        }

        textNodes.forEach((textNode) => {
          const chars = textNode.nodeValue.split('')
          const fragment = document.createDocumentFragment()
          
          chars.forEach((char) => {
            const span = document.createElement('span')
            span.textContent = char
            span.setAttribute('data-char', char)
            span.style.display = 'inline-block'
            fragment.appendChild(span)
          })
          
          textNode.parentNode.replaceChild(fragment, textNode)
        })
      }

      try {
        splitText(heading)
        didSplit = true
      } catch (error) {
        console.warn('Text splitting failed:', error)
        return
      }
    }

    const chars = heading.querySelectorAll('span[data-char]')
    if (chars.length === 0) return

    // Create timeline for character animations
    const tl = gsap.timeline({ paused: true })
    
    // Set initial state
    gsap.set(chars, { 
      opacity: 0, 
      y: 100, 
      rotationX: -90,
      transformOrigin: '50% 50% -50px'
    })

    // Animate characters in sequence
    tl.to(chars, {
      opacity: 1,
      y: 0,
      rotationX: 0,
      duration: 1.2,
      ease: 'back.out(1.7)',
      stagger: {
        amount: 0.8,
        from: 'start'
      },
      onComplete: () => {
        // Dispatch event when text animation completes
        try {
          window.dispatchEvent(new Event('landingTextAnimated'))
        } catch (error) {
          console.warn('Failed to dispatch landingTextAnimated event:', error)
        }
        setNavVisible(true)
      }
    })

    // Handler to start the animation
    let listenersAttached = false
    const startHandler = () => {
      try {
        tl.play()
      } catch (error) {
        console.warn('Failed to play landing animation:', error)
      }
      if (listenersAttached) {
        window.removeEventListener('startLanding', startHandler)
        window.removeEventListener('loaderComplete', startHandler)
        listenersAttached = false
      }
    }

    // Check if loader has already completed
    const loaderComplete = typeof window !== 'undefined' && window.__loaderComplete
    if (loaderComplete) {
      // Start immediately
      requestAnimationFrame(() => startHandler())
    } else {
      window.addEventListener('startLanding', startHandler)
      window.addEventListener('loaderComplete', startHandler)
      listenersAttached = true
    }

    return () => {
      window.removeEventListener('startLanding', startHandler)
      window.removeEventListener('loaderComplete', startHandler)
      tl.kill()
      // only restore original HTML if we performed the split ourselves
      if (didSplit && heading && originalHeadingHtmlRef.current) heading.innerHTML = originalHeadingHtmlRef.current
    }
  }, [location])

  // Vertical slider effect: cycles stacked images inside each .vertical-slider
  useEffect(() => {
    const sliders = sectionRef.current ? Array.from(sectionRef.current.querySelectorAll('.vertical-slider')) : []
    const timelines = []
    const clones = []

    sliders.forEach((slider) => {
      const track = slider.querySelector('.slider-track')
      if (!track) return

      const slides = Array.from(track.children)
      if (slides.length === 0) return

      const slideH = slider.clientHeight

      // Ensure each slide fills the viewport exactly and doesn't shrink
      // this guarantees the visible slide occupies full available height/width
      try {
        gsap.set(slides, { height: slideH, width: '100%', flex: '0 0 auto' })
      } catch (error) {
        console.warn('GSAP slide setup failed:', error)
        // fallback if GSAP can't set flex shorthand on older browsers
        slides.forEach((s) => {
          s.style.height = `${slideH}px`
          s.style.width = '100%'
          s.style.flex = '0 0 auto'
        })
      }
      const originalCount = slides.length

      // Append a clone of the first slide to make the loop seamless
      const firstClone = slides[0].cloneNode(true)
      track.appendChild(firstClone)
      clones.push({ track, clone: firstClone })

      // Position track at 0 and hint rendering
      gsap.set(track, { y: 0, willChange: 'transform' })

      // Build timeline: for each original slide, move up then hold
      const tl = gsap.timeline({ repeat: -1 })
      for (let i = 0; i < originalCount; i++) {
        tl.to(track, { y: `-=${slideH}`, duration: 0.8, ease: 'power2.out' })
        tl.to({}, { duration: 2 }) // hold
      }

      // After moving onto the cloned first slide, snap back to 0 immediately.
      // Because the clone visually matches the first slide, this avoids a visible jump.
      tl.set(track, { y: 0, immediateRender: false })

      timelines.push(tl)
    })

    return () => {
      timelines.forEach((t) => t.kill())
      // remove clones we appended
      clones.forEach(({ track, clone }) => {
        try { track.removeChild(clone) } catch (error) { 
          console.warn('Failed to remove slider clone:', error)
        }
      })
    }
  }, [])

  return (
    <div className="w-full h-screen max-w-full overflow-hidden">
    {/* Navbar rendered into a portal to guarantee it sits above other stacking contexts */}
  {navVisible && typeof document !== 'undefined' && createPortal(
        <nav id="portal-nav"
      className="fixed top-[3%] left-0 w-full overflow-x-hidden"
  style={{ position: 'fixed', left: 0, right: 0, opacity: 0, willChange: 'opacity, transform', zIndex: 2147483647, maxWidth: '100vw', overflow: 'hidden' }}
          onPointerEnter={() => window.dispatchEvent(new Event('cursorGlass:hide'))}
          onPointerLeave={() => window.dispatchEvent(new Event('cursorGlass:show'))}
        >
          <div className="mx-auto px-2 sm:px-6 lg:px-8 max-w-screen-2xl w-full overflow-x-hidden">
            <div className="mt-3 mx-1 sm:mx-2 rounded-xl border overflow-x-hidden border-white/10 bg-white/40 backdrop-blur-[4px] backdrop-saturate-150 ring-1 ring-black/5 py-4 shadow-md relative max-w-full">
              <div className="h-12 px-2 sm:px-4 flex items-center justify-between min-w-0 overflow-x-hidden">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      if (location && (location.pathname === '/' || location.pathname === '')) {
                        // Hard refresh to restart the entire site experience
                        window.location.reload()
                        return
                      }
                    } catch (error) {
                      console.warn('Navigation failed:', error)
                    }
                    navigate('/')
                  }}
                  className="text-xl sm:text-2xl font-extrabold tracking-tight text-black bg-transparent border-0 p-0 cursor-pointer flex-shrink-0"
                >
                  Arpit.
                </button>
                {/* Mobile hamburger - visible on small screens only */}
                <button
                  type="button"
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-black hover:opacity-80 focus:outline-none"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Desktop navigation - hidden on mobile */}
                <div className="hidden md:flex items-center gap-8">
                  {navItems.map(({ label, href }) => {
                    if (label === 'PLAYGROUND') {
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            try {
                              const el = document.getElementById('playground-preview')
                              if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                              } else {
                                navigate('/playground')
                              }
                            } catch (error) {
                              console.warn('Playground navigation failed:', error)
                              navigate('/playground')
                            }
                          }}
                          className="hover:opacity-70 transition-opacity text-black font-medium"
                        >
                          {label}
                        </button>
                      )
                    }

                    if (label === 'HOME' || label === 'ABOUT' || label === 'WORK' || label === 'CONTACT') {
                      return (
                        <a
                          key={label}
                          href={href}
                          onClick={(e) => {
                            if (location && (location.pathname === '/' || location.pathname === '')) {
                              e.preventDefault()
                              try {
                                if (label === 'CONTACT') {
                                  // Contact has fixed positioning, so scroll to bottom of page
                                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                } else {
                                  const el = document.getElementById(href.replace('#', ''))
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  } else {
                                    window.location.hash = href;
                                  }
                                }
                              } catch (error) {
                                console.warn('Scroll navigation failed:', error)
                                window.location.hash = href
                              }
                            } else {
                              e.preventDefault()
                              navigate('/' + href)
                            }
                          }}
                          className="hover:opacity-70 transition-opacity "
                        >
                          {label}
                        </a>
                      )
                    }

                    return <a key={label} href={href} className="hover:opacity-70 transition-opacity">{label}</a>
                  })}
                  
                </div>
              </div>
            </div>
          </div>
          {/* overlay moved — rendered separately as its own portal to ensure full viewport coverage */}
  </nav>,
        document.body
      )}

  {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
    <div
      className="md:hidden fixed left-0 top-0 z-[2147483650] w-[100vw] bg-gradient-to-br from-white/5 via-white/3 to-white/2 backdrop-blur-lg backdrop-saturate-150 border border-white/10 shadow-2xl"
      style={{ height: 'calc(var(--vh, 1vh) * 100)', paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      onClick={() => setMobileMenuOpen(false)}
    >
      <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          aria-label="Close menu"
          className="absolute top-6 right-6 z-50 p-3 rounded-md text-white hover:opacity-80"
          onClick={() => setMobileMenuOpen(false)}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M18 6L6 18" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 6L18 18" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="h-full flex flex-col items-center justify-center gap-8 px-8 text-center">
          {navItems.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={(e) => {
                e.preventDefault()
                setMobileMenuOpen(false)
                if (label === 'PLAYGROUND') {
                  try {
                    const el = document.getElementById('playground-preview')
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    else navigate('/playground')
                  } catch (error) { 
                    console.warn('Mobile playground navigation failed:', error)
                    navigate('/playground') 
                  }
                  return
                }
                if (label === 'HOME' || label === 'ABOUT' || label === 'WORK' || label === 'CONTACT') {
                  try {
                    if (label === 'CONTACT') {
                      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                    } else {
                      const el = document.getElementById(href.replace('#', ''))
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      else window.location.hash = href;
                    }
                  } catch (error) { 
                    console.warn('Mobile scroll navigation failed:', error)
                    window.location.hash = href 
                  }
                  return
                }
                navigate('/' + href)
              }}
              className="block text-zinc-700 font-bold text-5xl sm:text-5xl tracking-widest hover:opacity-80"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )}

  <section id="home" ref={sectionRef} className="relative h-screen w-full bg-grid z-10">
  <div className="relative z-40 flex h-full items-center font-['belly']">
        <div className="mx-auto px-4 sm:px-6 lg:px-10 lg:py-12">
          <div ref={heroBlockRef} className="relative inline-block">
            {/* Snow effect canvas (covers only the text block) */}
            <SnowCanvas />
            <h1 ref={headingRef} className="relative z-10 text-black font-[100] leading-none text-5xl sm:text-7xl md:text-8xl lg:text-[170px] tracking-tight">
              <div className="flex flex-wrap items-center gap-4">
                <div className="image1 border-2 h-30 w-52 rounded-[55px] overflow-hidden mt-4 shrink-0ctracking-widest vertical-slider" style={{ width: 208, height: 120, willChange: 'transform, opacity' }}>
                  <div className="slider-viewport h-full w-full overflow-hidden">
                    <div className="slider-track flex flex-col">
                      <img className='block h-full w-full object-cover' src={Image3} alt="" />
                      <img className='block h-full w-full object-cover' src={LL4} alt="" />
                      <img className='block h-full w-full object-cover' src={LL2} alt="" />
                      <img className='block h-full w-full object-cover' src={LL5} alt="" />
                    </div>
                  </div>
                </div>
                <span>Where  Code </span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="block">Quality Meets </span>
                <div className="image1 border-2 h-30 w-68 rounded-[55px] overflow-hidden mt-4 shrink-0" style={{ width: 272, height: 120, willChange: 'transform, opacity' }}>
                  <img className='h-full w-full object-cover ' src={Image4} alt="" />
                </div>
              </div>
              <span className="block flex-wrap whitespace-pre-line">Exceptional UI</span>
            </h1>
          </div>
        </div>
      </div>

  {/* Playground preview is rendered once in App.jsx (after Showcase) with id "playground-preview" */}
    </section>
    </div>
  )
}

export default Landing