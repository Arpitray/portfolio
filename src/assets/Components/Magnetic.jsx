import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Magnetic({ children, strength = 0.5 }) {
  const containerRef = useRef(null)
  const innerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const inner = innerRef.current
    if (!container || !inner) return

    const xTo = gsap.quickTo(inner, "x", { duration: 1, ease: "elastic.out(1, 0.3)" })
    const yTo = gsap.quickTo(inner, "y", { duration: 1, ease: "elastic.out(1, 0.3)" })

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e
      const { width, height, left, top } = container.getBoundingClientRect()
      const x = clientX - (left + width / 2)
      const y = clientY - (top + height / 2)
      xTo(x * strength)
      yTo(y * strength)
    }

    const handleMouseLeave = () => {
      xTo(0)
      yTo(0)
    }

    container.addEventListener("mousemove", handleMouseMove)
    container.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      container.removeEventListener("mousemove", handleMouseMove)
      container.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [strength])

  return (
    <div ref={containerRef} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <div ref={innerRef} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  )
}
