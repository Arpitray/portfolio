import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function CursorGlass({ size = 80, blur = 12, color = 'rgba(0,0,0,0.12)' }) {
  const elRef = useRef(null)
  // only enable on large viewports (desktop). Mobile/tablet will have this disabled.
  const [enabled, setEnabled] = useState(() => {
    try {
      return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 1024px)').matches
    } catch (error) { 
      console.warn('Failed to detect desktop:', error)
      return false 
    }
  })
  // keep a listener so changing orientation/resize updates enablement
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = (e) => setEnabled(e.matches)
    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else if (mql.addListener) mql.addListener(onChange)
    return () => {
      try { if (mql.removeEventListener) mql.removeEventListener('change', onChange) } catch (error) {
        console.warn('Failed to remove event listener:', error)
      }
      try { if (mql.removeListener) mql.removeListener(onChange) } catch (error) {
        console.warn('Failed to remove listener:', error)
      }
    }
  }, [])
  const posRef = useRef({ x: -9999, y: -9999 })
  const targetRef = useRef({ x: -9999, y: -9999 })
  const rafRef = useRef(null)
  const hiddenRef = useRef(false)
  const lastPointerRef = useRef({ x: -9999, y: -9999 })
  const clickableHideRef = useRef(false)
  const [customText, setCustomText] = useState(null)
  const location = useLocation()

  // Hide the glass cursor completely on certain full-page embeds/routes
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    try {
      const shouldHide = location && (location.pathname && (location.pathname.startsWith('/playground') || location.pathname.startsWith('/visions')))
      if (shouldHide) {
        // Hide glass and restore native cursor
        el.style.opacity = '0'
        el.style.transition = 'opacity 0ms'
        document.documentElement.style.cursor = ''
        hiddenRef.current = true
      } else {
        // Allow the glass to show again; restore hidden state to false so main effect can manage visibility
        hiddenRef.current = false
  // re-enable hiding transition for normal behavior (no transform easing)
  el.style.transition = 'opacity 120ms ease'
        // hide native cursor again so glass can manage appearance
        try { document.documentElement.style.cursor = 'none' } catch (error) {
          console.warn('Failed to hide cursor:', error)
        }
      }
    } catch (error) {
      console.warn('Failed to handle route-based cursor visibility:', error)
    }
  }, [location])

  // Don't exit early here; keep hooks order stable across renders.

  useEffect(() => {
    const el = elRef.current
    if (!el) return

    // If disabled (mobile/tablet), skip attaching listeners
    if (!enabled) {
      try { document.documentElement.style.cursor = '' } catch (error) {
        console.warn('Failed to restore cursor:', error)
      }
      return
    }

    // Hide native cursor
    document.documentElement.style.cursor = 'none'

    // Handlers for external show/hide requests (e.g., hovering navbar)
    const onHide = () => {
      try {
        hiddenRef.current = true
        el.style.opacity = '0'
        document.documentElement.style.cursor = ''
      } catch (error) {
        console.warn('Failed to hide cursor glass:', error)
      }
    }

    const onShow = () => {
      try {
        hiddenRef.current = false
        // Immediately snap the glass to the last known pointer position so it
        // appears exactly under the cursor when it reappears.
        const last = lastPointerRef.current || { x: -9999, y: -9999 }
        // keep hidden until fade completes to avoid chasing
        hiddenRef.current = true
        // place slightly below the cursor so it visually rises into place
        const startY = last.y + Math.max(8, Math.round(size * 0.12))
        targetRef.current.x = last.x
        targetRef.current.y = last.y
        posRef.current.x = last.x
        posRef.current.y = last.y
        document.documentElement.style.cursor = 'none'
        // start with opacity 0 and positioned below pointer
  // animate opacity only; movement will snap immediately via RAF loop
  el.style.transition = 'opacity 160ms ease'
        // set posRef to the start position so RAF loop doesn't pull from the old position
        posRef.current.x = last.x
        posRef.current.y = startY
        el.style.transform = `translate3d(${last.x - size/2}px, ${startY - size/2}px, 0) scale(1)`
        el.style.opacity = '0'

        // force a reflow so the transition will run
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight

        // animate into centered position and fade in
        requestAnimationFrame(() => {
          // targetRef already set to last pointer; RAF loop will smoothly interpolate
          el.style.transform = `translate3d(${last.x - size/2}px, ${last.y - size/2}px, 0) scale(1)`
          el.style.opacity = '1'
        })

        // after transition ends, allow pointermove to control glass again
        setTimeout(() => {
          hiddenRef.current = false
        }, 180)
      } catch (error) {
        console.warn('Failed to show cursor glass:', error)
      }
    }

    // Handler for custom text updates
    const onCustomText = (event) => {
      setCustomText(event.detail)
    }

    window.addEventListener('cursorGlass:hide', onHide)
    window.addEventListener('cursorGlass:show', onShow)
    window.addEventListener('cursorGlass:customText', onCustomText)
    const onMove = (e) => {
      const x = e.clientX
      const y = e.clientY
      // always record last pointer position even when hidden
      lastPointerRef.current.x = x
      lastPointerRef.current.y = y
      
      // Check if hovering over contact image
      const elementUnderCursor = document.elementFromPoint(x, y)
      const isOverContactImage = elementUnderCursor && (
        elementUnderCursor.classList.contains('contact-image') ||
        elementUnderCursor.closest('.polaroid-container')
      )
      
      if (isOverContactImage && customText !== 'DRAG') {
        setCustomText('DRAG')
      } else if (!isOverContactImage && customText === 'DRAG') {
        setCustomText(null)
      }
      
      // determine if cursor is over a clickable element; if so, show native pointer and hide glass
      const isClickableNode = (node) => {
        try {
          let el = node
          while (el) {
            if (!el.tagName) return false
            const tag = el.tagName.toLowerCase()
            if (['a', 'button', 'input', 'textarea', 'select', 'label'].includes(tag)) return true
            const role = el.getAttribute && el.getAttribute('role')
            if (role === 'button') return true
            if (el.getAttribute && el.getAttribute('onclick')) return true
            if (el.tabIndex >= 0) return true
            if (el.contentEditable === 'true') return true
            el = el.parentElement
          }
        } catch (error) {
          console.warn('Failed to check clickable element:', error)
        }
        return false
      }

      const clickable = isClickableNode(elementUnderCursor)
      if (clickable && !clickableHideRef.current) {
        clickableHideRef.current = true
        try { document.documentElement.style.cursor = '' } catch (error) {
          console.warn('Failed to show native cursor:', error)
        }
        try { el.style.opacity = '0' } catch (error) {
          console.warn('Failed to hide glass:', error)
        }
        // don't update target while native pointer is shown
        return
      }

      if (!clickable && clickableHideRef.current) {
        clickableHideRef.current = false
        if (!hiddenRef.current) {
          try { document.documentElement.style.cursor = 'none' } catch (error) {
            console.warn('Failed to hide native cursor:', error)
          }
          try { el.style.opacity = '1' } catch (error) {
            console.warn('Failed to show glass:', error)
          }
        }
      }

      // if an external hide is active, or we're intentionally hidden over a clickable, don't update the visible target
      if (hiddenRef.current || clickableHideRef.current) return
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

    // Also listen for pointer events inside same-origin iframes (e.g. the Playground embed).
    // For same-origin iframes we can access contentWindow and map client coords to parent viewport.
    const iframeListeners = []
    try {
      const iframes = Array.from(document.querySelectorAll('iframe'))
      iframes.forEach((iframe) => {
        try {
          const cw = iframe.contentWindow
          if (!cw) return

          const onIframeMove = (e) => {
            // e.clientX/Y are relative to the iframe viewport; convert to parent viewport
            const rect = iframe.getBoundingClientRect()
            const x = rect.left + e.clientX
            const y = rect.top + e.clientY
            lastPointerRef.current.x = x
            lastPointerRef.current.y = y
            // if an external hide is active or we are intentionally hidden, don't update visible target
            if (hiddenRef.current) return
            targetRef.current.x = x
            targetRef.current.y = y
            el.style.opacity = '1'
          }

          const onIframeLeave = () => {
            el.style.opacity = '0'
            targetRef.current.x = -9999
            targetRef.current.y = -9999
          }

          // helper to check if element or its ancestors are interactive/clickable
          const isClickable = (node) => {
            try {
              let el = node
              while (el && el !== iframe.contentDocument) {
                if (!el || !el.tagName) return false
                const tag = el.tagName.toLowerCase()
                if (['a', 'button', 'input', 'textarea', 'select', 'label'].includes(tag)) return true
                const role = el.getAttribute && el.getAttribute('role')
                if (role === 'button') return true
                if (el.getAttribute && el.getAttribute('onclick')) return true
                if (el.tabIndex >= 0) return true
                if (el.contentEditable === 'true') return true
                el = el.parentElement
              }
            } catch (error) {
              console.warn('Failed to check iframe clickable element:', error)
            }
            return false
          }

          const onIframePointerOver = (e) => {
            try {
              const clickable = isClickable(e.target)
              if (clickable) {
                // hide glass and show native pointer when over interactive elements
                clickableHideRef.current = true
                onHide()
              } else {
                // show glass when over non-interactive areas
                clickableHideRef.current = false
                onShow()
                // ensure position updates immediately
                const rect = iframe.getBoundingClientRect()
                const x = rect.left + (e.clientX || 0)
                const y = rect.top + (e.clientY || 0)
                lastPointerRef.current.x = x
                lastPointerRef.current.y = y
                targetRef.current.x = x
                targetRef.current.y = y
              }
            } catch (error) {
              console.warn('Failed to handle iframe pointer over:', error)
            }
          }

          const onIframePointerOut = (e) => {
            // when pointer leaves an element, check if now over something clickable via relatedTarget
            try {
              const related = e.relatedTarget
              const nowClickable = related && isClickable(related)
              if (nowClickable) {
                clickableHideRef.current = true
                onHide()
              } else {
                clickableHideRef.current = false
                onShow()
              }
            } catch (error) {
              console.warn('Failed to handle iframe pointer out:', error)
            }
          }

          // add listeners on the iframe's window so internal pointer moves are caught
          cw.addEventListener('pointermove', onIframeMove)
          cw.addEventListener('pointerleave', onIframeLeave)
          cw.addEventListener('pointerover', onIframePointerOver)
          cw.addEventListener('pointerout', onIframePointerOut)
          cw.addEventListener('pointerdown', (e) => {
            // ensure native pointer when clicking interactive elements inside iframe
            try { if (isClickable(e.target)) { clickableHideRef.current = true; onHide() } } catch (error) {
              console.warn('Failed to handle iframe click:', error)
            }
          })

          // also handle when pointer leaves the iframe element itself
          iframe.addEventListener('pointerleave', onIframeLeave)

          iframeListeners.push({ iframe, cw, onIframeMove, onIframeLeave, onIframePointerOver, onIframePointerOut })
        } catch (error) {
          console.warn('Cross-origin iframe access denied:', error)
        }
      })
    } catch (error) {
      console.warn('Failed to setup iframe listeners:', error)
    }

    // Follow loop with immediate snapping (no easing) so the glass follows the pointer exactly.
    const loop = () => {
      const p = posRef.current
      const t = targetRef.current

      // If target is sentinel off-screen, jump instantly
      if (t.x === -9999 && t.y === -9999) {
        p.x = t.x
        p.y = t.y
      } else {
        // Immediate follow — no interpolation
        p.x = t.x
        p.y = t.y
      }

      // position the element offset so it centers on the pointer
      el.style.transform = `translate3d(${p.x - size/2}px, ${p.y - size/2}px, 0) scale(1)`
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('cursorGlass:hide', onHide)
      window.removeEventListener('cursorGlass:show', onShow)
      window.removeEventListener('cursorGlass:customText', onCustomText)
      cancelAnimationFrame(rafRef.current)
      // cleanup iframe listeners
      try {
        iframeListeners.forEach(({ iframe, cw, onIframeMove, onIframeLeave }) => {
          try { if (cw && cw.removeEventListener) cw.removeEventListener('pointermove', onIframeMove) } catch (error) {
            console.warn('Failed to remove iframe pointermove listener:', error)
          }
          try { if (cw && cw.removeEventListener) cw.removeEventListener('pointerleave', onIframeLeave) } catch (error) {
            console.warn('Failed to remove iframe pointerleave listener:', error)
          }
          try { iframe.removeEventListener('pointerleave', onIframeLeave) } catch (error) {
            console.warn('Failed to remove iframe element listener:', error)
          }
        })
      } catch (error) {
        console.warn('Failed to cleanup iframe listeners:', error)
      }
      document.documentElement.style.cursor = ''
    }
  }, [size, enabled])

  // The element uses pointer-events:none so it doesn't block interaction.
  // For "used to navigate" we keep native click behavior (so links still work)
  const svgSize = size
  const pathId = 'cursor-glass-path'
  const ringPadding = 12
  const radius = (svgSize - ringPadding * 2) / 2

  // Now it's safe to short-circuit render after all hooks are declared
  if (!enabled) return null

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
  transition: 'opacity 120ms ease',
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
              {customText ? Array(8).fill(` ${customText} • `).join(' ') : Array(6).fill(' Scroll down • ').join(' ')}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  )
}
