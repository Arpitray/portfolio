import React, { useRef, useEffect } from 'react'
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
  image = '/PlayGround/virtual-project/index.html',
  title = 'Visions',
  description = 'Visceral Visions is an interactive web project that lets users explore detailed 3D models of the human brain, heart, lungs, kidneys, liver, and stomach. Built with WebGL (via Three.js) and JavaScript, it delivers smooth real-time rendering and intuitive camera controls for rotation, zoom, and reset.',
  description2="Each organ is paired with clear educational text, making it both visually engaging and informative. Hosted on GitHub Pages, this project reflects my dedication to creating useful, immersive, and accessible learning experiences as my second major build.",
}) {
  const nav = useNavigate()
  const sectionRef = useRef(null)
  const maskRef = useRef(null)

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
      } catch (e) {}
    }
  }, [])

  return (
    <section id="visions" ref={sectionRef} className="min-h-screen w-full flex font-['trial'] sm:px-8 pb-32" style={{ position: 'relative', zIndex: 9999, backgroundColor: '#E1E1E1', overflow: 'visible' }}>
      <div className="content-wrap w-full" style={{ position: 'relative', zIndex: 100 }}>
        <div className=" w-full flex justify-center items-center mt-32">
        

        <div className="space-y-6 w-full items-start px-6 lg:px-12" style={{ maxWidth: 900 }}>
          <h3 className="text-black font-[100] tracking-tight text-start text-[34px] sm:text-[40px] md:text-[88px] lg:text-[84px]">{title}</h3>
          <p className="text-[30px] text-black/90 leading-10 tracking-wide font-semibold  font-['pepper']">{description}</p>
          <p className="text-[30px] text-black/90 leading-8 tracking-wide font-semibold  font-['pepper']">{description2}</p>
          <div className="mt-6">
            <button onClick={() => nav('/visions')} className="inline-flex items-center rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-bold">Visit</button>
          </div>
        </div>
        <div className="flex w-full justify-center lg:justify-center saturate-120">
          <DecayCard width={1000} height={680} image={PG2} bare={true}>
            {/* optional caption could go here */}
          </DecayCard>
        </div>
        </div>
      </div>

      {/* Full-height solid overlay mask that will slide up to reveal the Showcase under this section */}
      <div aria-hidden="true" ref={maskRef} className="visions-full-mask" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100vh', pointerEvents: 'none', zIndex: 50, background: 'rgba(225,225,225,1)', willChange: 'transform', transform: 'translateZ(0)' }} />
    </section>
  )
}
