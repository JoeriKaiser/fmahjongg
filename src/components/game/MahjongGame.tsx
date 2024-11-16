/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '@/store/gameStore';
import { MahjongTile } from './MahjongTile';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, RotateCcw } from 'lucide-react';
import * as THREE from 'three';
import { SplashTile } from '../show/SplashTile';

export function MahjongGame() {
  const [showControls, setShowControls] = useState(false);

  const tiles = useGameStore((state) => state.tiles);
  const resetGame = useGameStore((state) => state.resetGame);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const possibleMoves = useGameStore((state) => state.possibleMoves);
  const getPossibleMoves = useGameStore((state) => state.getPossibleMoves);
  const isLoading = useGameStore((state) => state.isLoading);
  const gameOver = useGameStore((state) => state.gameOver);
  const startTime = useGameStore((state) => state.startTime);
  const elapsedTime = useGameStore((state) => state.elapsedTime);
  const updateTimer = useGameStore((state) => state.updateTimer);

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

  useEffect(() => {
    let intervalId: number;
    if (startTime && !gameOver) {
      intervalId = window.setInterval(() => {
        updateTimer();
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [startTime, gameOver, updateTimer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div
        id="main"
        className="h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-lg">Loading game...</p>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div
        id="main"
        className="h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
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

  if (!tiles.length) {
    return (
      <div id="main" className="h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="h-full w-full flex flex-col items-center justify-center">
          <div className="text-white flex flex-col items-center gap-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome to Fast Mahjong
            </h1>
            <p className="text-lg text-slate-300 tracking-wide">
              Experience the classic game reimagined
            </p>
          </div>
          <div className="w-64 h-64">
            <SplashTile />
          </div>
          <Button
            variant="default"
            className="mt-8 bg-slate-700 hover:bg-slate-600"
            onClick={resetGame}>
            Start Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="main" className="relative h-screen w-screen">
      <div className="absolute left-4 top-4 z-10 space-y-4">
        <Card className="w-64 bg-slate-800/90 text-white shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Fast Mahjong</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Remaining moves: {possibleMoves ?? 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Time: {formatTime(elapsedTime)}</span>
              </div>
              <Button
                variant="default"
                className="mt-4 w-full bg-slate-700 hover:bg-slate-600"
                onClick={resetGame}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="h-full w-full">
        <Canvas shadows className="h-full w-full">
          <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            fov={75}
            near={0.1}
            far={1000}
            rotation={[-0.3, -0.5, -0.2]}
          />
          <OrbitControls
            mouseButtons={{
              LEFT: undefined,
              RIGHT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.ROTATE
            }}
            enableDamping={true}
            enablePan={true}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 12}
            minDistance={10}
            maxDistance={30}
            target={[0, 0, 0]}
          />

          <ambientLight intensity={0.4} />
          <directionalLight
            position={[15, 15, 5]}
            intensity={0.7}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-10, 12, -5]} intensity={0.3} />

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
      <div className="absolute bottom-4 right-4 z-10">
        <div className="relative">
          <Button
            variant="default"
            size="sm"
            className="bg-slate-800/90 hover:bg-slate-700/90"
            onClick={() => setShowControls(!showControls)}>
            <span className="text-sm">🎮</span>
          </Button>

          {showControls && (
            <Card className="absolute bottom-12 right-0 w-64 bg-slate-800/90 text-white shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-xs space-y-1">
                  <li>🖱️ Right Click + Drag: Pan camera</li>
                  <li>🖱️ Scroll Wheel: Zoom in/out</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
