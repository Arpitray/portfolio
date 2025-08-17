import React from 'react'
import DecayCard from './DecayCard'
import Maincam from './maincam.jpg'
import Arpit3 from './Arpit3.png'
import Arpit2 from './Arpit2.png'
import Arpit4 from './Arpit4.png'
function About() {
  return (
    <section className="relative min-h-screen w-full bg-[#E1E1E1] flex font-['trial'] sm:px-8">
      <div className=" w-full flex justify-center mt-32">
        <div className="flex w-full justify-center lg:justify-center saturate-120">
          <DecayCard width={550} height={600} image={Arpit3}>
            <div>Arpit</div>
          </DecayCard>
        </div>

        <div className="space-y-6 w-full items-start ">
          <h2 className="text-black font-[100] tracking-tight text-start text-[34px] sm:text-[40px] md:text-[48px] lg:text-[100px]">About Me</h2>
          <p className="text-[22px] text-black/100 leading-8 mr-44 font-['demo']">
          I build pixel perfect, design accurate frontends enriched with modern animations and seamless interactivity — ensuring every project feels as good as it looks. Leveraging technologies like React, JavaScript, GSAP, and Framer Motion, I craft fluid user experiences, while WebGL and Three.js bring immersive 3D visuals to life.
          </p>
          <p className="text-[22px] text-black/90 leading-relaxed mr-44 font-['demo']">
            My work focuses on marrying design and engineering: translating visual language into performant, accessible UIs
          </p>
          <div className="mt-6">
            <a href="#contact" className="inline-flex items-center rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-bold">Get in touch</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About