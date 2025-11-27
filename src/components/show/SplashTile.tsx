import { OrbitControls, PerspectiveCamera, useGLTF, useTexture } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { memo, useRef, useMemo } from 'react';
import * as THREE from 'three';

const SpinningTile = memo(function SpinningTile() {
  const groupRef = useRef<THREE.Group>(null);
  const { nodes } = useGLTF('/textures/models/tile.glb');
  const texture = useTexture('/textures/Regular/Chun.png');

  const sidesGeometry = useMemo(() => (nodes.Cube as THREE.Mesh).geometry, [nodes]);
  const topGeometry = useMemo(() => (nodes.Cube001 as THREE.Mesh).geometry, [nodes]);

  const sideMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: '#ffffff',
        emissiveIntensity: 0.1
      }),
    []
  );

  const topMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        alphaTest: 0.1,
        side: THREE.DoubleSide
      }),
    [texture]
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 6, 0, -0.2]}>
      <group scale={[-0.35, 1, 0.8]}>
        <mesh castShadow receiveShadow geometry={sidesGeometry} material={sideMaterial} />
        <mesh castShadow receiveShadow geometry={topGeometry} material={topMaterial} />
      </group>
    </group>
  );
});

export const SplashTile = memo(function SplashTile() {
  return (
    <div className="h-full w-full">
      <Canvas shadows dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, 10, -5]} intensity={0.4} />

        <PerspectiveCamera makeDefault position={[0, 2, 5]} />
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />

        <SpinningTile />
      </Canvas>
    </div>
  );
});
