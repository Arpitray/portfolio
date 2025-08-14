import React from 'react'
import ScrollVelocity from './ScrollVelocity'


function Projects() {
  return (
    <section className='bg-grid2 min-h-screen bg-[#E1E1E1] flex flex-col'>
      <div className='w-full pt-8'>
        <ScrollVelocity
          texts={["SELECTED PROJECTS"]}
          velocity={80}
          numCopies={8}
          className="uppercase px-6 md:px-10 tracking-[0.08em]"
          parallaxClassName="w-full"
          scrollerClassName="gap-8"
        />
      </div>

      <div className='flex-1' />
    </section>
  )
}

export default Projects