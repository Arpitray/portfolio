import { useRef } from "react";
import SandImage from './SandImage';

const DecayCard = ({
  width = 300,
  height = 400,
  image = 'https://picsum.photos/300/400?grayscale',
  children,
  bare = false,
}) => {
  const wrapperRef = useRef(null);

  return (
    <div ref={wrapperRef} className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
      <div className="relative w-full h-full block rounded-2xl overflow-hidden shadow-2xl border border-white/8 bg-white">
        {/* image/canvas */}
        <div className="relative w-full h-full">
          <SandImage src={image} width={width} height={height} showOverlay={!bare} />

          {/* overlays for detail: vignette + subtle frame + corner accents */}
          {!bare && (
            <div className="absolute inset-0 pointer-events-none">
              {/* vignette */}
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 40%, rgba(0,0,0,0.0) 70%)' }} />
              {/* subtle top gradient for depth */}
              <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '18%', background: 'linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0))' }} />
              {/* frame highlight */}
              <div style={{ position: 'absolute', inset: 2, borderRadius: 12, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), inset 0 -6px 30px rgba(0,0,0,0.06)' }} />
              {/* corner accents */}
              <div style={{ position: 'absolute', left: 10, top: 10, width: 22, height: 22, border: '2px solid rgba(255,255,255,0.22)', borderRadius: 4 }} />
              <div style={{ position: 'absolute', right: 10, bottom: 10, width: 22, height: 22, border: '2px solid rgba(0,0,0,0.08)', borderRadius: 4 }} />
            </div>
          )}
        </div>
      </div>
      {!bare && (
        <div className="absolute bottom-[1.2em] left-[1em] text-zinc-400 tracking-[-0.5px] font-black text-[2.5rem] leading-[1.5em] first-line:text-[6rem]">
          ARPIT
        </div>
      )}
    </div>
  );
};

export default DecayCard;
