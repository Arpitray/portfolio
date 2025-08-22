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
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
    })

    // Integrate Lenis with ScrollTrigger without scrollerProxy for broader mobile compatibility
    try {
      if (typeof window !== 'undefined') window.lenis = lenis
      if (lenis.on) lenis.on('scroll', ScrollTrigger.update)
      ScrollTrigger.refresh()
    } catch (e) {}

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
