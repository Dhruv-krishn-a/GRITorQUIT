// src/components/ThreeJs/YinYang.js
import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import SignupForm from "../SignupForm";
import yinImg from "../../assets/YinYang.png"; // adjust path if needed

// Forward ref so parent can get the THREE.Group (matrixWorld etc.)
export default React.forwardRef(function YinYang({ onSignupSuccess }, ref) {
  const group = useRef();
  const pointerRef = useRef({ x: 0, y: 0 });
  const { size, gl } = useThree();

  // expose group to parent via ref (so other components can compute local space)
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") ref(group.current);
    else ref.current = group.current;
    return () => {
      if (!ref) return;
      if (typeof ref === "function") ref(null);
      else ref.current = null;
    };
  }, [ref]);

  // load texture
  const texture = useLoader(THREE.TextureLoader, yinImg);

  // configure texture once loaded
  useEffect(() => {
    if (!texture) return;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.anisotropy = Math.min(16, gl.capabilities.getMaxAnisotropy());
    texture.encoding = THREE.sRGBEncoding;
    texture.needsUpdate = true;
  }, [texture, gl]);

  // segments LOD
  const segments = useMemo(() => {
    const minSide = Math.min(size.width, size.height);
    if (minSide < 600) return 64;
    if (minSide < 1200) return 128;
    return 192;
  }, [size.width, size.height]);

  // background shader uniforms
  const bgUniforms = useRef({
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(size.width, size.height) },
    u_mouse: { value: new THREE.Vector2(0, 0) },
    u_flameIntensity: { value: 1.0 },
    u_edgeSoftness: { value: 0.008 },
    u_splitOffset: { value: 0.0 },
    u_angle: { value: -Math.PI * 0.25 },
  }).current;

  const wheelUniforms = useRef({
    u_time: { value: 0 },
    u_mouse: { value: new THREE.Vector2(0, 0) },
    u_rotateSpeed: { value: 0.55 },
  }).current;

  // pointer listeners
  useEffect(() => {
    const el = gl.domElement;
    if (!el) return;
    const onPointerMove = (e) => {
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;
    };
    const onTouchMove = (ev) => {
      if (!ev.touches || ev.touches.length === 0) return;
      const t = ev.touches[0];
      const rect = el.getBoundingClientRect();
      const nx = ((t.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((t.clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current.x = nx;
      pointerRef.current.y = ny;
    };

    el.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [gl]);

  // animation loop: update uniforms + rotate group
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    bgUniforms.u_time.value = t;
    bgUniforms.u_resolution.value.set(size.width, size.height);
    wheelUniforms.u_time.value = t * 0.95;

    const mx = pointerRef.current.x ?? 0;
    const my = pointerRef.current.y ?? 0;
    bgUniforms.u_mouse.value.set(mx, my);
    wheelUniforms.u_mouse.value.set(mx, my);

    bgUniforms.u_splitOffset.value = mx * 0.6;
    bgUniforms.u_flameIntensity.value = 1.0 + Math.abs(my) * 0.6;

    if (group.current) {
      const targetY = mx * 0.12;
      const targetX = -my * 0.08;
      group.current.rotation.x += (targetX - group.current.rotation.x) * 0.08;
      group.current.rotation.y += (targetY - group.current.rotation.y) * 0.08;
      group.current.rotation.z += 0.0018 + 0.0006 * (wheelUniforms.u_mouse.value.x || 0);
    }
  });

  // responsive size for Html signup card
  const formSize = useMemo(() => {
    const minSide = Math.min(size.width, size.height);
    const s = Math.round(Math.max(220, Math.min(420, minSide * 0.34)));
    return s;
  }, [size.width, size.height]);

  const formSizeInner = Math.round(formSize * 0.86);

  return (
    <>
      {/* Background plane */}
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[30, 18, 1, 1]} />
        <shaderMaterial
          uniforms={bgUniforms}
          transparent={false}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={/* glsl */ `
            varying vec2 vUv;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform vec2 u_resolution;
            uniform float u_flameIntensity;
            uniform float u_edgeSoftness;
            uniform float u_splitOffset;
            uniform float u_angle;

            float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
            float noise(vec2 p){
              vec2 i = floor(p);
              vec2 f = fract(p);
              float a = hash(i);
              float b = hash(i + vec2(1.0, 0.0));
              float c = hash(i + vec2(0.0, 1.0));
              float d = hash(i + vec2(1.0, 1.0));
              vec2 u = f*f*(3.0-2.0*f);
              return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
            }
            float fbm(vec2 p){
              float v=0.0; float a=0.5; float m=1.0;
              for(int i=0;i<5;i++){ v += a*noise(p*m); m*=2.0; a*=0.5;}
              return v;
            }

            void main(){
              vec2 uv = vUv * 2.0 - 1.0;
              float c = cos(u_angle), s = sin(u_angle);
              mat2 rot = mat2(c, -s, s, c);
              vec2 ruv = rot * uv;

              float base = ruv.x + u_splitOffset;

              vec2 npos = vUv * 3.0 + vec2(u_time * 0.12 + u_mouse.x * 0.6, -u_time * 0.06 + u_mouse.y * 0.5);
              float n = fbm(npos);

              float spikes = pow(max(0.0, n), 1.25) * u_flameIntensity;
              float hf = fbm(npos * 5.5 + 12.0) * 0.35;
              spikes += hf * u_flameIntensity * 0.8;

              float edgeVal = base + (spikes - 0.45) * 0.55;
              float mask = smoothstep(-u_edgeSoftness, u_edgeSoftness, edgeVal);

              vec3 black = vec3(0.04, 0.04, 0.05);
              vec3 white = vec3(0.98, 0.98, 0.98);
              vec3 color = mix(black, white, mask);

              float tiny = (hash(gl_FragCoord.xy * 0.123) - 0.5) * 0.006;
              color += tiny * (1.0 - mask);

              gl_FragColor = vec4(color, 1.0);
            }
          `}
        />
      </mesh>

      {/* Rotating group */}
      <group ref={group} position={[0, 0, 0]}>
        {/* IMAGE MAPPED WHEEL */}
        <mesh position={[0, 0, 0.08]}>
          <circleGeometry args={[0.92, segments]} />
          <meshBasicMaterial
            map={texture}
            toneMapped={false}
            transparent={true}
            alphaTest={0.01}
            side={THREE.FrontSide}
          />
        </mesh>

        {/* Rim */}
        <mesh position={[0, 0, 0.12]}>
          <ringGeometry args={[0.915, 0.99, Math.max(32, Math.floor(segments / 6))]} />
          <meshStandardMaterial roughness={0.22} metalness={0.9} color={"#080808"} />
        </mesh>

        {/* Html signup inside the wheel */}
        <Html
          center
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          distanceFactor={1}
        >
          <div
            aria-hidden={false}
            style={{
              width: `${formSize}px`,
              height: `${formSize}px`,
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              boxSizing: "border-box",
              pointerEvents: "auto",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${formSizeInner}px`,
                height: `${formSizeInner}px`,
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(6,6,6,0.40)",
                backdropFilter: "blur(6px) saturate(1.05)",
                boxShadow: "0 14px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.02)",
                padding: `${Math.round(formSize * 0.06)}px`,
                boxSizing: "border-box",
                touchAction: "manipulation",
                position: "relative",
              }}
            >
              <SignupForm inline formSize={formSizeInner} onSignupSuccess={onSignupSuccess} />
            </div>
          </div>
        </Html>
      </group>
    </>
  );
});
