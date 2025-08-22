import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from "./assets/Components/Landing"
import About from "./assets/Components/About"
import Lenis from "lenis"
import Projects from "./assets/Components/Projects"
import CursorGlass from './assets/Components/CursorGlass'
import { motion } from "motion/react"
import Loader from './assets/Components/Loader'
import Showcase from "./assets/Components/Showcase"
import PlayGround from './assets/Components/PlayGround'
import PlaygroundPreview from "./assets/Components/PlaygroundPreview"
import Visions from "./assets/Components/Visions"
import VisionsFrame from "./assets/Components/VisionsFrame"
import Contact from "./assets/Components/Contact"
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function App() {
  useEffect(() => {
    // More aggressive mobile-specific ScrollTrigger config
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    
    ScrollTrigger.config({ 
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize"
    })

    // Mobile-specific fixes for production issues
    if (isMobile || isTouchDevice) {
      // Force ScrollTrigger to use native scroll on mobile for better compatibility
      ScrollTrigger.normalizeScroll(true)
      
      // Set CSS custom property for mobile viewport
      const setVH = () => {
        const vh = window.innerHeight * 0.01
        document.documentElement.style.setProperty('--vh', `${vh}px`)
      }
      setVH()
      window.addEventListener('resize', setVH)
      window.addEventListener('orientationchange', () => setTimeout(setVH, 100))
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false, // Keep disabled on mobile to avoid conflicts
      touchMultiplier: 1.2,
    })

    try { if (typeof window !== 'undefined') window.lenis = lenis } catch (e) {}

    // Enhanced ScrollTrigger sync with Lenis + mobile refresh
    const updateScrollTrigger = () => {
      ScrollTrigger.update()
      if (isMobile || isTouchDevice) {
        // Additional refresh delay for mobile layout settling
        setTimeout(() => ScrollTrigger.refresh(true), 16)
      }
    }
    
    lenis.on && lenis.on('scroll', updateScrollTrigger)

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    const rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [])

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fall back in case loader doesn't call onComplete
    const t = setTimeout(() => setLoading(false), 7000);
    return () => clearTimeout(t);
  }, [])

  // Centralized ScrollTrigger refresh logic to handle mobile production issues
  useEffect(() => {
    const raf = (cb) => requestAnimationFrame(() => requestAnimationFrame(cb))
    const debounced = (fn, wait = 180) => {
      let id
      return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), wait) }
    }
    const doRefresh = () => {
      try { ScrollTrigger.refresh(true) } catch (e) {}
    }
    const schedule = () => raf(doRefresh)
    const debouncedSchedule = debounced(schedule, 120)

    // When loader finishes we need a refresh because initial triggers were created under overlay & before fonts/images
    const onLoader = () => {
      debouncedSchedule()
      // extra pass after fonts settle
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => debouncedSchedule())
      }
      // images lazy loading may shift layout
      setTimeout(debouncedSchedule, 450)
      setTimeout(debouncedSchedule, 900)
    }

    // Orientation / resize on mobile dynamic toolbar changes
    const onOrient = () => setTimeout(debouncedSchedule, 350)
    const onResize = debouncedSchedule
    const onVisibility = () => { if (!document.hidden) debouncedSchedule() }

    window.addEventListener('loaderComplete', onLoader)
    window.addEventListener('load', onLoader)
    window.addEventListener('orientationchange', onOrient)
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    // Font readiness if it resolves after initial load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => debouncedSchedule())
    }

    // Safety: do an initial delayed refresh (first paint + layout settle)
    const early = setTimeout(schedule, 300)
    const later = setTimeout(schedule, 1200)

    return () => {
      window.removeEventListener('loaderComplete', onLoader)
      window.removeEventListener('load', onLoader)
      window.removeEventListener('orientationchange', onOrient)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
      clearTimeout(early); clearTimeout(later)
    }
  }, [])

  const onLoaderComplete = () => {
    // allow a tiny overlap for a smooth crossfade
    setTimeout(() => {
      setLoading(false)
      // mark globally that loader finished so other components can check instantly
      try { window.__loaderComplete = true } catch (e) { /* noop */ }
      // also dispatch the global event so listeners relying on it run
      try { window.dispatchEvent(new Event('loaderComplete')) } catch (e) { /* noop */ }
    }, 80)
  }

  return (
    <BrowserRouter>
      <CursorGlass />
      <Routes>
        <Route path="/playground" element={<PlayGround />} />
        <Route path="/visions" element={<VisionsFrame />} />
        <Route path="/" element={
          <>
            <Landing />
            <About />
            
            <Projects />
            <Visions />
            <PlaygroundPreview />
            <Showcase />
            <Contact />
            
          </>
        } />
      </Routes>
      {loading && <Loader onComplete={onLoaderComplete} />}
    </BrowserRouter>
  )
}

export default App