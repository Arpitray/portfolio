import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import LogoLoop from './LogoLoop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss, SiPostgresql, SiPrisma, SiNodedotjs, SiDailymotion, SiFramer, SiVite, SiGit, SiGithub, SiVercel, SiSupabase, SiExpress,SiMongodb,SiPostman } from 'react-icons/si';

// Tooltip wrapper component that works with moving elements
const LogoWithTooltip = ({ children, title }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);
  const rafRef = useRef(null);
  const isHoveredRef = useRef(false);
  const isMobileRef = useRef(false);

  useEffect(() => {
    // Check if mobile/tablet (no hover support)
    isMobileRef.current = window.matchMedia('(max-width: 1024px)').matches || 
                          !window.matchMedia('(hover: hover)').matches;
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const updatePosition = (element) => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    });
  };

  const handleMouseEnter = (e) => {
    // Skip tooltip on mobile/tablet devices
    if (isMobileRef.current) return;
    
    isHoveredRef.current = true;
    setShowTooltip(true);
    const element = e.currentTarget;
    
    // Update position immediately
    updatePosition(element);
    
    // Keep updating position while hovered (for moving elements)
    const animate = () => {
      if (element && isHoveredRef.current) {
        updatePosition(element);
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
    setShowTooltip(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  return (
    <>
      <span
        ref={elementRef}
        className="inline-flex items-center cursor-pointer font-['dk']"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {children}
      </span>
      {showTooltip && !isMobileRef.current && createPortal(
        <div 
          className="fixed whitespace-nowrap pointer-events-none font-['dk'] tracking-widest"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 99999,
            animation: 'tooltipFadeIn 0.15s ease-out'
          }}
        >
          <div 
            className="bg-black text-white px-3 py-1.5 rounded-md text-lg font-medium shadow-xl mb-1font-['dk2']"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.92)',
              backdropFilter: 'blur(4px)'
            }}
          >
            {title}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

const techLogos = [
  { 
    node: <LogoWithTooltip title="React"><SiReact /></LogoWithTooltip>, 
    title: "React", 
    href: "https://react.dev" 
  },
  { 
    node: <LogoWithTooltip title="Next.js"><SiNextdotjs /></LogoWithTooltip>, 
    title: "Next.js", 
    href: "https://nextjs.org" 
  },
  { 
    node: <LogoWithTooltip title="TypeScript"><SiTypescript /></LogoWithTooltip>, 
    title: "TypeScript", 
    href: "https://www.typescriptlang.org" 
  },
  { 
    node: <LogoWithTooltip title="Tailwind CSS"><SiTailwindcss /></LogoWithTooltip>, 
    title: "Tailwind CSS", 
    href: "https://tailwindcss.com" 
  },
  { 
    node: <LogoWithTooltip title="PostgreSQL"><SiPostgresql /></LogoWithTooltip>, 
    title: "PostgreSQL", 
    href: "https://www.postgresql.org/" 
  },
  {
    node: <LogoWithTooltip title="Prisma"><SiPrisma /></LogoWithTooltip>, 
    title: "Prisma", 
    href: "https://www.prisma.io/" 
  },
  { 
    node: <LogoWithTooltip title="Node.js"><SiNodedotjs /></LogoWithTooltip>, 
    title: "Node.js", 
    href: "https://nodejs.org/en" 
  },
  { 
    node: <LogoWithTooltip title="Vite"><SiVite /></LogoWithTooltip>, 
    title: "Vite", 
    href: "https://vite.dev/" 
  },
  { 
    node: <LogoWithTooltip title="Git"><SiGit /></LogoWithTooltip>, 
    title: "Git", 
    href: "https://git-scm.com/" 
  },
  { 
    node: <LogoWithTooltip title="GitHub"><SiGithub /></LogoWithTooltip>, 
    title: "GitHub", 
    href: "https://github.com/Arpitray" 
  },
  {
    node: <LogoWithTooltip title="Vercel"><SiVercel /></LogoWithTooltip>, 
    title: "Vercel", 
    href: "https://vercel.com/" 
  },
  {
    node: <LogoWithTooltip title="Supabase"><SiSupabase /></LogoWithTooltip>, 
    title: "Supabase", 
    href: "https://supabase.com/" 
  },
  { 
    node: <LogoWithTooltip title="Express"><SiExpress /></LogoWithTooltip>, 
    title: "Express", 
    href: "https://expressjs.com/" 
  },
  { 
    node: <LogoWithTooltip title="MongoDB"><SiMongodb /></LogoWithTooltip>, 
    title: "MongoDB", 
    href: "https://www.mongodb.com/" 
  },
  { 
    node: <LogoWithTooltip title="Postman"><SiPostman /></LogoWithTooltip>, 
    title: "Postman", 
    href: "https://www.postman.com/" 
  },
];

// Alternative with image sources
const imageLogos = [
  { src: "/logos/company1.png", alt: "Company 1", href: "https://company1.com" },
  { src: "/logos/company2.png", alt: "Company 2", href: "https://company2.com" },
  { src: "/logos/company3.png", alt: "Company 3", href: "https://company3.com" },
];

export default function App() {
  return (
    <section 
      id="stack" 
      className='relative w-full bg-[#E1E1E1]' 
      style={{ 
        minHeight: '300px',
        overflow: 'visible',
        zIndex: 10,
        isolation: 'isolate'
      }}
    >
      <div className='container mx-auto px-4 py-16'>
        <h2 className='text-center text-4xl md:text-6xl font-bold mb-12 text-black font-["dk2"]'>
          Tech Stack
        </h2>
        
        <div style={{ 
          height: '200px', 
          position: 'relative', 
          overflow: 'hidden',
          width: '100%'
        }}>
          {/* Basic horizontal loop */}
          <LogoLoop
            logos={techLogos}
            speed={100}
            direction="left"
            logoHeight={110}
            gap={40}
            hoverSpeed={30}
            scaleOnHover
            fadeOut
            fadeOutColor="#E1E1E1"
            ariaLabel="Technology partners"
          />
        </div>
      </div>
    </section>
  );
}