// src/components/ThreeJs/Hourglass.jsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export default function Hourglass({ modelPath, screenOffset = { x: 90, y: 120 }, ndcDepth = 0.58, forceScale = 0.185 }) {
  const group = useRef();
  const gltf = useGLTF(modelPath);
  const { camera } = useThree();

  const screenPxToWorld = (px, py, depthNdc = ndcDepth) => {
    const v = new THREE.Vector3();
    const x = (px / window.innerWidth) * 2 - 1;
    const y = -(py / window.innerHeight) * 2 + 0.8;
    const z = depthNdc * 2 - 1;
    v.set(x, y, z);
    v.unproject(camera);
    return v;
  };

  useEffect(() => {
    if (!gltf || !gltf.scene) return;
    gltf.scene.traverse((c) => {
      if (c.isMesh && c.material) {
        c.castShadow = true;
        c.receiveShadow = true;
        c.material.metalness = Math.min(0.6, c.material.metalness ?? 0.2);
        c.material.roughness = Math.max(0.15, c.material.roughness ?? 0.5);
      }
    });
    const bbox = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const height = size.y || 1;
    const s = (forceScale && Number.isFinite(forceScale)) ? forceScale : 0.06 / (height || 1);
    if (group.current) group.current.scale.setScalar(s);
  }, [gltf, forceScale]);

  useFrame(() => {
    if (!group.current) return;
    const px = window.innerWidth - screenOffset.x;
    const py = screenOffset.y;
    const anchored = screenPxToWorld(px, py);
    group.current.position.lerp(anchored, 0.28);
    // slower smoother rotation + wobble
    group.current.rotation.y += 0.0055;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.sin(performance.now() * 0.00045) * 0.03, 0.06);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, Math.cos(performance.now() * 0.00035) * 0.02, 0.05);
  });

  return (
    <group ref={group} dispose={null}>
      {gltf ? <primitive object={gltf.scene} /> : null}
      <pointLight position={[0.6, 0.9, 0.6]} intensity={0.5} distance={5} color={"#ffd6a5"} />
    </group>
  );
}
