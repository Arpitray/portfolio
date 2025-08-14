import { useEffect } from "react"
import Landing from "./assets/Components/Landing"
import About from "./assets/Components/About"
import Lenis from "lenis"
import Projects from "./assets/Components/Projects"
import { motion } from "motion/react"

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

  return (
    <>
      <Landing />
      <About />
      <Projects />
    </>
  )
}

export default App
