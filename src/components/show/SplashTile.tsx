import type { TileData } from "@/utils/mahjong/types";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { TileModel } from "../game/TileModel";

function SpinningTile() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  const dummyTile: TileData = {
    id: "splash",
    gridPosition: { x: 0, y: 0, z: 0 },
    symbol: "Chun",
    layer: 0,
    position: { x: 0, y: 0, z: 0 },
    isRemoved: false,
    isSelected: false,
    isAccessible: true,
  };

  return (
    <group ref={groupRef} rotation={[-Math.PI / -2, 1, -1]}>
      <TileModel tile={dummyTile} />
    </group>
  );
}

export function SplashTile() {
  return (
    <div className="h-full w-full">
      <Canvas shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, 10, -5]} intensity={0.4} />

        <PerspectiveCamera makeDefault position={[0, 2, 5]} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={false}
        />

        <group position={[0, 0, 0]}>
          <SpinningTile />
        </group>
      </Canvas>
    </div>
  );
}
