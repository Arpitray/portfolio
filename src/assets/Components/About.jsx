import React, { useEffect, useRef } from 'react'
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

    // Ensure ScrollTrigger is registered before any animations
    if (!gsap.core.globals().ScrollTrigger) {
      console.error('ScrollTrigger plugin is not registered.')
    } else {
      console.log('ScrollTrigger plugin is registered successfully.')
    }

    // helper: wrap words in spans for a split-word reveal
    const wrapWords = (el) => {
      if (!el) return []
      // preserve original
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
        // add space after word except last
        if (i !== words.length - 1) el.appendChild(document.createTextNode(' '))
        nodeList.push(inner)
      })
      return nodeList
    }

    // Debugging: Ensure the imageRef is correctly assigned and visible
    if (imageRef.current) {
      console.log('imageRef element:', imageRef.current)
      imageRef.current.style.border = '2px solid blue' // Temporary border for visibility
      imageRef.current.style.backgroundColor = 'rgba(0, 0, 255, 0.1)' // Temporary background color
    } else {
      console.error('imageRef is not assigned correctly.')
    }

    // Log element details for debugging
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      console.log('imageRef details:', {
        position: window.getComputedStyle(imageRef.current).position,
        display: window.getComputedStyle(imageRef.current).display,
        visibility: window.getComputedStyle(imageRef.current).visibility,
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }

    // Temporarily disable animation for debugging
    gsap.set(imageRef.current, {
      x: 0,
      opacity: 1,
    });

    // Restore animations for the About section
    const imgAnim = gsap.from(imageRef.current, {
      x: '-100%', // Start completely off-screen to the left
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: imageRef.current,
        start: 'top 80%',
        end: 'top 10%',
        scrub: true, // Enable markers for debugging
        onEnter: () => console.log('Image animation started'),
        onLeave: () => console.log('Image animation left viewport'),
        onUpdate: (self) => console.log(`Animation progress: ${self.progress}`), // Log animation progress
      },
    })

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
          start: 'top 80%',
        },
      })
    }

    const headingSpans = wrapWords(textRefs.current.heading)
    const p1Spans = wrapWords(textRefs.current.p1)
    const p2Spans = wrapWords(textRefs.current.p2)

    const hAnim = animateWords(headingSpans)
    const p1Anim = animateWords(p1Spans, 0.1)
    const p2Anim = animateWords(p2Spans, 0.2)

    // Cleanup temporary debugging styles
    if (imageRef.current) {
      imageRef.current.style.border = ''
      imageRef.current.style.backgroundColor = ''
    }

    return () => {
      // cleanup: restore original text
      [textRefs.current.heading, textRefs.current.p1, textRefs.current.p2].forEach((el) => {
        if (el && el.dataset && el.dataset.original) el.innerHTML = el.dataset.original
      })
      imgAnim && imgAnim.kill()
      hAnim && hAnim.kill()
      p1Anim && p1Anim.kill()
      p2Anim && p2Anim.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [])

  return (
    <section id="about" className="relative min-h-screen w-full bg-[#E1E1E1]  flex font-['trial'] sm:px-8">
      <div className=" w-full flex justify-center mt-32 items-start gap-12 px-6">
        <div className="flex w-full justify-center lg:justify-center saturate-120" ref={imageRef}>
          <DecayCard width={550} height={600} image={Arpit3}>
            <div>Arpit</div>
          </DecayCard>
        </div>

        <div className="space-y-6 w-full items-start">
          <h2 ref={(el) => (textRefs.current.heading = el)} className="text-black font-[100] tracking-tight text-start text-[34px] sm:text-[40px] md:text-[48px] lg:text-[100px]">About Me</h2>
          <p ref={(el) => (textRefs.current.p1 = el)} className="text-[22px] text-black leading-6 mr-44 font-['demo']">
          I build pixel perfect, design accurate frontends enriched with modern animations and seamless interactivity — ensuring every project feels as good as it looks. Leveraging technologies like React, JavaScript, GSAP, and Framer Motion, I craft fluid user experiences, while WebGL and Three.js bring immersive 3D visuals to life.
          </p>
          <p ref={(el) => (textRefs.current.p2 = el)} className="text-[22px] text-black leading-6 mr-44 font-['demo']">
            My work focuses on marrying design and engineering: translating visual language into performant, accessible UIs
          </p>
          <div className="mt-6">
            <a href="#contact" className="inline-flex items-center rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-bold">Get in touch</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About