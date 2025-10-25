// src/components/ThreeJs/FallingSand.jsx
import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

/**
 * Full-screen drifting particles + ephemeral mouse trail (sprite pool).
 */
export default function FallingSand({
  count = 20000,
  spawnXRange = [-6.5, 6.5],
  spawnYRange = [-4.0, 3.8],
  spawnZRange = [-3.0, 3.0],
  gravity = 0.00008,
  windBase = 0.00012,
  windStrength = 0.0009,
  windFreq = 0.35,
  mouseRadius = 0.7,
  mouseRepel = 0.035,
  mouseAttract = 0.06,
  grainSize = 0.04,
  spriteSize = 96,
  trailEnabled = true,
  maxTrail = 80,
}) {
  const { camera, mouse, scene } = useThree();
  const pointsRef = useRef();

  // --- sprite texture for both particles & trail
  const spriteTexture = useMemo(() => {
    const size = Math.max(32, Math.min(256, spriteSize));
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const r = size / 2;
    const grd = ctx.createRadialGradient(r, r, Math.max(1, size * 0.03), r, r, r);
    grd.addColorStop(0, "rgba(255, 255, 255, 1)");      // pure white (start)
    grd.addColorStop(0.25, "rgba(255, 255, 255, 0.8)"); // slightly transparent white
    grd.addColorStop(0.7, "rgba(255, 255, 255, 0.4)");  // fading white
    grd.addColorStop(1, "rgba(255, 255, 255, 0)");      // fully transparent

    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    tex.minFilter = THREE.LinearMipMapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }, [spriteSize]);

  // --- particle arrays
  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const velocities = useMemo(() => new Float32Array(count * 3), [count]);
  const phases = useMemo(() => new Float32Array(count), [count]);

  useEffect(() => {
    const [minX, maxX] = spawnXRange;
    const [minY, maxY] = spawnYRange;
    const [minZ, maxZ] = spawnZRange;
    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      positions[ix] = minX + Math.random() * (maxX - minX);
      positions[ix + 1] = minY + Math.random() * (maxY - minY);
      positions[ix + 2] = minZ + Math.random() * (maxZ - minZ);

      // slightly larger initial velocities so particles circulate
      velocities[ix] = (Math.random() - 0.5) * 0.004;
      velocities[ix + 1] = (Math.random() - 0.5) * 0.004;
      velocities[ix + 2] = (Math.random() - 0.5) * 0.004;

      phases[i] = Math.random() * Math.PI * 2;
    }
    // copy into geometry once mounted (Canvas mount may be slightly later)
    const geometry = pointsRef.current?.geometry;
    if (geometry?.attributes?.position) {
      geometry.attributes.position.array.set(positions);
      geometry.attributes.position.needsUpdate = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- trail sprite pool (imperative)
  const trailPool = useRef([]);
  const trailIndex = useRef(0);
  useEffect(() => {
    if (!trailEnabled) return;
    const pool = [];
    const mat = new THREE.SpriteMaterial({
      map: spriteTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      depthTest: true,
      sizeAttenuation: true,
      color: new THREE.Color(0xffffff),
    });
    for (let i = 0; i < Math.max(8, maxTrail); i++) {
      const sp = new THREE.Sprite(mat.clone());
      sp.visible = false;
      sp.scale.set(0.06, 0.06, 0.06);
      scene.add(sp); // add to scene root; will be updated in useFrame
      pool.push({ sprite: sp, life: 0, ttl: 0 });
    }
    trailPool.current = pool;
    return () => {
      pool.forEach((p) => {
        scene.remove(p.sprite);
        p.sprite.material.dispose();
        p.sprite.geometry?.dispose?.();
      });
      trailPool.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spriteTexture, maxTrail]);

  // helper: NDC mouse -> world at z = 0
  const ndcToWorldAtZ = (ndcX, ndcY, worldZ = 0) => {
    const ndc = new THREE.Vector3(ndcX, ndcY, 0.5);
    ndc.unproject(camera);
    const dir = ndc.sub(camera.position).normalize();
    const t = (worldZ - camera.position.z) / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(t));
  };

  // mouse button for attract vs repel
  const mouseDownRef = useRef(false);
  useEffect(() => {
    const onDown = () => (mouseDownRef.current = true);
    const onUp = () => (mouseDownRef.current = false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // remember last mouse world to spawn trail when moved
  const lastMouseWorld = useRef(new THREE.Vector3());

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const wind = windBase + Math.sin(t * windFreq) * windStrength;
    const worldMouse = ndcToWorldAtZ(mouse.x, mouse.y, 0);

    // spawn trail when mouse moved significantly
    if (trailEnabled) {
      const dist = lastMouseWorld.current.distanceToSquared(worldMouse);
      if (dist > 0.0009) {
        // spawn some small trail points at this position
        const pool = trailPool.current;
        for (let s = 0; s < 3; s++) {
          const entry = pool[trailIndex.current];
          trailIndex.current = (trailIndex.current + 1) % pool.length;
          entry.life = 1.0;
          entry.ttl = 0.9 + Math.random() * 0.5;
          entry.sprite.visible = true;
          entry.sprite.position.copy(worldMouse).add(new THREE.Vector3((Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.08, (Math.random() - 0.5) * 0.08));
          const sscale = 0.02 + Math.random() * 0.06;
          entry.sprite.scale.set(sscale, sscale, sscale);
          entry.sprite.material.opacity = 1.0;
        }
        lastMouseWorld.current.copy(worldMouse);
      }
    }

    // update trail pool (fade & move)
    const pool = trailPool.current;
    if (pool && pool.length) {
      for (let i = 0; i < pool.length; i++) {
        const e = pool[i];
        if (!e.sprite.visible) continue;
        e.life -= state.clock.getDelta() / e.ttl;
        if (e.life <= 0) {
          e.sprite.visible = false;
        } else {
          // small drift upwards + fade
          e.sprite.position.y += 0.0006;
          e.sprite.material.opacity = Math.max(0, e.life);
          // scale down slightly over lifetime
          const s = e.sprite.scale.x * (0.98 + 0.02 * Math.random());
          e.sprite.scale.setScalar(s);
        }
      }
    }

    // operate on the points geometry directly
    const geo = pointsRef.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array;

    const [minX, maxX] = spawnXRange;
    const [minY, maxY] = spawnYRange;
    const [minZ, maxZ] = spawnZRange;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      let x = arr[ix];
      let y = arr[ix + 1];
      let z = arr[ix + 2];

      let vx = velocities[ix];
      let vy = velocities[ix + 1];
      let vz = velocities[ix + 2];

      // oscillation stronger to avoid stuck
      vx += Math.cos(t * 0.2 + phases[i]) * 0.00012 + wind * (0.7 + Math.sin(phases[i]) * 0.3);
      vy += Math.sin(t * 0.17 + phases[i] * 0.5) * 0.00008 + (Math.random() - 0.5) * gravity;
      vz += Math.cos(t * 0.13 + phases[i] * 0.8) * 0.00008;

      x += vx;
      y += vy;
      z += vz;

      // mouse repulsion / attract
      const dx = x - worldMouse.x;
      const dy = y - worldMouse.y;
      const dz = z - worldMouse.z;
      const distSq = dx * dx + dy * dy + dz * dz;
      const r = mouseRadius;
      if (distSq < r * r) {
        const dist = Math.sqrt(distSq) || 0.0001;
        if (mouseDownRef.current) {
          const a = ((r - dist) / r) * mouseAttract;
          x += (-dx / dist) * a;
          y += (-dy / dist) * a;
          z += (-dz / dist) * a;
        } else {
          const repel = ((r - dist) / r) * mouseRepel;
          x += (dx / dist) * repel;
          y += (dy / dist) * repel * 0.7;
          z += (dz / dist) * repel;
        }
        vx *= 0.9;
        vy *= 0.9;
        vz *= 0.9;
      }

      // respawn if out of generous bounds
      if (x < minX - 4 || x > maxX + 4 || y < minY - 4 || y > maxY + 4 || z < minZ - 6 || z > maxZ + 6) {
        arr[ix] = minX + Math.random() * (maxX - minX);
        arr[ix + 1] = maxY - Math.random() * (Math.abs(maxY - minY) * 1.15);
        arr[ix + 2] = minZ + Math.random() * (maxZ - minZ);
        velocities[ix] = (Math.random() - 0.5) * 0.004;
        velocities[ix + 1] = (Math.random() - 0.5) * 0.004;
        velocities[ix + 2] = (Math.random() - 0.5) * 0.004;
        continue;
      }

      arr[ix] = x;
      arr[ix + 1] = y;
      arr[ix + 2] = z;
      velocities[ix] = vx;
      velocities[ix + 1] = vy;
      velocities[ix + 2] = vz;
    }

    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>

      <pointsMaterial
        map={spriteTexture}
        size={grainSize}
        transparent
        depthWrite={true}
        alphaTest={0.01}
        opacity={1}
        sizeAttenuation
          color={new THREE.Color(0xffffff)}
      />
    </points>
  );
}