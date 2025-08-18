import React from 'react'
import { useNavigate } from 'react-router-dom'
import LL3 from './ll3.png'
import SpinGif from './spin.gif'
import SandImage from './SandImage'
import DecayCard from './DecayCard'

export default function PlaygroundPreview({
  image = '/PlayGround/virtual project/index.html',
  title = 'DreadCell',
  description = 'This is my very first personal experimental project—built entirely from scratch using only HTML, CSS, and JavaScript, with no external libraries involved. Aiming to blend eerie, spooky vibes with a playful, interactive touch, the site invites visitors to explore a mysterious interface filled with cryptic prompts like “Move Left,” “Move Right,” “Zoom In,” “Tip,” “joke,” “⚗️fact,”—lighthearted elements woven into an unsettling digital landscape. With just a simple toggle to “Stop Sound,” Dreadcell teases your senses, offering a uniquely spooky yet fun user experience.'
}) {
  const nav = useNavigate()

  return (
    <section id="playground-preview" className="relative min-h-screen w-full bg-[#E1E1E1] flex font-['trial'] sm:px-8">
      <div className=" w-full flex justify-center items-center mt-32">
        <div className="flex w-full justify-center lg:justify-center saturate-120">
          <DecayCard width={1050} height={780} image={SpinGif} bare={true}>
            {/* optional caption could go here */}
          </DecayCard>
        </div>

        <div className="space-y-6 w-full items-start px-6 lg:px-12" style={{ maxWidth: 900 }}>
          <h3 className="text-black font-[100] tracking-tight text-start text-[34px] sm:text-[40px] md:text-[88px] lg:text-[84px]">{title}</h3>
          <p className="text-[25px] text-black/90 leading-10 tracking-wide font-semibold  font-['pepper']">{description}</p>
          <div className="mt-6">
            <button onClick={() => nav('/playground')} className="inline-flex items-center rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 font-bold">Visit</button>
          </div>
        </div>
      </div>
    </section>
  )
}
