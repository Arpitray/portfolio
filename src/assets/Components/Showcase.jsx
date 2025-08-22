import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'


// Showcase: pinned area that lasts ~200vh with four vertical slips (columns).
// Each slip contains two tall screenshots stacked vertically. As you scroll while
// the showcase is pinned, slips move alternately up/down.

export default function Showcase() {
  const outerRef = useRef(null)
  const stickyRef = useRef(null)
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
      // small responsive offset so the pin/scrub triggers start a bit earlier
      const pinOffset = Math.max(0, Math.round(vh * 0.1)) // ~8% of viewport
      return { vh, imgHeight, maxShift, pinOffset }
    }

    // helper used by ScrollTrigger starts so pin/scrub happen a bit earlier
    const pinStart = () => `top 50%-=${recalc().pinOffset}`

    let triggers = []

    const setup = () => {
      // const { maxShift } = recalc() // Removed unused variable
      const outerRect = outer.getBoundingClientRect()
      const totalScrollable = Math.max(2, outerRect.height - window.innerHeight)

      // pin the sticky container using GSAP for consistent behavior
      const pinTrigger = ScrollTrigger.create({
        trigger: outer,
        start: pinStart,
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
            start: pinStart,
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

  // no mask logic

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
  height: '200vh', // enough vertical space for the pin + long scroll
  // lift the showcase up so it visually appears beneath the Projects section
  // the Projects component adds a 160px SVG mask; match that with negative margin
  marginTop: '-140px',
  zIndex: 0
  }

  const stickyStyle = {
    position: 'sticky',
    top: 0,
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    height: '100%',
    objectFit: 'cover'
  }

  const imgWrapStyle = {
    boxSizing: 'border-box',
    width: '100%',
    height: '150vh',
    paddingBottom: 12,
    borderBottom: '1px solid #000',
    marginBottom: 18,
  }

  return (
    <section className='showcase-outer hidden md:block' ref={outerRef} style={outerStyle} aria-hidden={false}>
      <div className='' ref={stickyRef} style={stickyStyle}>
        <div  style={colsWrap}>
          <div style={colOuter} className='mr-8 ml-8' ref={el => (wrapRefs.current[0] = el)}>
            <div ref={el => (colRefs.current[0] = el)} style={innerImgContainer}>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766127/sc1_wac5g1.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766131/ss1_paw1nh.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766127/sc1_wac5g1.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766131/ss1_paw1nh.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766127/sc1_wac5g1.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766131/ss1_paw1nh.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766127/sc1_wac5g1.png" alt='' style={imgStyle} /></div>
            </div>
          </div>

          <div style={colOuter} className='mr-8' ref={el => (wrapRefs.current[1] = el)}>
            <div ref={el => (colRefs.current[1] = el)} style={innerImgContainer}>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766129/sc2_bunhhj.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766129/sc2_bunhhj.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766131/ss1_paw1nh.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766129/sc2_bunhhj.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766412/ss2_y3kvc7.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766129/sc2_bunhhj.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766412/ss2_y3kvc7.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766129/sc2_bunhhj.png" alt='' style={imgStyle} /></div>
            </div>
          </div>

          <div className='mr-8' style={colOuter} ref={el => (wrapRefs.current[2] = el)}>
            <div ref={el => (colRefs.current[2] = el)} style={innerImgContainer}>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766132/sc3_ropu29.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766131/sc4_dbza1r.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766132/sc3_ropu29.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766131/sc4_dbza1r.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766132/sc3_ropu29.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766131/sc4_dbza1r.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766132/sc3_ropu29.png" alt='' style={imgStyle} /></div>
              <div style={imgWrapStyle}><img src="https://res.cloudinary.com/dsjjdnife/image/upload/f_auto,q_auto/v1755766131/sc4_dbza1r.png" alt='' style={imgStyle} /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
 
