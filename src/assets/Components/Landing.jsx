import React, { useEffect, useRef, useLayoutEffect } from 'react'
import { gsap } from 'gsap'
import Image1 from './image1.png'
import Image2  from './maincam.jpg'
import Image3 from './image3.png'
import Image4 from './image4.jpg'
import SnowCanvas from './SnowCanvas'


function Landing() {
  const sectionRef = useRef(null)
  const navItems = [
    { label: 'HOME', href: '#home' },
    { label: 'ABOUT', href: '#about' },
    { label: 'WORK', href: '#work' },
    { label: 'CONTACT', href: '#contact' }
  ]

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Ensure starting position is normalized and repeat is enabled using GSAP (no CSS keyframes)
    gsap.set(section, {
      backgroundPosition: '0px 0px, 0px 0px',
      backgroundRepeat: 'repeat',
    })

    // Two layered backgrounds already defined in CSS with background-size 60px 60px
    // Animate Y position by 60px for a seamless loop
    const animation = gsap.to(section, {
      backgroundPositionY: '+=60px, +=60px',
      duration: 1,
      ease: 'linear',
      repeat: -1,
    })

    return () => {
      animation.kill()
    }
  }, [])

  const headingRef = useRef(null)
  const heroBlockRef = useRef(null)
  const originalHeadingHtmlRef = useRef('')

  useLayoutEffect(() => {
    const heading = headingRef.current
    if (!heading) return

    originalHeadingHtmlRef.current = heading.innerHTML

    const splitText = (rootEl) => {
      // split text nodes into per-letter inner spans so each character can be
      // animated/targeted independently by other components (canvas)
      const animatedSpans = []
      const walker = document.createTreeWalker(
        rootEl,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => (node.nodeValue && node.nodeValue.trim().length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
        },
      )
      const textNodes = []
      while (walker.nextNode()) textNodes.push(walker.currentNode)

      const wrapLetters = (textNode) => {
        const text = textNode.nodeValue
        const frag = document.createDocumentFragment()
        for (let i = 0; i < text.length; i++) {
          const ch = text[i]
          if (ch === ' ' || ch === '\t' || ch === '\n') {
            frag.appendChild(document.createTextNode(ch))
            continue
          }
          const outer = document.createElement('span')
          outer.style.display = 'inline-block'
          outer.style.overflow = 'hidden'
          outer.style.verticalAlign = 'bottom'
          const inner = document.createElement('span')
          inner.setAttribute('data-letter', '')
          inner.textContent = ch
          inner.style.display = 'inline-block'
          outer.appendChild(inner)
          frag.appendChild(outer)
          animatedSpans.push(inner)
        }
        textNode.parentNode.replaceChild(frag, textNode)
      }

      textNodes.forEach(wrapLetters)
      return animatedSpans
    }

    const targetsFromSplit = splitText(heading)
    // If splitText actually wrapped text nodes, it returns inner spans. Otherwise
    // fall back to existing spans (e.g. other scripts already split letters).
    let targets = targetsFromSplit
    const didSplit = targetsFromSplit && targetsFromSplit.length > 0
    if (!didSplit) {
      // try to find already-split inner spans (per-word or per-letter)
      const existing = Array.from(heading.querySelectorAll('span > span, span[data-letter]'))
      targets = existing
    }
    const imageContainers = Array.from(heading.querySelectorAll('.image1'))
    const canvasEl = heroBlockRef.current?.querySelector('canvas') || null

    const tl = gsap.timeline()

  // navbar fade-in should match the hero text entrance
  const navEl = sectionRef.current ? sectionRef.current.querySelector('nav') : null
  if (navEl) gsap.set(navEl, { autoAlpha: 0 })

    if (canvasEl) {
      // keep canvas hidden until after text animation to avoid heavy paint work
      gsap.set(canvasEl, { opacity: 0 })
      tl.to(canvasEl, { opacity: 1, duration: 0.8, ease: 'power1.out' }, 0)
    }

    // fade in navbar alongside the hero text
    if (navEl) {
      tl.to(navEl, { autoAlpha: 1, duration: 1, ease: 'expo.out' }, 0.05)
    }

    // hint GPU acceleration and avoid layout thrash
    gsap.set(targets, { yPercent: 120, opacity: 0, force3D: true })
    tl.to(targets, {
      yPercent: 0,
      opacity: 1,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.02,
      delay: 0.15,
      force3D: true,
    }, 0.05)

    if (imageContainers.length) {
      gsap.set(imageContainers, { y: 40, opacity: 0, force3D: true })
      tl.to(imageContainers, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'expo.out',
        stagger: 0.08,
        force3D: true,
      }, '<0.1')
    }

    // Pause timeline and wait for the loader to finish.
    // The loader will dispatch a global 'startLanding' or 'loaderComplete' event when it's ready.
    tl.pause()

    const startHandler = () => {
      try {
        tl.play()
      } catch (e) { /* noop */ }
      window.removeEventListener('startLanding', startHandler)
      window.removeEventListener('loaderComplete', startHandler)
    }

  window.addEventListener('startLanding', startHandler)
  window.addEventListener('loaderComplete', startHandler)

    // notify other components that the entrance animation finished
    tl.call(() => window.dispatchEvent(new Event('landingTextAnimated')))

    // after the entrance finishes, remove overflow:hidden from wrapper spans
    // so descenders (like 'p') are not clipped after the animation
    tl.call(() => {
      try {
        const inners = heading.querySelectorAll('span[data-letter], span > span')
        inners.forEach((inner) => {
          const wrap = inner.parentElement
          if (wrap && wrap.tagName.toLowerCase() === 'span') {
            wrap.style.overflow = 'visible'
          }
        })
      } catch (e) {
        // noop
      }
    })

    return () => {
      window.removeEventListener('startLanding', startHandler)
      window.removeEventListener('loaderComplete', startHandler)
      tl.kill()
      // only restore original HTML if we performed the split ourselves
      if (didSplit && heading && originalHeadingHtmlRef.current) heading.innerHTML = originalHeadingHtmlRef.current
    }
  }, [])

  return (
    <>
  <section ref={sectionRef} className="relative h-screen w-full bg-grid z-10">
      <nav className="fixed top-[3%] left-0 z-50 w-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-3 rounded-xl border border-white/10 bg-white/20 backdrop-blur-[4px] backdrop-saturate-150 ring-1 ring-black/5 py-4 shadow-md">
            <div className="h-12 px-4 flex items-center justify-between">
              <div className="text-xl font-extrabold tracking-tight text-black">Arpit.</div>
              <div className="hidden md:flex items-center gap-6 text-[13px] font-medium text-black">
                {navItems.map(({ label, href }) => (
                  <a key={label} href={href} className="hover:opacity-70 transition-opacity">{label}</a>
                ))}
                <a
                  href="#resume"
                  className="inline-flex items-center rounded-md bg-orange-500 px-3 py-1.5 text-white hover:bg-orange-600 transition-colors"
                >
                  RESUME
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-40 flex h-full items-center font-['belly']">
        <div className="mx-auto px-4 sm:px-6 lg:px-10 lg:py-12">
          <div ref={heroBlockRef} className="relative inline-block">
            {/* Snow effect canvas (covers only the text block) */}
            <SnowCanvas />
            <h1 ref={headingRef} className="relative z-10 text-black font-[100] leading-none text-5xl sm:text-7xl md:text-8xl lg:text-[170px] tracking-tight">
              <div className="flex flex-wrap items-center gap-4">
                <div className="image1 border-2 h-30 w-52 rounded-[55px] overflow-hidden mt-4 shrink-0ctracking-widest" style={{ width: 208, height: 120, willChange: 'transform, opacity' }}>
                  <img className='h-full w-full object-cover ' src={Image3} alt="" />
                </div>
                <span>Where  Code </span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="block">Quality Meets </span>
                <div className="image1 border-2 h-30 w-68 rounded-[55px] overflow-hidden mt-4 shrink-0" style={{ width: 272, height: 120, willChange: 'transform, opacity' }}>
                  <img className='h-full w-full object-cover ' src={Image4} alt="" />
                </div>
              </div>
              <span className="block">Exceptional UI</span>
            </h1>
          </div>
        </div>
      </div>

    </section>
    </>
  )
}

export default Landing