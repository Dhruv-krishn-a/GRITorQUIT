// src/components/ThreeJs/ManCorner.jsx
import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

export default function ManCorner({
  modelPath,
  screenOffset = { x: 110, y: 150 },
  ndcDepth = 0.5,
  targetHeight = 1.2,
  forceScale = 0.04,
  debug = false,
}) {
  const group = useRef();
  const gltf = useGLTF(modelPath);
  const { camera, mouse } = useThree();
  const [computedScale, setComputedScale] = useState(1);

  // convert screen px -> world pt
  const screenPxToWorld = (px, py, depthNdc = ndcDepth) => {
    const v = new THREE.Vector3();
    const x = (px / window.innerWidth) * 2 - 1;
    const y = -(py / window.innerHeight) * 2 + 1;
    const z = depthNdc * 2 - 1;
    v.set(x, y, z);
    v.unproject(camera);
    return v;
  };

  useEffect(() => {
    if (!gltf || !gltf.scene) return;

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.color = new THREE.Color(0x000000); // silhouette
          child.material.metalness = 0;
          child.material.roughness = 1;
        }
      }
    });

    const bbox = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const modelHeight = size.y || 1;

    let scaleToApply = 1;
    if (forceScale && Number.isFinite(forceScale)) {
      scaleToApply = forceScale;
    } else {
      const raw = targetHeight / (modelHeight || 1);
      scaleToApply = THREE.MathUtils.clamp(raw, 0.01, 5);
    }

    setComputedScale(scaleToApply);
    if (group.current) group.current.scale.set(scaleToApply, scaleToApply, scaleToApply);

    if (debug) {
      console.info("[ManCorner] bbox size:", size, "computedScale:", scaleToApply);
    }
  }, [gltf, targetHeight, forceScale, debug]);

  useFrame((state) => {
    if (!group.current) return;
    const px = screenOffset.x;
    const py = window.innerHeight - screenOffset.y;
    const anchored = screenPxToWorld(px, py, ndcDepth);

    // nicer smooth lerp to anchored point
    const lerpT = 0.28;
    group.current.position.lerp(anchored, lerpT);
    // snap Y exactly to anchored to avoid breathing
    group.current.position.y = anchored.y;

    const baseYaw = -Math.PI / 4.6;
    const idleSway = Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, baseYaw + idleSway + mouse.x * 0.04, 0.12);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, mouse.y * 0.02, 0.08);
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "";
  };

  return (
    <group
      ref={group}
      position={[-3.2, -1.35, 0]}
      rotation={[0, -Math.PI / 4.6, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      dispose={null}
    >
      <primitive object={gltf.scene} />
      <pointLight position={[0.9, 1.6, 0.8]} intensity={0.45} distance={4} color={"#ffd6a5"} />
    </group>
  );
}
