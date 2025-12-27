import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import gsap from 'gsap'

export default function CursorGlass({ size = 56, blur = 8 }) {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const textRef = useRef(null)
  
  const [enabled, setEnabled] = useState(() => {
    try {
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 1024px)').matches
    } catch (e) { return false }
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = (e) => setEnabled(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  const [customText, setCustomText] = useState(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const location = useLocation()

  useEffect(() => {
    if (!enabled) {
      document.documentElement.style.cursor = ''
      return
    }

    document.documentElement.style.cursor = 'none'
    
    const dot = dotRef.current
    const ring = ringRef.current
    const text = textRef.current

    // GSAP QuickTo for high-performance trailing
    const xToDot = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" })
    const yToDot = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" })
    
    const xToRing = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3" })
    const yToRing = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3" })

    let lastX = 0
    let lastY = 0

    const onMove = (e) => {
      const { clientX: x, clientY: y } = e
      
      xToDot(x)
      yToDot(y)
      xToRing(x)
      yToRing(y)

      // Dynamic rotation speed based on velocity
      const dx = x - lastX
      const dy = y - lastY
      const velocity = Math.sqrt(dx * dx + dy * dy)
      const rotationSpeed = Math.max(10, 20 - velocity * 0.5)
      if (text) text.style.animationDuration = `${rotationSpeed}s`
      
      lastX = x
      lastY = y

      // Check for hoverable elements
      const target = e.target
      const isClickable = (el) => {
        if (!el) return false
        const style = window.getComputedStyle(el)
        if (style.cursor === 'pointer') return true
        const tag = el.tagName.toLowerCase()
        return ['a', 'button', 'input', 'label'].includes(tag) || el.closest('a, button, .clickable')
      }

      const hovering = isClickable(target)
      if (hovering !== isHovering) setIsHovering(hovering)
    }

    const onMouseDown = () => setIsMouseDown(true)
    const onMouseUp = () => setIsMouseDown(false)

    window.addEventListener('pointermove', onMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    const onCustomText = (e) => setCustomText(e.detail)
    window.addEventListener('cursorGlass:customText', onCustomText)

    const onHide = () => {
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 })
    }
    const onShow = () => {
      gsap.to([dot, ring], { opacity: 1, duration: 0.3 })
    }

    window.addEventListener('cursorGlass:hide', onHide)
    window.addEventListener('cursorGlass:show', onShow)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('cursorGlass:customText', onCustomText)
      window.removeEventListener('cursorGlass:hide', onHide)
      window.removeEventListener('cursorGlass:show', onShow)
      document.documentElement.style.cursor = ''
    }
  }, [enabled, isHovering])

  // Animations for state changes
  useEffect(() => {
    if (!enabled) return

    if (isMouseDown) {
      gsap.to(ringRef.current, { scale: 0.8, duration: 0.3, ease: "power3.out" })
      gsap.to(dotRef.current, { scale: 2.5, duration: 0.3, ease: "power3.out" })
    } else {
      // Keep consistent scale and appearance regardless of hover
      gsap.to(ringRef.current, { scale: 1, backgroundColor: 'rgba(0,0,0,0.05)', duration: 0.4, ease: "power3.out" })
      gsap.to(dotRef.current, { scale: 1, duration: 0.4, ease: "power3.out" })
    }
  }, [isMouseDown, enabled])

  if (!enabled) return null

  // Clamp and scale size so the cursor remains compact; default reduced for a tighter look
  const clampSize = Math.min(Math.max(typeof size === 'number' ? size : 56, 36), 90)
  const svgSize = clampSize
  // Circle text radius scaled to the cursor size (reduced multiplier for smaller ring)
  const radius = Math.max(5, Math.round(clampSize * 0.045))
  const pathId = 'cursor-text-path'

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 2147483647 }}>
      {/* The trailing glass ring */}
      <div
        ref={ringRef}
        style={{
          position: 'absolute',
          width: clampSize,
          height: clampSize,
          left: -clampSize / 2,
          top: -clampSize / 2,
          borderRadius: '50%',
          border: '1px solid rgba(0,0,0,0.06)',
          backdropFilter: `blur(${Math.max(4, blur)}px)`,
          WebkitBackdropFilter: `blur(${Math.max(4, blur)}px)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          willChange: 'transform',
        }}
      >
        {/* Rotating Text - Always visible for consistency */}
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          style={{
            position: 'absolute',
            animation: 'rotate 10s linear infinite',
            opacity: 1,
            transition: 'opacity 0.3s ease',
          }}
        >
          <defs>
            <path
              id={pathId}
              d={`M ${svgSize}, ${svgSize} m -${radius}, 0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
            />
          </defs>
          <text fill="#000" fontSize="10" fontWeight="600" letterSpacing="2" style={{ textTransform: 'uppercase' }}>
           
          </text>
        </svg>
      </div>

      {/* The precise center dot */}
      <div
        ref={dotRef}
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          left: -4,
          top: -4,
          backgroundColor: '#000',
          borderRadius: '50%',
          mixBlendMode: 'difference',
          zIndex: 1,
          willChange: 'transform',
        }}
      />

      <style>{`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
