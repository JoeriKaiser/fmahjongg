/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';
import { MahjongTile } from './MahjongTile';
import { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import * as THREE from 'three';

export function MahjongGame() {
  const tiles = useGameStore((state) => state.tiles);
  const resetGame = useGameStore((state) => state.resetGame);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const possibleMoves = useGameStore((state) => state.possibleMoves);
  const getPossibleMoves = useGameStore((state) => state.getPossibleMoves);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 15, 20);
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, []);

  useEffect(() => {
    if (tiles.length > 0) {
      getPossibleMoves();
    }
  }, [tiles, getPossibleMoves]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        Remaining moves: {possibleMoves ?? 0}
        <Button onClick={resetGame}>Reset Game</Button>
      </div>
      <Canvas shadows>
        <PerspectiveCamera ref={cameraRef} makeDefault fov={50} near={0.1} far={1000} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          maxPolarAngle={Math.PI / 8}
          minDistance={10}
          maxDistance={30}
          target={[0, 0, 0]}
        />

        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-10, 10, -5]} intensity={0.4} />

        {/* Center the entire board */}
        <group position={[0, 0, 0]}>
          {tiles.map((tile, index) => (
            <MahjongTile
              key={`${tile.id}-${index}`}
              tile={{
                ...tile,
                position: {
                  x: tile.position.x,
                  y: tile.position.y,
                  z: tile.position.z
                }
              }}
            />
          ))}
        </group>
      </Canvas>
    </div>
  );
}
