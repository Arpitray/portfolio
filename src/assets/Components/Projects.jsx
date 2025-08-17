import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollVelocity from './ScrollVelocity'
import maincam from './maincam.jpg'
import back1 from './back1.png'

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger)

function Projects({ isMask = false }) {
  const containerRef = useRef(null)
  const projectsRef = useRef([])
  const frameRefs = useRef([])
  const videoRefs = useRef([])
  const panelRefs = useRef([])

  // Lightweight static mask when used as an overlay mask: avoid heavy DOM, videos, and GSAP
  if (isMask) {
    return (
      <section style={{ position: 'relative', zIndex: 99999, backgroundColor: '#E1E1E1', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontFamily: 'demo', fontSize: '6rem', margin: 0, color: '#000' }}>SELECTED PROJECTS</h2>
        </div>
      </section>
    )
  }

  // Sample project data
  const projects = [
    {
      id: 1,
      title: "LENSFLOW",
      description: "A modern React-based web experience featuring smooth scroll interactions and fluid camera animations. Built with GSAP for cinematic transitions, Lenis for buttery scrolling, Tailwind CSS for a clean responsive UI, and Vite for lightning-fast builds. Designed for immersive storytelling and interactive UI demos.",
      tags: ["#react #gsap #lenis #smooth-scrolling #camera-animations #motion-design #scroll-animation #ui-interactions #responsive-design"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1755251604/camera_mu21or.mp4", // Replace with your actual video
      link: "#",
      githubLink: "https://github.com/Arpitray/camera",
      liveDemoLink: "https://camera-smoky.vercel.app/",
  background: "#F3E4D3" // Use the imported image as background
    },
    {
      id: 2,
      title: "ECO ARCHITECTURE",
      description: "A sustainable architecture platform showcasing green building designs and eco-friendly construction methods. Features interactive 3D models and virtual tours of sustainable projects.",
      tags: ["#3d modeling", "#sustainability", "#architecture", "#interactive design", "#web development"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1753776816/vid10_zpxivm.mp4",
      link: "#",
      githubLink: "https://github.com/example/eco-architecture",
      liveDemoLink: "https://example.com/eco-architecture-demo",
      background: "bg-green-200"
    },
    {
      id: 3,
      title: "URBAN PLANNING HUB",
      description: "An interactive platform for urban planners and architects to collaborate on city development projects. Includes real-time collaboration tools and 3D city modeling.",
      tags: ["#urban planning", "#collaboration", "#3d visualization", "#web app", "#real-time"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1753776820/vid11_m3t9ob.mp4",
      link: "#",
      githubLink: "https://github.com/example/urban-planning-hub",
      liveDemoLink: "https://example.com/urban-planning-hub-demo",
      background: "bg-yellow-200"
    },
    {
      id: 4,
      title: "DIGITAL MUSEUM",
      description: "A virtual museum experience showcasing digital art and interactive installations. Features immersive VR experiences and AI-powered art recommendations.",
      tags: ["#digital art", "#vr experience", "#ai integration", "#immersive design", "#museum"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1753776816/vid10_zpxivm.mp4",
      link: "#",
      githubLink: "https://github.com/example/digital-museum",
      liveDemoLink: "https://example.com/digital-museum-demo",
      background: "bg-indigo-200"
    },
    {
      id: 5,
      title: "PROJECT FIVE",
      description: "Description for project five.",
      tags: ["#tag1", "#tag2", "#tag3"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1753776816/vid10_zpxivm.mp4",
      link: "#",
      githubLink: "https://github.com/example/project-five",
      liveDemoLink: "https://example.com/project-five-demo",
      background: "bg-pink-200"
    },
    {
      id: 6,
      title: "PROJECT SIX",
      description: "Description for project six.",
      tags: ["#tagA", "#tagB", "#tagC"],
      video: "https://res.cloudinary.com/dsjjdnife/video/upload/v1753776820/vid11_m3t9ob.mp4",
      link: "#",
      githubLink: "https://github.com/example/project-six",
      liveDemoLink: "https://example.com/project-six-demo",
      background: "bg-purple-200"
    }
  ]

  useEffect(() => {
    if (isMask) return // mask mode: skip animations and scroll triggers
    const container = containerRef.current
    if (!container) return

    // Create elastic animations for each project
    projects.forEach((project, index) => {
      const projectElement = projectsRef.current[index]
      if (!projectElement) return

      const isEven = index % 2 === 0

      // Set initial state
      gsap.set(projectElement, {
        y: 100,
        opacity: 1,
        scale: 0.95,
        rotationX: isEven ? 15 : -15,
      })

      // Create elastic animation
      gsap.to(projectElement, {
        y: 0,
        opacity: 1,
        scale: 1,
        rotationX: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)",
        scrollTrigger: {
          trigger: projectElement,
          start: "top 80%",
          end: "bottom 50%",
          toggleActions: "play none none reverse"
        }
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [isMask])

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
    <section ref={containerRef} style={{ position: 'relative', zIndex: 9999, backgroundColor: '#E1E1E1' }} className='bg-grid2 min-h-screen flex flex-col overflow-hidden'>
      {/* ScrollVelocity Title Section */}
      <div className='w-full pt-8'>
        <ScrollVelocity
          texts={["SELECTED PROJECTS", "SELECTED PROJECTS", "SELECTED PROJECTS", "SELECTED PROJECTS", "SELECTED PROJECTS","SELECTED PROJECTS","SELECTED PROJECTS","SELECTED PROJECTS","SELECTED PROJECTS", "SELECTED PROJECTS", "SELECTED PROJECTS","SELECTED PROJECTS","SELECTED PROJECTS","SELECTED PROJECTS"]}
          velocity={80}
          numCopies={8}
          className="uppercase px-6 md:px-10 text-[190px] font-medium tracking-[0.08em] font-['demo']"
          parallaxClassName="w-full"
          scrollerClassName="gap-8"
          velocityMapping={{ input: [-1000, 1000], output: [-1000, 1000] }}
        />
      </div>

      {/* Projects Container */}
      <div className='flex-1 pb-20 '>
        {projects.map((project, index) => {
          const isEven = index % 2 === 0
          
          return (
            <div
              key={project.id}
              ref={el => projectsRef.current[index] = el}
              className={` last:mb-0 font-['belly'] tracking-widest ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex flex-col md:flex-row gap-8 md:gap-6 px-6 md:px-16 lg:px-4 items-center`}
            >
              {/* Project Description */}
              <div className='text-start w-full md:w-1/2 px-4 md:px-8 font-["demo"]'>
                <h2 className='text-2xl md:text-3xl lg:text-5xl xl:text-8xl font-extrabold text-black mb-3 md:mb-5 tracking-tight leading-tight text-start'>
                  {project.title}
                </h2>
                <p className='text-sm md:text-base lg:text-2xl text-gray-800 mb-6 font-semibold md:mb-8 leading-relaxed max-w-prose text-start'>
                  {project.description}
                </p>
                <div className={`flex flex-wrap font-['pp'] gap-3 font-semibold items-center ${isEven ? 'justify-start' : 'justify-start'}`}>
                  {project.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className='text-xs md:text-sm text-gray-600 font-semibold  px-2 py-1 rounded-sm'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className={`flex gap-3 mt-6 md:mt-8 ${isEven ? 'justify-start' : 'justify-start'}`}>
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
              <div ref={el => panelRefs.current[index] = el} className='flex-1 flex items-center justify-center w-full md:w-1/2 relative h-auto md:h-[98vh] rounded-2xl overflow-visible px-6 md:px-2 py-6 md:py-12'>
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
                          className='w-full h-full object-cover min-h-[280px]'
                          muted
                          playsInline
                          autoPlay
                          onEnded={() => handleVideoEnd(index)}
                          poster="https://via.placeholder.com/800x720/4F46E5/FFFFFF?text=Video+Preview"
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

            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Projects