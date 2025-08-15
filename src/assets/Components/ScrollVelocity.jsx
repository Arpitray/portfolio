import { useEffect, useRef } from "react";
import gsap from "gsap";

export const ScrollVelocity = ({
  // Keeping the same API so you can add behavior step-by-step later
  scrollContainerRef,
  texts = [],
  className = "",
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
  // New: control how fast the strip moves per wheel delta unit
  speed = 0.5,
  // Reserved props kept for compatibility (not used now)
  damping = 50,
  stiffness = 400,
  velocityMapping = { input: [-1000, 1000], output: [-50, 50] },
}) => {
  const scrollerRef = useRef(null);
  const wrapperRef = useRef(null);
  const xOffsetRef = useRef(0);

  useEffect(() => {
    const target = scrollContainerRef?.current || window;
    
    const centerStrip = () => {
      const containerEl = wrapperRef.current;
      const scrollerEl = scrollerRef.current;
      if (!containerEl || !scrollerEl) return;
      const containerWidth = containerEl.clientWidth;
      const contentWidth = scrollerEl.scrollWidth;
      const initialX = (containerWidth - contentWidth) / 2;
      xOffsetRef.current = initialX;
      gsap.set(scrollerEl, { x: initialX });
    };

    const onWheel = (e) => {
      // Positive deltaY -> scroll down -> move right
      // Negative deltaY -> scroll up -> move left
      const deltaX = e.deltaY * speed;
      xOffsetRef.current += deltaX;
      if (scrollerRef.current) {
        gsap.to(scrollerRef.current, {
          x: xOffsetRef.current,
          ease: "power3.out",
          duration: 0.6,
          overwrite: true,
        });
      }
    };

    target.addEventListener("wheel", onWheel, { passive: true });
    // Center once on mount (next frame to ensure layout is ready)
    const raf = requestAnimationFrame(centerStrip);
    // Re-center on resize to keep initial baseline centered
    window.addEventListener("resize", centerStrip);
    return () => {
      target.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", centerStrip);
    };
  }, [scrollContainerRef, speed]);

  return (
    <section>
      <div
        ref={wrapperRef}
        className={`${parallaxClassName} relative overflow-hidden`}
        style={parallaxStyle}
      >
        <div
          ref={scrollerRef}
          className={`${scrollerClassName} flex items-center text-center font-sans text-4xl font-bold tracking-[-0.02em] drop-shadow md:text-[5rem] md:leading-[5rem] whitespace-nowrap`}
          style={scrollerStyle}
        >
          {texts.map((text, index) => (
            <span className={`flex-shrink-0 py-8 ${className}`} key={index}>
              {text}&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollVelocity;


