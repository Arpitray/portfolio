import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

export const ScrollVelocity = ({
  scrollContainerRef,
  texts = [],
  className = "",
  damping = 50,
  stiffness = 400,
  velocityMapping = { input: [-1000, 1000], output: [-50, 50] },
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
}) => {
  function VelocityText({
    children,
    scrollContainerRef,
    className = "",
    damping,
    stiffness,
    velocityMapping,
    parallaxClassName,
    scrollerClassName,
    parallaxStyle,
    scrollerStyle,
  }) {
    const scrollOptions = scrollContainerRef
      ? { container: scrollContainerRef }
      : {};
    const { scrollY } = useScroll(scrollOptions);
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
      damping: damping ?? 50,
      stiffness: stiffness ?? 600,
    });
    
    // Transform scroll velocity to translateX offset (no infinite movement)
    const x = useTransform(
      smoothVelocity,
      velocityMapping?.input || [-1000, 1000],
      velocityMapping?.output || [-50, 50],
      { clamp: false }
    );

    const copyRef = useRef(null);

    // Only need one copy since we're not doing infinite scroll
    const spans = [
      <span
        className={`flex-shrink-0 ${className}`}
        key={0}
        ref={copyRef}
      >
        {children}
      </span>
    ];

    return (
      <div
        className={`${parallaxClassName} relative overflow-hidden`}
        style={parallaxStyle}
      >
        <motion.div
          className={`${scrollerClassName} flex justify-center items-center text-center font-sans text-4xl font-bold tracking-[-0.02em] drop-shadow md:text-[5rem] md:leading-[5rem]`}
          style={{ translateX: x, ...scrollerStyle }}
        >
          {spans}
        </motion.div>
      </div>
    );
  }

  return (
    <section>
      {texts.map((text, index) => (
        <VelocityText
          key={index}
          className={className}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
        >
          {text}&nbsp;
        </VelocityText>
      ))}
    </section>
  );
};

export default ScrollVelocity;


