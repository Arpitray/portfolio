import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollVelocity from './ScrollVelocity'
import maincam from './maincam.jpg'
import back1 from './back1.png'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

// Mobile production fix: ensure ScrollTrigger initializes after DOM ready
if (typeof window !== 'undefined') {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    // Force ScrollTrigger refresh on mobile after a delay to handle production timing issues
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        try {
          ScrollTrigger.refresh(true);
        } catch (e) {
          console.warn('Initial mobile ScrollTrigger refresh failed:', e);
        }
      }, 500);
    });
  }
}

// Custom debounce function since gsap.utils.debounce might not be available
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

function Projects() {
  const containerRef = useRef(null)
  const projectsContainerRef = useRef(null) // Add ref for projects container
  const projectsRef = useRef([])
  const frameRefs = useRef([])
  const videoRefs = useRef([])
  const panelRefs = useRef([])
  const [mobileReady, setMobileReady] = useState(false)

  // Mobile readiness detection for production
  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) {
      setMobileReady(true);
      return;
    }

    let readyChecks = 0;
    const totalChecks = 3;
    
    const checkReady = () => {
      readyChecks++;
      if (readyChecks >= totalChecks) {
        setTimeout(() => setMobileReady(true), 100);
      }
    };

    // Check 1: Loader completion
    if (window.__loaderComplete) {
      checkReady();
    } else {
      window.addEventListener('loaderComplete', checkReady, { once: true });
    }

    // Check 2: Font loading
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(checkReady);
    } else {
      setTimeout(checkReady, 200);
    }

    // Check 3: Basic DOM ready
    if (document.readyState === 'complete') {
      checkReady();
    } else {
      window.addEventListener('load', checkReady, { once: true });
    }

    // Fallback timeout
    const fallback = setTimeout(() => setMobileReady(true), 1000);
    
    return () => clearTimeout(fallback);
  }, []);

  // Sample project data
  const projects = [
    {
      id: 1,
      title: "LENSFLOW",
      description: "A modern React-based web experience featuring smooth scroll interactions and fluid camera animations. Built with GSAP for cinematic transitions, Lenis for buttery scrolling, Tailwind CSS for a clean responsive UI, and Vite for lightning-fast builds. Designed for immersive storytelling and interactive UI demos.",
      tags: ["#react #gsap #lenis #smooth-scrolling #camera-animations #motion-design #scroll-animation #ui-interactions #responsive-design"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1755597901/camera_lmj7cm", // Replace with your actual video
      link: "#",
      githubLink: "https://github.com/Arpitray/camera",
      liveDemoLink: "https://camera-smoky.vercel.app/",
  background: "#F3E4D3" // Use the imported image as background
    },
    {
      id: 2,
      title: "SUMMORE .",
      description: "SUMMORE. is a commercial-grade e-commerce application built with React and Vite, designed to showcase my industrial development potential. It features smooth animations, responsive layouts, and an optimized shopping flow for browsing, cart management, and checkout. With Vite ensuring fast performance and React powering modular UI components, this project demonstrates my ability to build scalable, engaging, and production-ready web applications.",
      tags: ["#CommerceApp", "#FrontendEngineering", "#UIUX", "#ModernWebApp", "#web development","#ResponsiveDesign"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1755597902/2_ouwpqf",
      link: "#",
      githubLink: "https://github.com/Arpitray/commerce",
      liveDemoLink: "https://commerce-tau-lac-54.vercel.app/",
      background: "bg-green-200"
    },
    {
      id: 3,
      title: "BREW HAVEN",
      description: "Brew Haven Cafe is a modern web application built to deliver an immersive coffee shop experience. Developed with a contemporary JavaScript stack, it combines smooth interactive animations, responsive layouts, and a clean shopping flow for browsing menu items, adding to cart, and checkout. The polished design and engaging transitions showcase my ability to create experience-driven, production-ready applications that merge functionality with aesthetic appeal.",
      tags: ["#CafeShop", "#Animations", "#UIUX", "#ModernFrontend", "#WebApp", "#CoffeeShop"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1755597904/3_vyax6d",
      link: "#",
      githubLink: "https://github.com/Arpitray/coffee",
      liveDemoLink: "https://coffee-lime-chi.vercel.app/",
      background: "bg-yellow-200"
    },
    {
      id: 4,
      title: "PORTFOLIO",
      description: "This Portfolio is a sleek, minimalist web portfolio crafted with clean design principles and subtle yet engaging hover animations. It showcases a refined aesthetic—using elegant typography, and intuitive navigation to highlight your work without distraction. Built with modern frontend technologies, the refined interactivity on hover adds just the right touch of dynamism, reflecting your eye for detail and commitment to polished, professional design.",
      description2:"This project was inspired by Whatyoriginal design that I referenced closely, focusing on recreating its modern layout and interactive elements to demonstrate my ability to deliver clean, aesthetic, and professional web experiences.",
      tags: ["#PortfolioWebsite", "#MinimalDesign", "#UIUX", "#immersive design", "#museum"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1755598448/4_kc08vz",
      link: "#",
      githubLink: "https://github.com/Arpitray/nextGenPortfolio",
      liveDemoLink: "https://next-gen-portfolio-six.vercel.app/",
      background: "bg-indigo-200"
    },
    {
      id: 5,
      title: "Signi",
      description: "Signi is a modern web presentation for a healthcare brand, built with immersive scroll-triggered animations that enhance storytelling. The design is clean and purposeful, with smooth content reveals and dynamic motion across sections. Each interaction responds to scrolling, creating a fluid experience that highlights my ability to craft interactive, production-ready animations using GSAP’s ScrollTrigger.",
      description2:" This project was inspired by the original Significo website, where I focused on recreating its animations and interactions to demonstrate precision, attention to detail, and the ability to deliver polished, modern web experiences.",
      tags: ["#GSAPAnimations", "#MotionDesign", "#InteractiveUI","#InspiredDesign"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1755603134/1_bsm5vr",
      link: "#",
      githubLink: "https://github.com/Arpitray/signi",
      liveDemoLink: "https://signi-phi.vercel.app/",
      background: "bg-pink-200"
    },
    {
      id: 6,
      title: "BUILDER",
      description: "Professional Portfolio Builder is a web application aimed at helping users create polished portfolios by customizing pre-designed templates. Built with a modern frontend stack, it is designed to offer real-time previews, dynamic template selection, and smooth modification controls to adapt portfolios to individual needs.",
      description2:"This project is currently in progress and under active development, inspired by leading portfolio builder platforms. The goal is to deliver a production-ready, user-centric tool that balances performance, flexibility, and creative freedom, while also demonstrating my ability to engineer scalable web solutions.",
      tags: ["#PortfolioBuilder", "#WebApp", "#InProgress"," #ScalableWebSolutions"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1755597904/5_jr4bhy",
      link: "#",
      githubLink: "https://github.com/Arpitray/builder",
      liveDemoLink: "https://builder-pp9v.vercel.app/",
      background: "bg-purple-200"
    }
  ]

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return; // Skip GSAP animations on mobile

    const container = containerRef.current;
    const projectsContainer = projectsContainerRef.current;

    // Early return if refs are not ready
    if (!container || !projectsContainer) return;

    const validProjects = projectsRef.current.filter(Boolean);
    if (validProjects.length === 0) return;

    gsap.config({ 
      force3D: true, 
      nullTargetWarn: false,
    });

    gsap.set(validProjects, {
      transformOrigin: "50% 50%",
      force3D: true,
    });

    const projectAnimations = validProjects.map((project, index) => {
      if (!project) return null;

      const isEvenProject = index % 2 === 0;

      const textEl = project.querySelector('.text-start');
      const panelEl = project.querySelector('.flex-1.relative') || project.querySelector('.flex-1');

      const textFromX = isEvenProject ? 120 : -120;
      const panelFromX = isEvenProject ? -140 : 140;

      const targets = [textEl, panelEl].filter(Boolean);

      gsap.set(targets, {
        x: (i, el) => (el === textEl ? textFromX : panelFromX),
        force3D: true,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: project,
          start: 'top 100%',
          end: 'top -1%',
          scrub: 1,
          invalidateOnRefresh: true,
          once: false,
        }
      });

      if (textEl) tl.to(textEl, { x: 0, duration: 0.9, ease: 'power3.out' }, 0);
      if (panelEl) tl.to(panelEl, { x: 0, duration: 1.1, ease: 'power3.out' }, 0.06);

      return tl;
    }).filter(Boolean);

    ScrollTrigger.batch(validProjects, {
      onEnter: (elements) => {
        gsap.to(elements, {
          x: 0,
          duration: 0.9,
          ease: "power2.out",
          stagger: {
            amount: 0.25,
            from: "start",
          },
          overwrite: true,
          force3D: true,
        });
      },
      start: "top 95%",
      end: "bottom 60%",
      refreshPriority: 1,
    });

    validProjects.forEach((project, index) => {
      if (!project) return;

      const parallaxElement = project.querySelector('.parallax-element') || project;

      gsap.to(parallaxElement, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: project,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
          invalidateOnRefresh: true,
        }
      });
    });

    const handleResize = debounce(() => {
      ScrollTrigger.refresh();
    }, 250);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      projectAnimations.forEach(anim => {
        if (anim && typeof anim.kill === 'function') {
          anim.kill();
        }
      });
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger && typeof trigger.kill === 'function') {
          trigger.kill();
        }
      });
    };
  }, [mobileReady])

  // Lazy load videos
  const handleVideoVisibility = (index) => {
    const videoEl = videoRefs.current[index];
    if (videoEl) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            videoEl.play();
          } else {
            videoEl.pause();
          }
        },
        { threshold: 0.5 } // Play video when 50% visible
      );
      observer.observe(videoEl);
    }
  };

  useEffect(() => {
    videoRefs.current.forEach((_, index) => handleVideoVisibility(index));
  }, []);

  // Animate frame when the video ends: scale down then scale back up, then replay
  const handleVideoEnd = (index) => {
    const panelEl = panelRefs.current[index]
    const videoEl = videoRefs.current[index]
    if (!panelEl) return

    // Ensure transform origin is centered
    gsap.set(panelEl, { transformOrigin: '50% 50%' })

    const tl = gsap.timeline()
    // scale down to 0 using expo.out easing
    tl.to(panelEl, { scale: 0, duration: 1, ease: 'expo.out' })
      // hold for 1 second
      .to(panelEl, { duration: 1 })
      // scale back up using expo.out easing
      .to(panelEl, {
        scale: 1,
        duration: 1.5,
        ease: 'expo.out',
        onComplete: () => {
          // restart video playback after animation
          if (videoEl) {
            try {
              videoEl.currentTime = 0
              videoEl.play()
            } catch (e) {
              // ignore autoplay errors
            }
          }
        }
      })
  }

  return (
  <section id="work" ref={containerRef} style={{ position: 'relative', zIndex: 9999, backgroundColor: '#E1E1E1' }} className='bg-grid2 flex flex-col min-h-[calc(var(--vh,1vh)*100)] md:min-h-screen'>
      {/* ScrollVelocity Title Section */}
      <div className='w-full pt-8'>
        <ScrollVelocity
          texts={["PERSONAL PROJECTS", "PERSONAL PROJECTS", "PERSONAL PROJECTS", "PERSONAL PROJECTS", "PERSONAL PROJECTS","PERSONAL PROJECTS","PERSONAL PROJECTS","PERSONAL PROJECTS","PERSONAL PROJECTS", "PERSONAL PROJECTS", "PERSONAL PROJECTS","PERSONAL PROJECTS","PERSONAL PROJECTS","PERSONAL PROJECTS"]}
          velocity={80}
          numCopies={8}
          className="uppercase px-6 md:px-10 lg:text-[130px] text-8xl font-medium tracking-widest lg:tracking-[0.08em] font-['demo']"
          parallaxClassName="w-full"
          scrollerClassName="gap-8"
          velocityMapping={{ input: [-1000, 1000], output: [-1000, 1000] }}
        />
      </div>

      {/* Projects Container */}
      <div ref={projectsContainerRef} className='flex-1 pb-20 '>
        {projects.map((project, index) => {
          const isEven = index % 2 === 0
          
          return (
            <div
              key={project.id}
              id={`project-${project.id}`}
              ref={el => projectsRef.current[index] = el}
              className={`parallax-element last:mb-0 font-['belly'] tracking-widest transition-all duration-300 ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex flex-col md:flex-row gap-8 md:gap-6 px-6 md:px-16 lg:px-4 items-center`}
              style={{ 
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                perspective: '1000px'
              }}
            >
              {/* Project Description */}
              <div className='w-full md:w-1/2 px-4 md:px-8 font-["demo"] text-center md:text-start'>
                <h2 className='text-4xl sm:text-3xl md:text-6xl lg:text-5xl xl:text-8xl font-extrabold text-black mb-3 md:mb-5 tracking-tight leading-tight'>
                  {project.title}
                </h2>
                <p className='text-sm sm:text-base md:text-lg lg:text-2xl text-gray-800 mb-6 font-semibold md:mb-8 leading-relaxed md:max-w-prose text-center md:text-start'>
                  {project.description}
                </p>
                <p className='text-sm sm:text-base md:text-lg lg:text-2xl text-gray-800 mb-6 font-semibold md:mb-8 leading-relaxed md:max-w-prose text-center md:text-start'>
                  {project.description2}
                </p>
                <div className={`flex flex-wrap font-['pp'] font-semibold ${isEven ? 'justify-center md:justify-start' : 'justify-center md:justify-start'}`}>
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className='text-xs md:text-sm text-gray-600 font-semibold  px-2 py-1 rounded-sm'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className={`hidden md:flex gap-3 mt-6 md:mt-8 ${isEven ? 'justify-center md:justify-start' : 'justify-center md:justify-start'}`}>
                  <a href={project.githubLink} target="_blank" rel="noopener noreferrer" aria-label="View on GitHub" className="inline-flex items-center justify-center bg-gray-900 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base hover:bg-gray-800 transition-colors">
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.757-1.333-1.757-1.089-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.418-1.305.76-1.605-2.665-.305-5.466-1.332-5.466-5.93 0-1.31.468-2.381 1.235-3.221-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.911 1.23 3.221 0 4.61-2.805 5.625-5.475 5.92.435.375.81 1.11.81 2.235 0 1.615-.015 2.915-.015 3.315 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                    <span className="sr-only">GitHub</span>
                  </a>
                  <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#101828] text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-sm md:text-base hover:bg-zinc-800 transition-colors">
                    Live Demo
                  </a>
                </div>
              </div>

              {/* Vertical flag divider (hidden on small screens) */}
              <div className='hidden md:flex flex-col items-center px-4 self-stretch my-34'>
                {/* Flag rectangle at top */}
                <div className='w-10 h-6 bg-black rounded-sm'></div>
                {/* Long thin line fills available space */}
                <div className='w-[2px] bg-black h-full my-2' />
                {/* Bottom dot */}
                <div className='w-3 h-3 bg-black rounded-full mt-2'></div>
              </div>

              {/* Laptop Interface (only the window panel) */}
              <div ref={el => panelRefs.current[index] = el} className='flex-1 flex items-center justify-center w-full md:w-1/2 relative h-auto md:h-[98vh] rounded-2xl overflow-visible px-6 md:px-2 py-6 md:py-12 md:mt-0'>
                <div className='relative group w-full max-w-[920px] overflow-visible'>
                  <div className='inline-block w-full'>
                      {/* Laptop Frame */}
                      <div ref={el => frameRefs.current[index] = el} className='bg-gray-900 rounded-t-xl p-4 shadow-2xl mx-auto w-full max-w-[880px]'>
                    {/* Laptop Screen Bezel */}
                    <div className='bg-black rounded-lg p-2'>
                      {/* Browser Window */}
                      <div className='bg-gray-800 rounded-t-lg p-3 flex items-center justify-between'>
                        {/* Window Controls */}
                        <div className='flex gap-2'>
                          <div className='w-3 h-3 rounded-full bg-red-500'></div>
                          <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
                          <div className='w-3 h-3 rounded-full bg-green-500'></div>
                        </div>
                        
                        {/* URL Bar */}
                        <div className='flex-1 mx-4 bg-gray-700 rounded px-3 py-1 text-xs text-gray-300 text-center'>
                          @google.com
                        </div>
                        
                        {/* Browser Icons */}
                        <div className='flex gap-2'>
                          <div className='w-4 h-4 bg-gray-600 rounded'></div>
                          <div className='w-4 h-4 bg-gray-600 rounded'></div>
                        </div>
                      </div>
                      
                      {/* Video Container with background image */}
                      <div className='rounded-b-lg overflow-hidden bg-center bg-cover' style={{ backgroundImage: `url(${back1})` }}>
                        <video
                          ref={el => videoRefs.current[index] = el}
                          src={project.video}
                          className='w-full h-full object-cover min-h-[180px] sm:min-h-[240px] md:min-h-[280px]'
                          muted
                          playsInline
                          autoPlay
                          onEnded={() => handleVideoEnd(index)}
                        />
                      </div>
                    </div>
                  </div>
                  
                      {/* Laptop Base */}
                      <div className='bg-gray-800 h-4 rounded-b-xl shadow-lg -mt-4 relative z-20'></div>
                      
                      {/* Laptop Stand: neck + foot for stronger visual */}
                      <div className='flex flex-col items-center -mt-2 relative z-20'>
                        {/* Neck */}
                        <div className='bg-gray-700 h-2 w-16 md:w-20 rounded-b-lg'></div>
                        {/* Foot */}
                        <div className='bg-gray-600 h-2 w-28 md:w-36 rounded-full mt-1 shadow-md'></div>
                      </div>
                    </div>
                  </div>
                </div>

            {/* Mobile-only actions placed below the project panel so order becomes: description -> panel -> actions */}
            <div className='md:hidden w-full flex justify-center mt-4 mb-8 gap-4 relative' style={{ zIndex: 9999 }}>
              <a href={project.githubLink} target="_blank" rel="noopener noreferrer" aria-label="View on GitHub" className="inline-flex items-center justify-center bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors">
                GitHub
              </a>
              <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-[#101828] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-zinc-800 transition-colors">
                Live Demo
              </a>
            </div>

            </div>
          )
        })}
      </div>
  {/* bottom mask removed to avoid wave overlap on mobile */}
    </section>
  )
}

export default Projects