import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
import { useNavigate } from 'react-router-dom'
import LL3 from './ll3.png'
import SpinGif from './spin.gif'
import SandImage from './SandImage'
import DecayCard from './DecayCard'

export default function Visions({
  image = '/PlayGround/virtual project/index.html',
  title = 'Visions',
  description = 'This is a placeholder for the Visions section. Replace this text with your own description and content.'
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
          <p className="text-[25px] text-black/90 leading-10 tracking-wide font-semibold  font-['pepper']">{description}</p>
          <div className="mt-6">
            <button onClick={() => nav('/visions')} className="inline-flex items-center rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-bold">Visit</button>
          </div>
        </div>
        <div className="flex w-full justify-center lg:justify-center saturate-120">
          <DecayCard width={1050} height={780} image={SpinGif} bare={true}>
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
