import { useEffect, useState } from "react"
import Landing from "./assets/Components/Landing"
import About from "./assets/Components/About"
import Lenis from "lenis"
import Projects from "./assets/Components/Projects"
import CursorGlass from './assets/Components/CursorGlass'
import { motion } from "motion/react"
import Loader from './assets/Components/Loader'
import Showcase from "./assets/Components/Showcase"

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
    })

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
    setTimeout(() => setLoading(false), 80)
  }

  return (
    <>
      <CursorGlass />
      {/* render the app underneath the loader so loader can animate over it */}
      <Landing />
      <About />
      <Projects />
  <Showcase />
      {loading && <Loader onComplete={onLoaderComplete} />}
    </>
  )
}

export default App
