import React, { useEffect, useRef } from 'react'
import Image1 from './image3.png'
import Image2 from './image4.jpg'
import Image3 from './maincam.jpg'
import Image4 from './bangalore.jpg'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Reusable pill image component (accepts extra classes for animation targeting)
const PillImage = ({ src, alt, className = '' }) => (
  <span className={`about-item inline-flex align-middle mx-2 md:mx-3 h-[70px] w-[120px] md:h-[90px] md:w-[160px] rounded-[60px] overflow-hidden border border-black/20 shadow-sm will-change-transform ${className}`}>
    <img src={src} alt={alt} className="h-full w-full object-cover" />
  </span>
)

function About() {
  const containerRef = useRef(null)

  useEffect(() => {
    // Register plugin (guard for hot reload)
    if (!gsap.core.globals().ScrollTrigger) gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('.about-item')
      gsap.set(items, { scale: 0.7, transformOrigin: 'center center' })

      // Timeline tied to scroll, each item scales sequentially
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
            start: 'top 80%',
            end: 'top 5%',
            scrub: true,
        }
      })
      tl.to(items, {
        scale: 1,
        ease: 'none',
        stagger: { each: 0.25 }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} className="relative min-h-screen bg-[#f7f3ec] flex justify-center items-center font-['regular'] px-4 sm:px-8">
      <div className="mx-auto flex flex-col justify-center items-center w-full max-w-[1200px]">
        <h1 className="text-black font-[100] leading-[0.95] tracking-tight text-[48px] sm:text-[64px] md:text-[82px] lg:text-[96px] xl:text-[110px] select-none text-center mx-auto max-w-[1100px]">
          <div className="flex flex-wrap items-center justify-center">
            <span className="about-item mr-2 will-change-transform">I am</span>
            <PillImage src={Image2} alt="Portrait" />
            <span className="about-item will-change-transform">Arpit,</span>
            <span className="about-item ml-2 will-change-transform">Into Design-driven</span>
          </div>
          <div className="flex flex-wrap items-center justify-center mt-2">
            <span className="about-item will-change-transform">development</span>
            <span className="about-item ml-2 will-change-transform">for</span>
            <PillImage src={Image2} alt="Design spiral" />
            <span className="about-item ml-2 will-change-transform">1 year</span>
          </div>
          <div className="flex flex-wrap items-center justify-center mt-2">
            <span className="about-item will-change-transform">based</span>
            <span className="about-item ml-2 will-change-transform">in</span>
            <PillImage src={Image4} alt="City" />
            <span className="about-item ml-2 will-change-transform">Bangalore</span>
          </div>
        </h1>

        <p className="about-item will-change-transform mt-10 max-w-3xl font-['pepper']  text-center text-[25px] text-black/70 leading-relaxed font-bold">
          I build pixel-perfect, design-accurate frontends enriched with modern animations and seamless interactivity — ensuring every project feels as good as it looks.
        </p>

        <div className="mt-10 flex items-center gap-16 justify-center">
          <button className="about-item rounded-full font-bold font-['pal'] bg-orange-500 hover:bg-orange-600 text-white text-sm md:text-base px-10 py-4 tracking-wider transition-colors will-change-transform">
            MORE ABOUT ME
          </button>
        </div>
      </div>
    </section>
  )
}

export default About