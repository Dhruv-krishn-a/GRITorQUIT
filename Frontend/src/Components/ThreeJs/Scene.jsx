// src/components/ThreeJs/Scene.js
import React, { Suspense, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import YinYang from "./YinYang";
import FloatingQuotes from "./FloatingQuotes";
import FallingSand from "./FallingSand";
import SignupForm from "../SignupForm";

export default function Scene({ useTestBox = false }) {
  const [contextLost, setContextLost] = useState(false);
  const yinYangRef = useRef(); // <-- shared ref passed to YinYang and FloatingQuotes

  return (
    <div className="w-full h-full absolute inset-0 z-0" style={{ pointerEvents: "auto" }}>
      {contextLost && (
        <div style={{ position: "absolute", zIndex: 50, color: "white" }}>
          WebGL context lost
        </div>
      )}

      <Canvas
        style={{ position: "absolute", inset: 0 }}
        shadows
        camera={{ position: [0, 1.6, 5], fov: 45 }}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          const onLost = (e) => {
            console.warn("WebGL context lost", e);
            e.preventDefault();
            setContextLost(true);
          };
          const onRestored = () => setContextLost(false);
          canvas.addEventListener("webglcontextlost", onLost, false);
          canvas.addEventListener("webglcontextrestored", onRestored, false);
        }}
      >
        <Suspense fallback={null}>
          {/* forward the ref into YinYang so the group is available */}
          <YinYang ref={yinYangRef} formComponent={SignupForm} />

          {/* scene pieces */}
          <FallingSand />
          {/* pass yinYangRef to FloatingQuotes to enable color inversion when overlapping the wheel */}
          <FloatingQuotes yinYangRef={yinYangRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
