import React, { useEffect, useRef, useState } from 'react'
import imgA from './image1.png'
import imgB from './image3.png'
import imgC from './image4.png'
import imgD from './image1.png'
import ss1 from './ss1.png'
import ss2 from './ss2.png'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Showcase: pinned area that lasts ~200vh with four vertical slips (columns).
// Each slip contains two tall screenshots stacked vertically. As you scroll while
// the showcase is pinned, slips move alternately up/down.

export default function Showcase() {
  const outerRef = useRef(null)
  const stickyRef = useRef(null)
  const colsWrapRef = useRef(null)
  const wrapRefs = useRef([])
  const colRefs = useRef([])
  const offsetRef = useRef([])
  useEffect(() => {
    const outer = outerRef.current
    const sticky = stickyRef.current
    // don't capture a potentially-empty snapshot here; read live refs when needed
    if (!outer || !sticky) return

    gsap.registerPlugin(ScrollTrigger)

    // compute sizes
    const recalc = () => {
      const vh = window.innerHeight
      const imgHeight = vh * 1.6 // 160vh (images taller than viewport)
      const maxShift = imgHeight - vh
      return { vh, imgHeight, maxShift }
    }

    let triggers = []

    const setup = () => {
      const { maxShift } = recalc()
      const outerRect = outer.getBoundingClientRect()
      const totalScrollable = Math.max(1, outerRect.height - window.innerHeight)

      // pin the sticky container using GSAP for consistent behavior
      const pinTrigger = ScrollTrigger.create({
        trigger: outer,
        start: 'top top',
        end: () => `+=${totalScrollable}`,
        pin: sticky,
        pinSpacing: false
      })
      triggers.push(pinTrigger)

      // initialize offsets for each column (pixel offsets for inner containers)
      // initialize offsets for each column (pixel offsets for inner containers)
      const liveCols = colRefs.current || []
      offsetRef.current = liveCols.map(() => 0)

      // Ensure inner containers start at the correct position depending on column
      // columns 1 and 3 (second and fourth) should start aligned to bottom
      liveCols.forEach((colEl, i) => {
        if (!colEl) return
        const contentHeight = colEl.scrollHeight || (window.innerHeight * 4)
        const maxShift = Math.max(0, contentHeight - window.innerHeight)
        // start from bottom for 2nd and 4th slips
        if (i === 1 || i === 3) {
          gsap.set(colEl, { y: -maxShift })
        } else {
          gsap.set(colEl, { y: 0 })
        }
      })

      ScrollTrigger.refresh()
    }

    setup()

    // Instead of wheel-driven wrap-around, create linear scrub animations
    // so each inner column translates from 0 -> -maxShift over the pinned duration.
    const setupScrub = () => {
      const liveCols = colRefs.current || []
      const outerRect = outer.getBoundingClientRect()
      const totalScrollable = Math.max(1, outerRect.height - window.innerHeight)

      liveCols.forEach((colEl, i) => {
        if (!colEl) return
        const contentHeight = colEl.scrollHeight
        const maxShift = Math.max(0, contentHeight - window.innerHeight)

        // For 2nd and 4th slips (i 1 and 3), animate from -maxShift -> 0 so content
        // moves bottom-to-top. For others, animate 0 -> -maxShift.
        const from = (i === 1 || i === 3) ? -maxShift : 0
        const to = (i === 1 || i === 3) ? 0 : -maxShift

        // ensure starting position matches
        gsap.set(colEl, { y: from })

        const t = gsap.to(colEl, {
          y: to,
          ease: 'none',
          scrollTrigger: {
            trigger: outer,
            start: 'top top',
            end: () => `+=${totalScrollable}`,
            scrub: true
          }
        })
        triggers.push(t.scrollTrigger)
      })

      ScrollTrigger.refresh()
    }

    setupScrub()

  // no mask logic

    const handleResize = () => {
      triggers.forEach(t => t.kill && t.kill())
      triggers = []
      ScrollTrigger.getAll().forEach(t => t.kill())
      setup()
      setupScrub()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      triggers.forEach(t => t.kill && t.kill())
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  // no mask event listeners

  // outer height: pin for 200vh -> outer = 100vh + 200vh = 300vh
  const outerStyle = {
    position: 'relative',
    width: '100%',
    height: '400vh', // enough vertical space for the pin + long scroll
    overflow: 'hidden'
  }

  const stickyStyle = {
    position: 'sticky',
    top: 0,
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 0
  }

  const colsWrap = {
    display: 'flex',
    width: '100%',
    height: '100vh',
    zIndex: 0
  }

  const colOuter = {
    flex: '1 1 25%',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative'
  }

  const innerImgContainer = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    // repeat images stacked: 4 * 100vh = 400vh
    height: '400vh',
    transform: 'translateY(0px)'
  }

  const imgStyle = {
    display: 'block',
    width: '100%',
    height: '100vh',
    objectFit: 'cover'
  }

  return (
  <section ref={outerRef} style={outerStyle} aria-hidden={false}>
      <div ref={stickyRef} style={stickyStyle}>
        <div style={colsWrap}>
          <div style={colOuter} ref={el => (wrapRefs.current[0] = el)}>
            <div ref={el => (colRefs.current[0] = el)} style={innerImgContainer}>
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              
            </div>
          </div>

          <div style={colOuter} ref={el => (wrapRefs.current[1] = el)}>
            <div ref={el => (colRefs.current[1] = el)} style={innerImgContainer}>
               <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
            </div>
          </div>

          <div style={colOuter} ref={el => (wrapRefs.current[2] = el)}>
            <div ref={el => (colRefs.current[2] = el)} style={innerImgContainer}>
               <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              
            </div>
          </div>

          <div style={colOuter} ref={el => (wrapRefs.current[3] = el)}>
            <div ref={el => (colRefs.current[3] = el)} style={innerImgContainer}>
             <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
              <img src={ss1} alt='' style={imgStyle} />
              <img src={ss2} alt='' style={imgStyle} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
 
