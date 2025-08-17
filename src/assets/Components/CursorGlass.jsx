import React, { useEffect, useRef } from 'react'

export default function CursorGlass({ size = 80, blur = 12, color = 'rgba(0,0,0,0.12)' }) {
  const elRef = useRef(null)
  const posRef = useRef({ x: -9999, y: -9999 })
  const targetRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef(null)

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    // Hide native cursor
    document.documentElement.style.cursor = 'none'

    // pointer tracking
    const onMove = (e) => {
      const x = e.clientX
      const y = e.clientY
      targetRef.current.x = x
      targetRef.current.y = y
      // make sure the glass is visible when pointer moves
      el.style.opacity = '1'
    }
    const onLeave = () => {
      // hide it when pointer leaves the window
      el.style.opacity = '0'
      targetRef.current.x = -9999
      targetRef.current.y = -9999
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerleave', onLeave)

    // Follow loop with easing (higher = snappier)
    const ease = 0.42
    const loop = () => {
      const p = posRef.current
      const t = targetRef.current
      p.x += (t.x - p.x) * ease
      p.y += (t.y - p.y) * ease
      // position the element offset so it centers on the pointer
      el.style.transform = `translate3d(${p.x - size/2}px, ${p.y - size/2}px, 0) scale(1)`
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(rafRef.current)
      document.documentElement.style.cursor = ''
    }
  }, [size])

  // The element uses pointer-events:none so it doesn't block interaction.
  // For "used to navigate" we keep native click behavior (so links still work)
  const svgSize = size
  const pathId = 'cursor-glass-path'
  const ringPadding = 12
  const radius = (svgSize - ringPadding * 2) / 2

  return (
    <div
  ref={elRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: size,
        height: size,
        borderRadius: '50%',
        pointerEvents: 'none',
        transform: 'translate3d(-9999px,-9999px,0)',
  transition: 'opacity 120ms ease, transform 80ms linear',
        opacity: 0,
  zIndex: 2000000,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  background: color,
  border: '1px solid rgba(0,0,0,0.22)',
  boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
  mixBlendMode: 'multiply',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <style>{`@keyframes cg-rotate{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        style={{
          overflow: 'visible',
          pointerEvents: 'none',
          transformOrigin: '50% 50%',
          animation: 'cg-rotate 8s linear infinite'
        }}
      >
        <defs>
          <path
            id={pathId}
            d={`M ${svgSize / 2} ${ringPadding} A ${radius} ${radius} 0 1 1 ${svgSize / 2 - 0.01} ${ringPadding}`}
          />
        </defs>
        <g fill="none" stroke="none">
          <text
            fill="#000000"
            fontSize={15}
            color='black'
            fontFamily="demo, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
          >
            <textPath href={`#${pathId}`} startOffset="0%">
              {Array(6).fill(' Scroll down • ').join(' ')}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  )
}
