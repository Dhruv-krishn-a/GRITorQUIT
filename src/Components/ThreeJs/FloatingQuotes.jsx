// src/components/ThreeJs/FloatingQuotes.jsx
import React, { useRef, useMemo, useEffect } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const SAMPLE_QUOTES = [
  "If you begin,\nyou win.\nStart where you are.\nDo what you can.",
  "SHIREN \n The mindset of using every challenge to elevate and unlock your higher self.",
  "In great attempts \n it is glorious\n even to fail.",
  "The moment you accept your limits,\nyou go beyond them.",
  "Whatever stands in the way\nbecomes the way.",
  "One more attempt -\n not in the persuit of success,\nbut to avoid the weight of regret.",
  "Your only limit\nis you.",
  "Make it happen.",
];

export default function FloatingQuotes({
  quotes = SAMPLE_QUOTES,
  maxVisible = 8,
  area = { x: [-4.5, 4.5], y: [-2.4, 2.4], z: [-1.2, 1.2] },
  yinYangRef = null,
}) {
  const { camera, size, mouse } = useThree();
  const groupRef = useRef([]);
  const dragging = useRef({ index: -1, pointerId: null, offset: new THREE.Vector3() });

  const items = useMemo(() => {
    const n = Math.min(maxVisible, quotes.length);
    return Array.from({ length: n }).map((_, i) => {
      const px = THREE.MathUtils.randFloat(area.x[0], area.x[1]);
      const py = THREE.MathUtils.randFloat(area.y[0], area.y[1]);
      const pz = THREE.MathUtils.randFloat(area.z[0], area.z[1]);
      const vx = (Math.random() - 0.5) * 0.0025;
      const vy = (Math.random() - 0.5) * 0.002;
      return {
        text: quotes[i],
        pos: new THREE.Vector3(px, py, pz),
        vel: new THREE.Vector3(vx, vy, 0),
        cardRef: React.createRef(),
        _lastWasLight: false,
      };
    });
  }, [quotes, maxVisible, area]);

  const ndcToWorldAtZ = (ndcX, ndcY, worldZ = 0) => {
    const ndc = new THREE.Vector3(ndcX, ndcY, 0.5);
    ndc.unproject(camera);
    const dir = ndc.sub(camera.position).normalize();
    const t = (worldZ - camera.position.z) / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(t));
  };

  const startDrag = (e, idx) => {
    e.stopPropagation();
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch {}
    dragging.current.index = idx;
    dragging.current.pointerId = e.pointerId ?? null;
    const ndcX = (e.clientX / window.innerWidth) * 2 - 1;
    const ndcY = -(e.clientY / window.innerHeight) * 2 + 1;
    const world = ndcToWorldAtZ(ndcX, ndcY, 0);
    const g = groupRef.current[idx];
    if (g) dragging.current.offset.copy(g.position).sub(world);
  };

  useEffect(() => {
    const move = (ev) => {
      if (dragging.current.index === -1) return;
      if (dragging.current.pointerId != null && ev.pointerId !== dragging.current.pointerId) return;
      const ndcX = (ev.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(ev.clientY / window.innerHeight) * 2 + 1;
      const world = ndcToWorldAtZ(ndcX, ndcY, 0);
      const g = groupRef.current[dragging.current.index];
      if (g) g.position.copy(world.clone().add(dragging.current.offset));
    };
    const up = (ev) => {
      if (dragging.current.pointerId != null && ev.pointerId !== dragging.current.pointerId) return;
      dragging.current.index = -1;
      dragging.current.pointerId = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const worldMouse = ndcToWorldAtZ(mouse.x, mouse.y, 0);

    for (let i = 0; i < items.length; i++) {
      const it = items[i];

      // bobbing motion
      it.vel.x += Math.sin(t * 0.8 + i * 0.6) * 0.00003;
      it.vel.y += Math.cos(t * 0.72 + i * 0.5) * 0.000025;
      it.pos.add(it.vel);

      // bounce in area
      ["x","y","z"].forEach(axis => {
        const min = area[axis][0], max = area[axis][1];
        if (it.pos[axis] <= min || it.pos[axis] >= max) {
          it.vel[axis] *= -0.88;
          it.pos[axis] = THREE.MathUtils.clamp(it.pos[axis], min, max);
        }
      });

      // mouse repel
      if (dragging.current.index !== i) {
        const dx = it.pos.x - worldMouse.x;
        const dy = it.pos.y - worldMouse.y;
        const dz = it.pos.z - worldMouse.z;
        const distSq = dx*dx + dy*dy + dz*dz;
        const r = 0.85;
        if (distSq < r*r && distSq > 1e-6) {
          const dist = Math.sqrt(distSq);
          const repel = ((r-dist)/r)*0.02;
          it.pos.x += dx/dist*repel;
          it.pos.y += dy/dist*repel;
          it.pos.z += dz/dist*repel;
          it.vel.multiplyScalar(0.93);
        } else it.vel.multiplyScalar(0.9995);
      }

      const g = groupRef.current[i];
      if (g && dragging.current.index !== i) {
        g.position.lerp(it.pos, 0.14);
        g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, THREE.MathUtils.clamp(-it.vel.y*140,-10,10)*Math.PI/180, 0.06);
        g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, THREE.MathUtils.clamp(it.vel.x*140,-8,8)*Math.PI/180, 0.06);
      } else if (g && dragging.current.index === i) {
        it.vel.multiplyScalar(0.8);
      }
    }
  });

  return (
    <>
      {items.map((it,i) => (
        <group key={i} ref={el => (groupRef.current[i]=el)} position={it.pos}>
          <Html 
            center 
            style={{ 
              pointerEvents: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }} 
            occlude={false}
          >
            <div
              onPointerDown={e=>startDrag(e,i)}
              style={{
                userSelect: "none",
                cursor: "grab",
                transformStyle: "preserve-3d",
                WebkitFontSmoothing: "antialiased",
                touchAction: "manipulation",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <div
                ref={it.cardRef}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "18px 22px",
                  borderRadius: "20px",
                  background: "rgba(15, 15, 15, 0.85)",
                  backdropFilter: "blur(25px) saturate(1.8)",
                  border: "1.5px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: `
                    0 12px 40px rgba(0, 0, 0, 0.35),
                    0 4px 15px rgba(0, 0, 0, 0.25),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.3)
                  `,
                  minWidth: "150px",
                  maxWidth: "240px",
                  width: "max-content",
                  fontSize: "15px",
                  fontWeight: "600",
                  lineHeight: "1.45",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "rgba(255, 255, 255, 0.95)",
                  textAlign: "center",
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Dark overlay for better readability */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)",
                  pointerEvents: "none",
                  borderRadius: "20px",
                }} />
                
                {/* Accent dot */}
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  margin: "0 auto 14px auto",
                  boxShadow: "0 2px 10px rgba(102, 126, 234, 0.5)",
                }} />
                
                {/* Quote text with better contrast */}
                <div style={{
                  position: "relative",
                  zIndex: 1,
                  color: "rgba(255, 255, 255, 0.98)",
                  textShadow: "0 2px 6px rgba(0, 0, 0, 0.7)",
                  fontWeight: "700",
                  letterSpacing: "0.02em",
                }}>
                  {it.text}
                </div>

                {/* Subtle bottom accent */}
                <div style={{
                  position: "absolute",
                  bottom: "0",
                  left: "25%",
                  right: "25%",
                  height: "3px",
                  background: "linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.6), transparent)",
                  borderRadius: "2px",
                }} />

                {/* Corner accents */}
                <div style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  width: "12px",
                  height: "12px",
                  borderTop: "2px solid rgba(102, 126, 234, 0.4)",
                  borderLeft: "2px solid rgba(102, 126, 234, 0.4)",
                  borderRadius: "4px 0 0 0",
                }} />
                <div style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "12px",
                  height: "12px",
                  borderTop: "2px solid rgba(102, 126, 234, 0.4)",
                  borderRight: "2px solid rgba(102, 126, 234, 0.4)",
                  borderRadius: "0 4px 0 0",
                }} />
              </div>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}