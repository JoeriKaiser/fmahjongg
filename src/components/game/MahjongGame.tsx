import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';
import { MahjongTile } from './MahjongTile';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RotateCcw } from 'lucide-react';
import * as THREE from 'three';

export function MahjongGame() {
  const tiles = useGameStore((state) => state.tiles);
  const resetGame = useGameStore((state) => state.resetGame);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const possibleMoves = useGameStore((state) => state.possibleMoves);
  const getPossibleMoves = useGameStore((state) => state.getPossibleMoves);
  const isLoading = useGameStore((state) => state.isLoading);
  const gameOver = useGameStore((state) => state.gameOver);

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

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <p className="text-lg">Game Over!</p>
          <Button variant="default" onClick={resetGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="absolute left-4 top-4 z-10 space-y-4">
        <Card className="w-64 bg-slate-800/90 text-white shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Fast Mahjong</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Remaining moves: {possibleMoves ?? 0}</span>
            </div>
            <Button
              variant="default"
              className="mt-4 w-full bg-slate-700 hover:bg-slate-600"
              onClick={resetGame}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Game
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="h-full w-full">
        <Canvas shadows className="h-full w-full">
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
    </div>
  );
}
