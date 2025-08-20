import React, { useEffect, useRef } from 'react'

export default function PlayGround() {
  // You swapped the previous folder with `virtual project`.
  // Spaces in folder names must be URL-encoded when used in `src`.
  // If possible, it's better to rename the folder to remove spaces (recommended).
  // Example PowerShell to rename: Rename-Item -Path "public/PlayGround/virtual project" -NewName "virtual-project"
  const iframeSrc = '/PlayGround/virtual%20project/index.html'

  const containerRef = useRef(null)
  const iframeRef = useRef(null)

  useEffect(() => {
    // Smooth fade-in + slight upward motion when loader completes.
    const show = () => {
      const el = containerRef.current
      if (!el) return
      // Apply transition only once and set final visible state
      el.style.transition = 'opacity 600ms cubic-bezier(.22,.9,.2,1), transform 600ms cubic-bezier(.22,.9,.2,1)'
      el.style.opacity = '1'
      el.style.transform = 'translateY(0)'
    }
    let attached = false
    if (typeof window !== 'undefined' && window.__loaderComplete) {
      requestAnimationFrame(() => show())
    } else {
      window.addEventListener('loaderComplete', show)
      attached = true
    }

    // fallback: show after a short delay in case events are missed
    const t = setTimeout(() => show(), 120)

    return () => {
      if (attached) window.removeEventListener('loaderComplete', show)
      clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const iframeEl = iframeRef.current
    if (!iframeEl) return

    const hideEvt = new CustomEvent('cursorGlass:hide')
    const showEvt = new CustomEvent('cursorGlass:show')

    const onEnter = () => window.dispatchEvent(hideEvt)
    const onLeave = () => window.dispatchEvent(showEvt)

    // hide when pointer enters the iframe element
    iframeEl.addEventListener('pointerenter', onEnter)
    iframeEl.addEventListener('pointerleave', onLeave)

    // if iframe is same-origin, also listen to its pointermove/leave so the glass remains hidden
    let cw = null
    try {
      cw = iframeEl.contentWindow
      if (cw && cw.addEventListener) {
        // keep it hidden while pointer moves inside
        cw.addEventListener('pointermove', onEnter)
        cw.addEventListener('pointerleave', onLeave)
      }
    } catch (e) {
      // cross-origin iframe will throw; ignore silently
    }

    return () => {
      iframeEl.removeEventListener('pointerenter', onEnter)
      iframeEl.removeEventListener('pointerleave', onLeave)
      try {
        if (cw && cw.removeEventListener) {
          cw.removeEventListener('pointermove', onEnter)
          cw.removeEventListener('pointerleave', onLeave)
        }
      } catch (e) {}
    }
  }, [iframeRef.current])

  return (
    <main style={{ minHeight: '100vh', background: '#E1E1E1' }}>
      <div
        ref={containerRef}
        style={{
          height: '100vh',
          width: '100%',
          opacity: 0,
          transform: 'translateY(8px)'
        }}
      >
        <iframe
          title="Playground - embedded site"
          src={iframeSrc}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block'
          }}
          allowFullScreen
        />

        {/* Fallback / helper UI for when the iframe fails to load */}
        <noscript style={{ display: 'none' }}>
          Please enable JavaScript to view the embedded playground.
        </noscript>
      </div>
    </main>
  )
}
