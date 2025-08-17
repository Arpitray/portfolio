import React, { useEffect, useRef } from 'react';
const DotGrid = ({ baseColor = '#E1E1E1', dotSize = 7, gap = 20, interactionRadius = 85 }) => {
  const canvasRef = useRef(null);
  const gridRef = useRef([]);
  const lettersRef = useRef([]);
  const lettersActiveRef = useRef(false);
  const rafRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement || document.body;
    const ctx = canvas.getContext('2d');

    // helper: hex -> {r,g,b}
    const hexToRgb = (hex) => {
      const h = hex.replace('#', '');
      const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
      const bigint = parseInt(full, 16);
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      };
    };

    const baseRgb = hexToRgb(baseColor);

    // Collect per-letter spans (do NOT split here) and compute their centers.
    // We wait for the Landing animation to finish (it dispatches 'landingTextAnimated')
    const initLetters = () => {
      const heading = parent.querySelector('h1');
      if (!heading) {
        lettersRef.current = [];
        return;
      }

      // find per-letter elements. Prefer explicit inner spans added by the
      // splitter (`data-letter`). Fallback: spans with no child elements and
      // exactly one visible character.
      const parentRect = parent.getBoundingClientRect();
      let letterEls = Array.from(heading.querySelectorAll('span[data-letter]'));
      if (!letterEls.length) {
        // fallback: spans that are leaf nodes and contain exactly one char
        letterEls = Array.from(heading.querySelectorAll('span')).filter((el) => {
          if (el.children && el.children.length) return false;
          const txt = (el.textContent || '').trim();
          return txt.length === 1;
        });
      }

      const list = [];
      letterEls.forEach((el) => {
        // prefer the outer wrapper (parent span) only if it's a simple wrapper
        // that contains this element as the only child; otherwise use the element itself.
        let wrapper = el;
        if (el.parentElement && el.parentElement.tagName.toLowerCase() === 'span' && el.parentElement.childElementCount === 1) {
          wrapper = el.parentElement;
        }
        const rect = el.getBoundingClientRect();
        const cx = rect.left - parentRect.left + rect.width / 2;
        const cy = rect.top - parentRect.top + rect.height / 2;
        list.push({ el: wrapper, cx, cy, targetY: 0, y: 0 });
      });
      lettersRef.current = list;
    };

    // Make canvas cover the parent only
    const fitToParent = () => {
      const rect = parent.getBoundingClientRect();
      // set canvas pixel size for crisp drawing
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      canvas.style.position = 'absolute';
      canvas.style.top = 0;
      canvas.style.left = 0;
      canvas.style.zIndex = 0; // sits behind the text which has z-10 in markup
      canvas.style.pointerEvents = 'none'; // don't block clicks on text
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  buildGrid(rect.width, rect.height);
  // recompute letter positions when size changes (only after landing animation)
  if (lettersActiveRef.current) initLetters();
    };

    const buildGrid = (width, height) => {
      const step = gap + dotSize;
      const cols = Math.ceil(width / step);
      const rows = Math.ceil(height / step);
      const startX = Math.floor((width - cols * step + step) / 2);
      const startY = Math.floor((height - rows * step + step) / 2);

      const points = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = startX + i * step + dotSize / 2;
          const y = startY + j * step + dotSize / 2;
          points.push({ x, y, baseR: dotSize / 2, r: dotSize / 2, targetR: dotSize / 2 });
        }
      }
      gridRef.current = points;
    };

    // Mouse interaction on parent; canvas has pointer-events:none so listen on parent
    const handleMove = (e) => {
      const rect = parent.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const points = gridRef.current;
      for (let k = 0; k < points.length; k++) {
        const p = points[k];
        const dx = p.x - mx;
        const dy = p.y - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < interactionRadius) {
          const grow = (1 - d / interactionRadius) * (p.baseR * 3);
          p.targetR = Math.min(p.baseR * 4, p.baseR + grow);
        } else {
          p.targetR = p.baseR;
        }
      }

      // affect only the nearest letter: find the closest letter and move it
      const letters = lettersRef.current;
      if (letters && letters.length) {
        let nearestIdx = -1;
        let nearestDist = Infinity;
        for (let i = 0; i < letters.length; i++) {
          const L = letters[i];
          const dx = L.cx - mx;
          const dy = L.cy - my;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < nearestDist) {
            nearestDist = d;
            nearestIdx = i;
          }
        }

        // threshold so a letter only moves when reasonably close
        const letterThreshold = Math.min(interactionRadius, 90);
        for (let i = 0; i < letters.length; i++) {
          const L = letters[i];
          if (i === nearestIdx && nearestDist < letterThreshold) {
            const strength = (1 - nearestDist / letterThreshold);
            L.targetY = -22 * strength;
          } else {
            L.targetY = 0;
          }
        }
      }
    };

    const handleLeave = () => {
      const points = gridRef.current;
      for (let k = 0; k < points.length; k++) points[k].targetR = points[k].baseR;

      const letters = lettersRef.current;
      if (letters && letters.length) for (let i = 0; i < letters.length; i++) letters[i].targetY = 0;
    };

    // Animation loop
    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const points = gridRef.current;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        // smooth interpolation towards target radius
        p.r += (p.targetR - p.r) * 0.18;

        // Compute a factor from 0..1 based on how much the dot has grown
        const maxGrow = p.baseR * 3; // same factor used when setting targetR
        const factor = Math.max(0, Math.min(1, (p.r - p.baseR) / maxGrow));

        // Interpolate color from baseColor to hoverColor (#252422) based on interaction factor
        const hoverRgb = hexToRgb('#0b3954');
        const rCol = Math.round(baseRgb.r * (1 - factor) + hoverRgb.r * factor);
        const gCol = Math.round(baseRgb.g * (1 - factor) + hoverRgb.g * factor);
        const bCol = Math.round(baseRgb.b * (1 - factor) + hoverRgb.b * factor);

        // Alpha for visibility; keep a minimum so small dots are visible
        const alpha = Math.max(0.28, Math.min(1, p.r / (p.baseR * 2)));

        ctx.beginPath();
        ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${alpha})`;
        ctx.arc(p.x, p.y, Math.max(0.2, p.r), 0, Math.PI * 2);
        ctx.fill();
      }

      // Animate letters (smooth translate) - only after landing animation flagged
      const letters = lettersRef.current;
      if (lettersActiveRef.current && letters && letters.length) {
        for (let i = 0; i < letters.length; i++) {
          const L = letters[i];
          L.y += (L.targetY - L.y) * 0.18;
          // apply transform (use translateY for subtle motion)
          if (L.el && L.el.style) L.el.style.transform = `translateY(${L.y}px)`;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // Setup observers & listeners
    fitToParent();
    parent.addEventListener('mousemove', handleMove);
    parent.addEventListener('mouseleave', handleLeave);

    // Resize observer for the parent element
    if (window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(() => {
        fitToParent();
      });
      resizeObserverRef.current.observe(parent);
    } else {
      window.addEventListener('resize', fitToParent);
    }

    // Listen for landing animation completion so we can (re-)init letter positions
    // keep a reference so cleanup can remove the listener without throwing.
    let landingListener = () => {
      try {
        // mark letters active so we don't apply transforms before GSAP entrance finishes
        lettersActiveRef.current = true;
        initLetters();
      } catch (err) {
        // swallow any init errors during teardown
      }
    };
    window.addEventListener('landingTextAnimated', landingListener);

    // start animation
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(draw);

    // cleanup
    return () => {
      // remove landing event listener safely
      try {
        window.removeEventListener('landingTextAnimated', landingListener);
      } catch (e) {
        // noop
      }
      cancelAnimationFrame(rafRef.current);
      parent.removeEventListener('mousemove', handleMove);
      parent.removeEventListener('mouseleave', handleLeave);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      else window.removeEventListener('resize', fitToParent);
      // reset any letter transforms
      const letters = lettersRef.current;
      if (letters && letters.length) {
        for (let i = 0; i < letters.length; i++) {
          const L = letters[i];
          if (L.el && L.el.style) {
            L.el.style.transform = '';
          }
        }
      }
    };
  }, [baseColor, dotSize, gap, interactionRadius]);

  // Canvas is positioned absolute; it must be placed as the first child of the hero block so z-index layering works.
  return <canvas ref={canvasRef} aria-hidden="true" />;
};

export default DotGrid;
