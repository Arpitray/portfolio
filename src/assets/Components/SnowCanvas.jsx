import React, { useEffect, useRef } from 'react'

/**
 * SnowCanvas renders an animated particle (snow) field confined to its parent size.
 * It automatically resizes to match the parent (relative positioned) container.
 * Particles bounce on edges. On hover/mouse move, nearby particles are repelled.
 * When mouse leaves, particles return to their initial positions.
 */
// extraMargin: logical off-screen world extension on each side (not enlarging the canvas element itself)
// Particles can start & move in this hidden margin and flow into the visible area.
function SnowCanvas({ particleCount = 1000, maxRadius = 3, extraMargin = 220 }) {
  const canvasRef = useRef(null)
  const parentRef = useRef(null)
  const mouse = useRef({ x: null, y: null, inside: false, lastX: null, prevX: null, prevY: null })
  const particlesRef = useRef([])
  const initialPositionsRef = useRef([])
  const frameRef = useRef(0)
  const resizeObserverRef = useRef(null)
  const isResettingRef = useRef(false)

  // Initialize particles for given width/height
  const initParticles = (worldW, worldH, visW, visH) => {
    const arr = []
    const initialPositions = []
    for (let i = 0; i < particleCount; i++) {
      // Start anywhere in extended world (including hidden margins)
      const x = Math.random() * worldW - extraMargin
      const y = Math.random() * worldH - extraMargin
      // Bias a portion to spawn just outside edges so they drift in
      const edgeSpawnChance = 0.2
      let sx = x, sy = y
      if (Math.random() < edgeSpawnChance) {
        const edge = Math.floor(Math.random() * 4)
        if (edge === 0) sx = -extraMargin + Math.random() * extraMargin // left band
        if (edge === 1) sx = visW + Math.random() * extraMargin       // right band
        if (edge === 2) sy = -extraMargin + Math.random() * extraMargin // top band
        if (edge === 3) sy = visH + Math.random() * extraMargin       // bottom band
      }
      const particle = {
        x: sx,
        y: sy,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        r: Math.random() * (maxRadius - 1) + 1,
      }
      arr.push(particle)
      // Store initial position
      initialPositions.push({ x: sx, y: sy })
    }
    particlesRef.current = arr
    initialPositionsRef.current = initialPositions
  }

  // Reset particles to initial positions
  const resetParticles = () => {
    if (isResettingRef.current) return
    isResettingRef.current = true
    
    const particles = particlesRef.current
    const initialPositions = initialPositionsRef.current
    
    if (particles.length !== initialPositions.length) return
    
    // Animate particles back to initial positions with smooth movement
    const resetDuration = 2500 // 2.5 seconds for smoother movement
    const startTime = Date.now()
    
    const animateReset = () => {
      if (!isResettingRef.current) return // Stop if interrupted
      
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / resetDuration, 1)
      // Use smoother easing function for more natural movement
      const easeProgress = 1 - Math.pow(1 - progress, 4) // Ease out quartic for smoother deceleration
      
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]
        const initial = initialPositions[i]
        
        // Smooth interpolation with smaller steps
        const dx = initial.x - particle.x
        const dy = initial.y - particle.y
        
        particle.x += dx * 0.02 // Smaller step size for smoother movement
        particle.y += dy * 0.02
        
        // Gradually reduce velocity more smoothly
        particle.vx *= 0.98
        particle.vy *= 0.98
      }
      
      if (progress < 1 && isResettingRef.current) {
        requestAnimationFrame(animateReset)
      } else {
        // Ensure exact final positions only if reset completed
        if (isResettingRef.current) {
          for (let i = 0; i < particles.length; i++) {
            const particle = particles[i]
            const initial = initialPositions[i]
            particle.x = initial.x
            particle.y = initial.y
            particle.vx = 0
            particle.vy = 0
          }
        }
        isResettingRef.current = false
      }
    }
    
    animateReset()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas.parentElement
    parentRef.current = parent
    const ctx = canvas.getContext('2d')

    function resize() {
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const visW = rect.width
      const visH = rect.height
      const worldW = visW + extraMargin * 2
      const worldH = visH + extraMargin * 2
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      canvas.width = visW * dpr
      canvas.height = visH * dpr
      canvas.style.width = visW + 'px'
      canvas.style.height = visH + 'px'
      canvas.style.left = '0px'
      canvas.style.top = '0px'
      ctx.scale(dpr, dpr)
      initParticles(worldW, worldH, visW, visH)
    }

    resizeObserverRef.current = new ResizeObserver(resize)
    resizeObserverRef.current.observe(parent)

    const handleMouseMove = (e) => {
      const rect = parent.getBoundingClientRect()
      const relX = e.clientX - rect.left
      const relY = e.clientY - rect.top
      mouse.current.prevX = mouse.current.x
      mouse.current.prevY = mouse.current.y
      mouse.current.lastX = relX
      mouse.current.x = relX
      mouse.current.y = relY
      mouse.current.inside = true
      // Stop reset animation when mouse enters
      if (isResettingRef.current) {
        isResettingRef.current = false
      }
    }
    const handleMouseLeave = () => {
      mouse.current.inside = false
      resetParticles()
    }

    parent.addEventListener('mousemove', handleMouseMove)
    parent.addEventListener('mouseleave', handleMouseLeave)

    function update() {
      const rect = parent.getBoundingClientRect()
  const visW = rect.width
  const visH = rect.height
  const worldLeft = -extraMargin
  const worldRight = visW + extraMargin
  const worldTop = -extraMargin
  const worldBottom = visH + extraMargin
  ctx.clearRect(0, 0, visW, visH)

  const { x: mx, y: my, inside, prevX, prevY } = mouse.current
      const repelRadius = 30
      const repelForce = 0.3
      // Mouse deltas for immediate subtle push (X & Y)
      let mouseDeltaX = 0, mouseDeltaY = 0
      if (inside && prevX != null && mx != null) mouseDeltaX = mx - prevX
      if (inside && prevY != null && my != null) mouseDeltaY = my - prevY
      // Scale deltas into small forces (-base to +base)
      const baseForce = 0.6 // adjust for stronger/weaker response
      const cap = 40
      const cappedX = Math.max(-cap, Math.min(cap, mouseDeltaX))
      const cappedY = Math.max(-cap, Math.min(cap, mouseDeltaY))
      const directionalPushX = (cappedX / cap) * baseForce
      const directionalPushY = (cappedY / cap) * baseForce
      // Convert mouse position into world coordinates (offset by extraMargin)
      const mxWorld = mx != null ? mx : null
      const myWorld = my != null ? my : null

             for (const p of particlesRef.current) {
         // If resetting, only draw particles without physics
         if (isResettingRef.current) {
           // Draw only if in visible viewport
           if (p.x < 0 || p.x > visW || p.y < 0 || p.y > visH) continue
           ctx.beginPath()
           ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
           ctx.fillStyle = 'rgba(255,255,255,0.9)'
           ctx.fill()
           continue
         }

        // Interaction
        if (inside && mxWorld != null) {
          const dx = p.x - mxWorld
            , dy = p.y - myWorld
            , dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < repelRadius && dist > 0.0009) {
            const f = (repelRadius - dist) / repelRadius * repelForce
            p.vx += (dx / dist) * f
            p.vy += (dy / dist) * f
          }
        }
        // Immediate pushes tied to current cursor movement (small & quick)
        if (directionalPushX !== 0) {
          p.vx += directionalPushX * (0.7 + Math.random() * 0.3)
        }
        if (directionalPushY !== 0) {
          p.vy += directionalPushY * (0.7 + Math.random() * 0.3)
        }
        // Ambient floating motion (stronger than before to keep scene alive)
        p.vx += (Math.random() - 0.5) * 0.09
        p.vy += (Math.random() - 0.5) * 0.09
        // Adaptive damping: stronger damping when cursor stops moving (both axes idle)
        const moving = (directionalPushX !== 0) || (directionalPushY !== 0)
        if (!moving) {
          // Allow more lingering drift for natural motion
          p.vx *= 0.96
          p.vy *= 0.965
          // Clamp residual horizontal velocity near side edges
          if (inside && mx != null && (mx < 30 || (visW - mx) < 30) && Math.abs(p.vx) < 0.25) {
            p.vx *= 0.6
          }
          // Clamp residual vertical velocity near top/bottom edges
          if (inside && my != null && (my < 30 || (visH - my) < 30) && Math.abs(p.vy) < 0.25) {
            p.vy *= 0.6
          }
        } else {
          // Normal friction when moving (slightly lower damping for smoother flow)
          p.vx *= 0.988
          p.vy *= 0.988
        }
        // Limit velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        const maxSpeed = 1.5
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed
          p.vy = (p.vy / speed) * maxSpeed
        }
        p.x += p.vx
        p.y += p.vy
        // Bounce edges in extended world
        if (p.x <= worldLeft + p.r) { p.x = worldLeft + p.r; p.vx = Math.abs(p.vx) }
        if (p.x >= worldRight - p.r) { p.x = worldRight - p.r; p.vx = -Math.abs(p.vx) }
        if (p.y <= worldTop + p.r) { p.y = worldTop + p.r; p.vy = Math.abs(p.vy) }
        if (p.y >= worldBottom - p.r) { p.y = worldBottom - p.r; p.vy = -Math.abs(p.vy) }

        // Draw only if in visible viewport
        if (p.x < 0 || p.x > visW || p.y < 0 || p.y > visH) continue

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.fill()
      }

  frameRef.current = requestAnimationFrame(update)
    }

    frameRef.current = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(frameRef.current)
      parent.removeEventListener('mousemove', handleMouseMove)
      parent.removeEventListener('mouseleave', handleMouseLeave)
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect()
    }
  }, [particleCount, maxRadius])

  return (
    <canvas
      ref={canvasRef}
      // Ensure parent: className="relative overflow-hidden" so off-screen particles stay hidden until entering.
      className="absolute inset-0 z-30 pointer-events-none"
      aria-hidden="true"
    />
  )
}

export default SnowCanvas
