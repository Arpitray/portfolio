import React, { useEffect, useRef, useLayoutEffect, useState } from 'react'
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
      return () => { try { id.kill() } catch (e) {} }
    } catch (e) {
      // noop
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
  { label: 'PLAYGROUND', href: '/playground' },
  { label: 'WORK', href: '#work' },
  { label: 'CONTACT', href: '#contact' }
  ]

  useEffect(() => {
    // Show nav once loader finished or when user navigates directly to landing
    const showNav = () => setNavVisible(true)
    const hideNav = () => setNavVisible(false)

    // if already on landing (direct open), show nav only after loader finishes
    if (location && (location.pathname === '/' || location.pathname === '')) {
      // If loader already finished earlier, show immediately
      if (typeof window !== 'undefined' && window.__loaderComplete) {
        showNav()
        return
      }
      // otherwise wait for loaderComplete event
      window.addEventListener('loaderComplete', showNav)
      return () => { window.removeEventListener('loaderComplete', showNav) }
    }
    const section = sectionRef.current
    if (!section) return

    // Ensure starting position is normalized and repeat is enabled using GSAP (no CSS keyframes)
    gsap.set(section, {
      backgroundPosition: '0px 0px, 0px 0px',
      backgroundRepeat: 'repeat',
    })

    // Two layered backgrounds already defined in CSS with background-size 60px 60px
    // Animate Y position by 60px for a seamless loop
    const animation = gsap.to(section, {
      backgroundPositionY: '+=60px, +=60px',
      duration: 1,
      ease: 'linear',
      repeat: -1,
    })

    return () => {
      animation.kill()
    }
  }, [])

  const headingRef = useRef(null)
  const heroBlockRef = useRef(null)
  const originalHeadingHtmlRef = useRef('')

  useLayoutEffect(() => {
    const heading = headingRef.current
    if (!heading) return

    originalHeadingHtmlRef.current = heading.innerHTML

    const splitText = (rootEl) => {
      // split text nodes into per-letter inner spans so each character can be
      // animated/targeted independently by other components (canvas)
      const animatedSpans = []
      const walker = document.createTreeWalker(
        rootEl,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => (node.nodeValue && node.nodeValue.trim().length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
        },
      )
      const textNodes = []
      while (walker.nextNode()) textNodes.push(walker.currentNode)

      const wrapLetters = (textNode) => {
        const text = textNode.nodeValue
        const frag = document.createDocumentFragment()
        for (let i = 0; i < text.length; i++) {
          const ch = text[i]
          if (ch === ' ' || ch === '\t' || ch === '\n') {
            frag.appendChild(document.createTextNode(ch))
            continue
          }
          const outer = document.createElement('span')
          outer.style.display = 'inline-block'
          outer.style.overflow = 'hidden'
          outer.style.verticalAlign = 'bottom'
          const inner = document.createElement('span')
          inner.setAttribute('data-letter', '')
          inner.textContent = ch
          inner.style.display = 'inline-block'
          outer.appendChild(inner)
          frag.appendChild(outer)
          animatedSpans.push(inner)
        }
        textNode.parentNode.replaceChild(frag, textNode)
      }

      textNodes.forEach(wrapLetters)
      return animatedSpans
    }

    const targetsFromSplit = splitText(heading)
    // If splitText actually wrapped text nodes, it returns inner spans. Otherwise
    // fall back to existing spans (e.g. other scripts already split letters).
    let targets = targetsFromSplit
    const didSplit = targetsFromSplit && targetsFromSplit.length > 0
    if (!didSplit) {
      // try to find already-split inner spans (per-word or per-letter)
      const existing = Array.from(heading.querySelectorAll('span > span, span[data-letter]'))
      targets = existing
    }
    const imageContainers = Array.from(heading.querySelectorAll('.image1'))
    const canvasEl = heroBlockRef.current?.querySelector('canvas') || null

    const tl = gsap.timeline()

  // navbar fade-in should match the hero text entrance
  const navEl = sectionRef.current ? sectionRef.current.querySelector('nav') : null
  // start slightly up and transparent; hint GPU for smoother animation
  if (navEl) gsap.set(navEl, { autoAlpha: 0, force3D: true })

    if (canvasEl) {
      // keep canvas hidden until after text animation to avoid heavy paint work
      gsap.set(canvasEl, { opacity: 0 })
      tl.to(canvasEl, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0)
    }

    // fade in navbar alongside the hero text (only opacity)
      if (navEl) {
        tl.to(navEl, { autoAlpha: 1, duration:2, ease: 'power3.out', force3D: true }, 0.05)
      }

    // hint GPU acceleration and avoid layout thrash
    gsap.set(targets, { yPercent: 120, opacity: 0, force3D: true })
    tl.to(targets, {
      yPercent: 0,
      opacity: 1,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.02,
      delay: 0.15,
      force3D: true,
    }, 0.05)

    if (imageContainers.length) {
      gsap.set(imageContainers, { y: 40, opacity: 0, force3D: true })
      tl.to(imageContainers, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.08,
        force3D: true,
      }, '<0.1')
    }

    // Pause timeline and wait for the loader to finish.
    // If the loader already finished earlier (for example events fired while
    // the page was backgrounded), play immediately using the global flag.
    // The loader normally dispatches a global 'startLanding' or 'loaderComplete'
    // event when it's ready.
    tl.pause()

    let listenersAttached = false
    const startHandler = () => {
      try {
        tl.play()
      } catch (e) { /* noop */ }
      if (listenersAttached) {
        window.removeEventListener('startLanding', startHandler)
        window.removeEventListener('loaderComplete', startHandler)
        listenersAttached = false
      }
    }

    // If loader already completed (set by App.onLoaderComplete), start immediately.
    if (typeof window !== 'undefined' && window.__loaderComplete) {
      // give React/DOM a tick so any layout fixes apply, then play
      requestAnimationFrame(() => startHandler())
    } else {
      window.addEventListener('startLanding', startHandler)
      window.addEventListener('loaderComplete', startHandler)
      listenersAttached = true
    }

    // notify other components that the entrance animation finished
    tl.call(() => window.dispatchEvent(new Event('landingTextAnimated')))

    // after the entrance finishes, remove overflow:hidden from wrapper spans
    // so descenders (like 'p') are not clipped after the animation
    tl.call(() => {
      try {
        const inners = heading.querySelectorAll('span[data-letter], span > span')
        inners.forEach((inner) => {
          const wrap = inner.parentElement
          if (wrap && wrap.tagName.toLowerCase() === 'span') {
            wrap.style.overflow = 'visible'
          }
        })
      } catch (e) {
        // noop
      }
    })

    return () => {
      window.removeEventListener('startLanding', startHandler)
      window.removeEventListener('loaderComplete', startHandler)
      tl.kill()
      // only restore original HTML if we performed the split ourselves
      if (didSplit && heading && originalHeadingHtmlRef.current) heading.innerHTML = originalHeadingHtmlRef.current
    }
  }, [])

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
      } catch (e) {
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
        try { track.removeChild(clone) } catch (e) { /* noop */ }
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
                  onClick={(e) => {
                    try {
                      if (location && (location.pathname === '/' || location.pathname === '')) {
                        // Hard refresh to restart the entire site experience
                        window.location.href = window.location.href
                        return
                      }
                    } catch (err) {}
                    navigate('/')
                  }}
                  className="text-xl sm:text-2xl font-extrabold tracking-tight text-black bg-transparent border-0 p-0 cursor-pointer flex-shrink-0"
                >
                  Arpit.
                </button>
                {/* Mobile hamburger - visible on small screens only */}
                <button
                  type="button"
                  className="md:hidden inline-flex items-center justify-center p-1 sm:p-2 rounded-md text-black hover:opacity-80 flex-shrink-0"
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle menu"
                  onClick={() => setMobileMenuOpen((v) => !v)}
                >
                  {/* simple 3-bar icon */}
                  <span className="sr-only">Open menu</span>
                  <div className="w-5 h-5 sm:w-6 sm:h-6 relative">
                    <span className={`block absolute left-0 right-0 h-[3px] bg-black transition-transform duration-200 ${mobileMenuOpen ? 'translate-y-2 rotate-45' : 'translate-y-0'}`}></span>
                    <span className={`block absolute left-0 right-0 h-[3px] bg-black transition-all duration-200 ${mobileMenuOpen ? 'opacity-0' : 'translate-y-2'}`}></span>
                    <span className={`block absolute left-0 right-0 h-[3px] bg-black transition-transform duration-200 ${mobileMenuOpen ? 'translate-y-2 -rotate-45' : 'translate-y-4'}`}></span>
                  </div>
                </button>

                <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-black overflow-x-hidden">
                  {navItems.map(({ label, href }) => {
                    // PLAYGROUND behavior (existing)
                    if (label === 'PLAYGROUND') {
                      return (
                        <a
                          key={label}
                          href={href}
                          onClick={(e) => {
                            if (location && (location.pathname === '/' || location.pathname === '')) {
                              e.preventDefault()
                              try {
                                const el = document.getElementById('playground-preview')
                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                else navigate('/playground')
                              } catch (err) {
                                navigate('/playground')
                              }
                            } else {
                              e.preventDefault()
                              navigate('/playground')
                            }
                          }}
                          className="hover:opacity-70 transition-opacity"
                        >
                          {label}
                        </a>
                      )
                    }

                    // HOME, ABOUT, WORK, and CONTACT: smooth scroll when on landing, otherwise navigate to anchor
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
                              } catch (err) {
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
      className="md:hidden fixed inset-0 z-[2147483650] bg-gradient-to-br from-white/5 via-white/3 to-white/2 backdrop-blur-lg backdrop-saturate-150 border border-white/10 shadow-2xl"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
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
                  } catch (err) { navigate('/playground') }
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
                  } catch (err) { window.location.hash = href }
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