import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';

const SandImage = ({ src, width = 800, height = 750, activationRect = null, cursorGlassSize = 90, uRadiusProp = null, showOverlay = true }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let renderer, scene, camera, material, mesh, texture;
    const clock = new THREE.Clock();

    const computeNormalizedRadius = (w, h) => {
      // if explicit normalized radius provided, use it (clamped)
      if (uRadiusProp != null) return Math.max(0.02, Math.min(0.95, uRadiusProp));
      // compute outer radius of the CursorGlass (px) so impact reaches its circumference
      const outer = Math.max(3, (cursorGlassSize) / 2);
      const minDim = Math.min(w || width, h || height);
      // base normalized radius
      const base = outer / Math.max(1, minDim);
      // scale up a bit so impact slightly exceeds the exact circumference
      const scaled = base * 1.3;
      // clamp to sensible range
      return Math.max(0.02, Math.min(0.95, scaled));
    };

    const uniforms = {
      uTime: { value: 0 },
  // ambient micro-motion strength (disabled by default so image is static)
  uStrength: { value: 0.0 },
  // per-grain size (larger -> coarser grains)
  uGrain: { value: 8.0 },
  uSpeed: { value: 0.5 },
  // localized pulse amplitude (only applied near pointer)
  uPulse: { value: 0 },
  // radius (normalized) computed from CursorGlass size or explicit override
  uRadius: { value: computeNormalizedRadius(width, height) },
      uTexture: { value: null },
      uPointer: { value: new THREE.Vector2(0.8, 0.8) },
      uResolution: { value: new THREE.Vector2(width, height) },
    };

  // disable antialias so displaced pixels remain crisp
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
  // use device pixel ratio 1 for crisper granular pixels (sand look)
  renderer.setPixelRatio(1);
  // set size but don't update style so CSS can control scaling and we keep pixelated rendering
  renderer.setSize(width, height, false);
    // three r150+ removed outputEncoding; use outputColorSpace instead
    if ('outputColorSpace' in renderer) {
      try { renderer.outputColorSpace = THREE.SRGBColorSpace; } catch (error) {
        console.warn('Failed to set outputColorSpace:', error)
      }
    } else if ('outputEncoding' in renderer) {
      try { renderer.outputEncoding = THREE.sRGBEncoding; } catch (error) {
        console.warn('Failed to set outputEncoding:', error)
      }
    }
  containerRef.current.appendChild(renderer.domElement);
  // ensure the canvas fills the container but keeps pixelated rendering
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.imageRendering = 'pixelated';
  // canvas left un-positioned so it contributes to document flow (prevents container collapse)

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 10);
    camera.position.z = 1;

    const geom = new THREE.PlaneGeometry(width, height, 1, 1);

    texture = new THREE.TextureLoader().load(src, () => {
      renderer.render(scene, camera);
    });
    // use nearest filtering and disable mipmaps so sampling stays pixel-accurate
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;

    uniforms.uTexture.value = texture;

    const vertexShader = `varying vec2 vUv; void main(){ vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mvPosition; }`;

    const fragmentShader = `uniform float uTime; uniform float uStrength; uniform float uGrain; uniform float uSpeed; uniform float uPulse; uniform float uRadius; uniform sampler2D uTexture; uniform vec2 uPointer; uniform vec2 uResolution; varying vec2 vUv;

    float hash(vec2 p){
      return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
    }

    void main(){
      vec2 uv = vUv;
      vec2 res = uResolution;

      // grain cell seed
      vec2 cell = floor(uv * res / uGrain);
      float seed = hash(cell);
      float seed2 = hash(cell + 1.2345);

      // time-based cycle per-grain (used for looping fall)
      float t = fract(uTime * uSpeed + seed);

      // pointer influence
      vec2 pd = uv - uPointer;
      float d = length(pd);
  // localized push: 1 at center, 0 at and beyond uRadius
  float push = 1.0 - smoothstep(0.0, uRadius, d);
  // sharpen falloff so influence is tightly localized
  push = pow(push, 3.0);

  // no ambient motion by default; displacement only from pointer-driven pulse
  // increased multipliers so the pointer causes a more visible displacement
  float ptrVert = -pd.y * 0.95 * uPulse * push;
  float ptrLat = -pd.x * 0.95 * uPulse * push;

      // combine (only pointer-driven)
      float vertical = ptrVert;
      float lateral = ptrLat;

  // micro jitter for granular look (only when pulsing)
  // stronger grain jitter during pulse to emphasize the sand effect
  float jitter = (hash(uv * res + t) - 0.5) * 0.025 * uPulse * push;

      vec2 finalUV = uv + vec2(lateral, vertical + jitter);
      // when pulsing at this spot, snap samples to a grain-sized grid to avoid smooth/fuzzy sampling
      if ((uPulse * push) > 0.02) {
        vec2 grain = vec2(uGrain) / uResolution;
        // avoid zero grain
        grain = max(grain, vec2(1.0) / uResolution);
        finalUV = floor(finalUV / grain) * grain + grain * 0.5;
      }
      finalUV = clamp(finalUV, vec2(0.0), vec2(1.0));

      vec4 color = texture2D(uTexture, finalUV);
      gl_FragColor = color;
    }`;

    material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });

    mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);

  // pointer handling: sustained localized pulse while pointer is over the element
  // increased default pulse so distortion is visibly noticeable; tuned to be subtle but clear
  const SUSTAIN_PULSE = 6;
    const isInsideActivation = (nx, ny) => {
      if (!activationRect) return true;
      const { x = 0, y = 0, w = 1, h = 1 } = activationRect;
      return nx >= x && nx <= x + w && ny >= y && ny <= y + h;
    };

    const onPointerMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = 1.0 - (e.clientY - rect.top) / rect.height;
      if (!isInsideActivation(nx, ny)) {
        // outside activation area: ensure no pulse and update pointer if desired
        uniforms.uPulse.value = 0;
        return;
      }
      // update pointer and sustain pulse while inside
      uniforms.uPointer.value.x = nx;
      uniforms.uPointer.value.y = ny;
      uniforms.uPulse.value = SUSTAIN_PULSE;
    };

    const onEnter = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = 1.0 - (e.clientY - rect.top) / rect.height;
      if (!isInsideActivation(nx, ny)) return;
      // ramp up to a sustained pulse
      gsap.to(uniforms.uPulse, { value: SUSTAIN_PULSE, duration: 0.12, ease: 'power2.out' });
      uniforms.uPointer.value.x = nx;
      uniforms.uPointer.value.y = ny;
    };

    const onLeave = () => {
      // fade pulse out when leaving
      gsap.to(uniforms.uPulse, { value: 0, duration: 0.5, ease: 'power3.out' });
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('pointermove', onPointerMove);
      containerRef.current.addEventListener('pointerenter', onEnter);
      containerRef.current.addEventListener('pointerleave', onLeave);
    }
    // also attach to the canvas itself in case pointer events are captured by it
    if (renderer && renderer.domElement) {
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerenter', onEnter);
      renderer.domElement.addEventListener('pointerleave', onLeave);
    }

    let rafId;
    const tick = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    tick();

    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = rect.width || width;
      const h = rect.height || height;
      renderer.setSize(w, h);
      uniforms.uResolution.value.set(w, h);
      // recompute normalized radius on resize so pixel radius matches CursorGlass
      try {
        uniforms.uRadius.value = computeNormalizedRadius(w, h);
      } catch (error) {
        console.warn('Failed to update radius uniform:', error)
      }
      camera.left = -w / 2; camera.right = w / 2; camera.top = h / 2; camera.bottom = -h / 2; camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (containerRef.current) {
        try {
          containerRef.current.removeEventListener('pointermove', onPointerMove);
          containerRef.current.removeEventListener('pointerenter', onEnter);
          containerRef.current.removeEventListener('pointerleave', onLeave);
        } catch (error) {
          console.warn('Failed to remove pointer listeners:', error)
        }
      }
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      try {
        if (renderer && renderer.domElement) {
          if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      } catch (error) {
        console.warn('Failed to remove renderer element:', error)
      }
      try { material && material.dispose(); } catch (error) {
        console.warn('Failed to dispose material:', error)
      }
      try { geom && geom.dispose(); } catch (error) {
        console.warn('Failed to dispose geometry:', error)
      }
      try { texture && texture.dispose && texture.dispose(); } catch (error) {
        console.warn('Failed to dispose texture:', error)
      }
      try { renderer && renderer.dispose && renderer.dispose(); } catch (error) {
        console.warn('Failed to dispose renderer:', error)
      }
    };
  }, [src, width, height]);

  // Add a subtle blurred image overlay on top of the WebGL canvas.
  // The overlay uses pointer-events:none so it doesn't block hover interactions
  // (the canvas underneath still receives pointer events for the shader effect).
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {showOverlay && (
        <img
          src={src}
          alt="preview"
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(4px)',
            opacity: 0.16,
            pointerEvents: 'none',
            zIndex: 2,
            transition: 'opacity 200ms ease, filter 200ms ease'
          }}
        />
      )}
    </div>
  );
};

export default SandImage;
