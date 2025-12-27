import { useEffect, useState, useCallback } from "react"
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
import Stack from "./assets/Components/Stack"
import Snowfall from "react-snowfall"


gsap.registerPlugin(ScrollTrigger)

function App() {
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    // Fix viewport height for real mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    
    // Real mobile browsers change viewport height on scroll
    const handleResize = () => {
      setVH();
      // Only refresh ScrollTrigger on actual resize events (not scroll-related viewport changes)
      if (!isMobile) {
        clearTimeout(window.vhTimeout);
        window.vhTimeout = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 150);
      }
    };
    
    const handleOrientationChange = () => {
      setVH();
      // Orientation change requires refresh even on mobile
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    ScrollTrigger.config({ 
      ignoreMobileResize: true,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
    });

    // On mobile, use native scrolling completely (disable Lenis)
    // On desktop, enable smooth scrolling with Lenis
    let lenis = null;
    let rafId = null;
    let scrollHandler = null;

    if (!isMobile) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
      })

      try { if (typeof window !== 'undefined') window.lenis = lenis } catch (e) {}

      // keep ScrollTrigger in sync with Lenis
      lenis.on && lenis.on('scroll', () => ScrollTrigger.update())

      function raf(time) {
        lenis.raf(time)
        requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    } else {
      // Mobile: Use native scroll, sync ScrollTrigger with native scroll
      scrollHandler = () => {
        ScrollTrigger.update();
      };
      
      // Passive listener for better mobile performance
      window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(window.vhTimeout);
      if (lenis) lenis.destroy();
    }
  }, [])

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fall back in case loader doesn't call onComplete
    const t = setTimeout(() => setLoading(false), 7000);
    return () => clearTimeout(t);
  }, [])

  const onLoaderComplete = useCallback(() => {
    // allow a tiny overlap for a smooth crossfade
    setTimeout(() => {
      setLoading(false)
      // mark globally that loader finished so other components can check instantly
      try { window.__loaderComplete = true } catch (e) { /* noop */ }
      // also dispatch the global event so listeners relying on it run
      try { window.dispatchEvent(new Event('loaderComplete')) } catch (e) { /* noop */ }
      
      // Single refresh after loader completes (for both mobile and desktop)
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);
    }, 80)
  }, [])

  return (
    <BrowserRouter>
    {!loading && <Snowfall style={{ position: 'fixed', inset: 0, zIndex:9999999, pointerEvents: 'none' }} snowflakeCount={100} color="#ffffff" />}
      {!loading && <CursorGlass />}
      <Routes>
        <Route path="/playground" element={<PlayGround />} />
        <Route path="/visions" element={<VisionsFrame />} />
        <Route path="/" element={
          <>
            <Landing />
            
            <About />
             <Stack />
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