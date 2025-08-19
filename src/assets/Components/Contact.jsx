import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Contact() {
  const elRef = useRef(null)
  const visibleRef = useRef(false)
  const tweenRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    gsap.registerPlugin(ScrollTrigger)
    // start hidden below viewport and non-interactive
    gsap.set(el, { yPercent: 100 })
    el.style.pointerEvents = 'none'

    const showcase = document.querySelector('.showcase-outer')
    if (!showcase) return

    // use a scrubbed timeline that maps the showcase scroll range -> timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: showcase,
        start: 'top top',
        // end recalculated on refresh: total scrollable of showcase
        end: () => `+=${Math.max(1, showcase.offsetHeight - window.innerHeight)}`,
        // use a small scrub smoothing for nicer follow (0.2-0.4 feels good)
        scrub: 0.3,
        // toggle pointer events based on progress (show when progress >= 0.65)
        onUpdate: self => {
          if (self.progress >= 0.65) {
            el.style.pointerEvents = 'auto'
          } else {
            el.style.pointerEvents = 'none'
          }
        }
      }
    })

  // timeline layout: hold for first ~70% then reveal during last ~30% so reveal is slower
  tl.to({}, { duration: 0.7 })
  tl.to(el, { yPercent: 0, duration: 0.9, ease: 'power3.out' })

    // initial hidden state
    gsap.set(el, { yPercent: 100 })

    // refresh to ensure end is up-to-date on load
    ScrollTrigger.refresh()

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      tl.kill()
      ScrollTrigger.getAll().forEach(t => t.kill && t.kill())
    }
  }, [])

  return (
    // fixed full-viewport container so it can overlap the Showcase and slide up like a mask
    <section className='' ref={elRef} style={{ position: 'fixed', left: 0, right: 0, bottom: 0, height: '100vh', zIndex: 5000 }} aria-label="Contact section">
      {/* bottom mask similar to Projects to create overlapping reveal */}
  <div style={{ position: 'absolute', left: 0, right: 0, height: 160, pointerEvents: 'none' }}>
        <svg viewBox="0 0 1440 160" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
          <path d="M0,48 C240,0 360,80 720,48 C1080,16 1200,48 1440,32 L1440,160 L0,160 Z" fill="#E1E1E1" />
        </svg>
      </div>

  <div className="min-h-[60vh] flex items-center justify-center bg-[#E1E1E1] px-6 py-12" style={{ height: '100vh' }}>
        <div className="max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">Get in touch</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-6">I'm available for freelance work and collaborations. Drop a message and I'll get back to you.</p>
          <a href="mailto:youremail@example.com" className="inline-block bg-black text-white px-6 py-3 rounded-lg">Say hello</a>
        </div>
      </div>
    </section>
  )
}