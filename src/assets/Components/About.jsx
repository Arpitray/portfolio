import React, { useEffect, useRef, useState } from 'react'
import DecayCard from './DecayCard'
import Maincam from './maincam.jpg'
import Arpit3 from './Arpit3.png'
import Arpit2 from './Arpit2.png'
import Arpit4 from './Arpit4.png'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

function About() {
  const imageRef = useRef(null)
  const textRefs = useRef({ heading: null, p1: null, p2: null })

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const wrapWords = (el) => {
      if (!el) return []
      if (!el.dataset.original) el.dataset.original = el.innerHTML
      const text = el.textContent.trim()
      const words = text.split(/\s+/)
      el.innerHTML = ''
      const nodeList = []
      words.forEach((w, i) => {
        const outer = document.createElement('span')
        outer.className = 'inline-block overflow-hidden mr-2'
        const inner = document.createElement('span')
        inner.className = 'inline-block'
        inner.textContent = w
        outer.appendChild(inner)
        el.appendChild(outer)
        if (i !== words.length - 1) el.appendChild(document.createTextNode(' '))
        nodeList.push(inner)
      })
      return nodeList
    }

    if (imageRef.current) {
      gsap.set(imageRef.current, { x: 0, opacity: 1 })
    }

    const isMobile = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches

    const imgAnim = imageRef.current ? gsap.fromTo(imageRef.current,
      { x: '-16%', opacity: 0 },
      {
        x: '0%',
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: imageRef.current,
          start: 'top 85%',
          end: 'top 40%',
          scrub: isMobile ? false : 0.8,
          once: true,
          invalidateOnRefresh: true,
        },
      }
    ) : null

    const animateWords = (nodes, delay = 0) => {
      if (!nodes || nodes.length === 0) return null
      return gsap.from(nodes, {
        yPercent: 100,
        opacity: 0,
        stagger: 0.03,
        duration: 0.8,
        ease: 'power3.out',
        delay,
        scrollTrigger: {
          trigger: nodes[0] ? nodes[0].closest('p, h1, h2, h3, div') : imageRef.current,
          start: 'top 92%',
          once: true,
        },
      })
    }

    const headingSpans = wrapWords(textRefs.current.heading)
    const p1Spans = wrapWords(textRefs.current.p1)
    const p2Spans = wrapWords(textRefs.current.p2)

    const hAnim = animateWords(headingSpans)
    const p1Anim = animateWords(p1Spans, 0.1)
    const p2Anim = animateWords(p2Spans, 0.2)

    return () => {
      ;[textRefs.current.heading, textRefs.current.p1, textRefs.current.p2].forEach((el) => {
        if (el && el.dataset && el.dataset.original) el.innerHTML = el.dataset.original
      })
      imgAnim && imgAnim.kill()
      hAnim && hAnim.kill()
      p1Anim && p1Anim.kill()
      p2Anim && p2Anim.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  // detect mobile viewport to adjust image size
  const [isMobile, setIsMobile] = useState(() => {
    try {
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches
    } catch (e) { return false }
  })
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(max-width: 767px)')
    const onChange = (e) => setIsMobile(e.matches)
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else if (mql.addListener) mql.addListener(onChange)
    return () => {
      try { if (mql.removeEventListener) mql.removeEventListener('change', onChange) } catch (e) {}
      try { if (mql.removeListener) mql.removeListener(onChange) } catch (e) {}
    }
  }, [])

  return (
    <section id="about" className="relative min-h-screen w-full font-normal bg-[#E1E1E1] z-[99]  flex font-['dk2'] sm:px-8">
      <div className="w-full flex flex-col md:flex-row justify-center mt-12 md:mt-32 items-start gap-8 md:gap-12 px-6">
        <div className="flex w-full justify-center md:justify-center saturate-120 mb-6 md:mb-0" ref={imageRef}>
              <DecayCard width={isMobile ? 300 : 550} height={isMobile ? 300 : 600} image={Arpit3} mobile={isMobile}>
                <div className='text-4xl'>Arpit</div>
              </DecayCard>
        </div>
        <div className="space-y-6 w-full items-start md:pl-6">
          <h2 ref={(el) => (textRefs.current.heading = el)} className="text-black font-[100] tracking-tight text-center md:text-start text-[50px] sm:text-[40px] md:text-[48px] lg:text-[100px]">About Me</h2>
          <p ref={(el) => (textRefs.current.p1 = el)} className="text-[18px] md:text-[26px] text-black leading-6 md:mr-44 font-['dk']">
          I build pixel perfect, design accurate frontends enriched with modern animations and seamless interactivity — ensuring every project feels as good as it looks. Leveraging technologies like React, JavaScript, GSAP, and Framer Motion, I craft fluid user experiences, while WebGL and Three.js bring immersive 3D visuals to life.
          </p>
          <p ref={(el) => (textRefs.current.p2 = el)} className="text-[18px] md:text-[26px] text-black leading-6 md:mr-44 font-['dk']">
            My work focuses on marrying design and engineering: translating visual language into performant, accessible UIs
          </p>
          <div className="mt-6 flex justify-center md:block md:justify-start">
            <a href="#contact" className="inline-flex items-center rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-bold">Get in touch</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About