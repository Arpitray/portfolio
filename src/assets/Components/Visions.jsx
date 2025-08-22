import React, { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import { useNavigate } from 'react-router-dom'
import LL3 from './ll3.png'
import SpinGif from './spin.gif'
import SandImage from './SandImage'
import DecayCard from './DecayCard'
import PG2 from './pg1.png'

export default function Visions({
  // image = '/PlayGround/virtual-project/index.html', // Removed unused parameter
  title = 'Visions',
  description = 'Visceral Visions is an interactive web project that lets users explore detailed 3D models of the human brain, heart, lungs, kidneys, liver, and stomach. Built with WebGL (via Three.js) and JavaScript, it delivers smooth real-time rendering and intuitive camera controls for rotation, zoom, and reset.',
  description2="Each organ is paired with clear educational text, making it both visually engaging and informative. Hosted on GitHub Pages, this project reflects my dedication to creating useful, immersive, and accessible learning experiences as my second major build.",
}) {
  const nav = useNavigate()
  const sectionRef = useRef(null)
  const maskRef = useRef(null)
  const [isMobile, setIsMobile] = useState(() => {
    try { return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches } catch (error) { 
      console.warn('Failed to detect mobile:', error)
      return false 
    }
  })
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(max-width: 767px)')
    const onChange = (e) => setIsMobile(e.matches)
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else if (mql.addListener) mql.addListener(onChange)
    return () => {
      try { if (mql.removeEventListener) mql.removeEventListener('change', onChange) } catch (error) {
        console.warn('Failed to remove event listener:', error)
      }
      try { if (mql.removeListener) mql.removeListener(onChange) } catch (error) {
        console.warn('Failed to remove listener:', error)
      }
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const mask = maskRef.current
    if (!section || !mask) return

    const endDistance = () => Math.max(1, section.offsetHeight - window.innerHeight)

    const tween = gsap.to(mask, {
      yPercent: -100,
      ease: 'none',
      force3D: true,
      overwrite: true,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${endDistance()}`,
        scrub: 0.3
      }
    })

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      try {
        tween && tween.kill && tween.kill()
        ScrollTrigger.getAll().forEach(t => t.kill && t.kill())
      } catch (error) {
        console.warn('Failed to cleanup animations:', error)
      }
    }
  }, [])

  return (
  <section id="visions" ref={sectionRef} className="w-full flex font-['trial'] sm:px-8 pb-32  md:min-h-screen" style={{ position: 'relative', zIndex: 9999, backgroundColor: '#E1E1E1', overflow: 'visible' }}>
      <div className="content-wrap w-full" style={{ position: 'relative', zIndex: 100 }}>
        <div className="w-full flex flex-col md:flex-row justify-center items-start md:items-center mt-12 md:mt-32 gap-8 md:gap-12 px-6">

        <div className="flex w-full md:w-1/2 justify-center lg:justify-center saturate-120">
          <DecayCard width={isMobile ? 300 : 1000} height={isMobile ? 220 : 680} image={PG2} bare={true}>
            {/* optional caption could go here */}
          </DecayCard>
        </div>

        <div className="space-y-4 w-full md:w-1/2 items-start px-6 lg:px-12">
          <h3 className="text-black font-[100] tracking-tight text-center md:text-start text-[24px] sm:text-[28px] md:text-[88px] lg:text-[84px]">{title}</h3>
          <p className="text-[16px] sm:text-[18px] md:text-[30px] text-black/90 leading-6 md:leading-10 tracking-wide font-semibold  font-['pepper']">{description}</p>
          <p className="text-[16px] sm:text-[18px] md:text-[30px] text-black/90 leading-6 md:leading-8 tracking-wide font-semibold  font-['pepper']">{description2}</p>
          <div className="mt-4 md:mt-6 flex justify-center md:justify-start">
            <button onClick={() => nav('/visions')} className="inline-flex items-center rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-bold">Visit</button>
          </div>
        </div>
        </div>
      </div>

      {/* Full-height solid overlay mask that will slide up to reveal the Showcase under this section */}
  <div aria-hidden="true" ref={maskRef} className="visions-full-mask" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100vh', pointerEvents: 'none', zIndex: 10, background: 'rgba(225,225,225,1)', willChange: 'transform', transform: 'translateZ(0)' }} />
    </section>
  )
}
