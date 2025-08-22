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
    // Fix viewport height for real mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    
    // Real mobile browsers change viewport height on scroll
    const handleResize = () => {
      setVH();
      // Debounced refresh for ScrollTrigger
      clearTimeout(window.vhTimeout);
      window.vhTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    ScrollTrigger.config({ 
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
    });

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.2,
    })

    try { if (typeof window !== 'undefined') window.lenis = lenis } catch (e) {}

    // keep ScrollTrigger in sync with Lenis
    lenis.on && lenis.on('scroll', () => ScrollTrigger.update())

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    const rafId = requestAnimationFrame(raf)

    // Additional mobile-specific refresh after everything loads
    const mobileRefresh = () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);
    };
    
    if (window.matchMedia('(max-width: 768px)').matches) {
      window.addEventListener('load', mobileRefresh);
      document.addEventListener('DOMContentLoaded', mobileRefresh);
    }

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      window.removeEventListener('load', mobileRefresh);
      document.removeEventListener('DOMContentLoaded', mobileRefresh);
      clearTimeout(window.vhTimeout);
      lenis.destroy()
    }
  }, [])

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fall back in case loader doesn't call onComplete
    const t = setTimeout(() => setLoading(false), 7000);
    return () => clearTimeout(t);
  }, [])

  const onLoaderComplete = () => {
    // allow a tiny overlap for a smooth crossfade
    setTimeout(() => {
      setLoading(false)
      // mark globally that loader finished so other components can check instantly
      try { window.__loaderComplete = true } catch (e) { /* noop */ }
      // also dispatch the global event so listeners relying on it run
      try { window.dispatchEvent(new Event('loaderComplete')) } catch (e) { /* noop */ }
      
      // Mobile-specific ScrollTrigger refresh after loader completes
      if (window.matchMedia('(max-width: 768px)').matches) {
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 200);
      }
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