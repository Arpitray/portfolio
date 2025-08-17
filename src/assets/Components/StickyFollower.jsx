import React, { useEffect, useRef } from 'react';
import stickyImg from './sticky.png';

const StickyFollower = ({ parentSelector = null, offset = { x: 2, y: 2 }, ease = 0.16 }) => {
  const elRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const hiddenRef = useRef(false);
  const rafRef = useRef(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // track element size so we can center the image under the cursor
    const sizeRef = { w: el.offsetWidth || 0, h: el.offsetHeight || 0 };
    const updateSize = () => {
      sizeRef.w = el.offsetWidth || el.getBoundingClientRect().width || sizeRef.w;
      sizeRef.h = el.offsetHeight || el.getBoundingClientRect().height || sizeRef.h;
    };
    // if the image isn't loaded yet, wait for load
    if (!sizeRef.w || !sizeRef.h) {
      const onLoad = () => updateSize();
      el.addEventListener('load', onLoad);
      // remove listener in cleanup (added later)
    }
    // also update on window resize
    const onResize = () => updateSize();
    window.addEventListener('resize', onResize);
    updateSize();

    const parent = parentSelector ? document.querySelector(parentSelector) : document.body;
    if (!parent) return;

    // position the element fixed when attached to body so it follows across the site
    el.style.position = parent === document.body ? 'fixed' : 'absolute';
    // pin to top-left so translate coordinates map to viewport when fixed
    if (parent === document.body) {
      el.style.top = '-20px';
      el.style.left = '-22px';
    } else {
      el.style.top = '14px';
      el.style.left = '0';
    }
    el.style.pointerEvents = 'none';
    el.style.zIndex = 60;
    el.style.transform = 'translate3d(0,0,0)';
    // use opacity to show/hide smoothly; no movement when hiding
    el.style.transition = 'opacity 180ms ease';
    // start hidden to avoid flashing at top-left on initial load
    el.style.opacity = '0';
    hiddenRef.current = true;

    // Use pointer events for broader device support
    const onPointerMove = (e) => {
      const rect = parent.getBoundingClientRect();
      // clientX/Y are viewport-relative; subtract parent rect when not attached to body
      const baseX = parent === document.body ? 0 : rect.left;
      const baseY = parent === document.body ? 0 : rect.top;
      // place the image top-left exactly at the cursor (plus optional offset)
      posRef.current.tx = e.clientX - baseX + offset.x;
      posRef.current.ty = e.clientY - baseY + offset.y;

      // if currently hidden (opacity 0), snap the follower to cursor and fade in
      if (hiddenRef.current) {
        hiddenRef.current = false;
        // snap immediately
        posRef.current.x = posRef.current.tx;
        posRef.current.y = posRef.current.ty;
        el.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
        // fade in
        el.style.opacity = '1';
      }
    };

    const onPointerLeave = () => {
      // hide via opacity only (do not move); keep current tx/ty so re-enter snaps
      hiddenRef.current = true;
      el.style.opacity = '0';
    };

    parent.addEventListener('pointermove', onPointerMove);
    parent.addEventListener('pointerleave', onPointerLeave);

    // When scrolling, browsers sometimes throttle rAF; snap follower to target to avoid freezing
    const onScroll = () => {
      posRef.current.x = posRef.current.tx;
      posRef.current.y = posRef.current.ty;
      el.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const loop = () => {
      posRef.current.x += (posRef.current.tx - posRef.current.x) * ease;
      posRef.current.y += (posRef.current.ty - posRef.current.y) * ease;
      el.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      parent.removeEventListener('pointermove', onPointerMove);
      parent.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [parentSelector, offset.x, offset.y, ease]);

  return (
    <img
      ref={elRef}
      src={stickyImg}
      alt=""
      style={{
        width: 96,
        height: 'auto',
        display: 'block',
        opacity: 0, // start hidden to avoid flash before JS runs
        pointerEvents: 'none',
        transform: 'translate3d(0,0,0)'
      }}
    />
  );
};

export default StickyFollower;
