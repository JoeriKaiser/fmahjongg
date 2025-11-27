import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/store/gameStore";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Loader2, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SplashTile } from "../show/SplashTile";
import { MahjongTile } from "./MahjongTile";
import { ScoreSubmission } from "./ScoreSubmission";
import { TopScores } from "./TopScores";

export function MahjongGame() {
  const [showControls, setShowControls] = useState(false);
  const [showScoreSubmission, setShowScoreSubmission] = useState(false);

  const {
    tiles,
    resetGame,
    possibleMoves,
    isLoading,
    gameOver,
    elapsedTime,
    isGameWon,
  } = useGameStore();

  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 15, 20);
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, []);

  const handleScoreSubmitted = useCallback(() => {
    setShowScoreSubmission(false);
    resetGame();
  }, [resetGame]);

  if (isLoading) {
    return (
      <div
        id="main"
        className="h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center"
      >
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
        className="h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center"
      >
        <div className="text-white flex flex-col items-center gap-4">
          <p className="text-lg">
            {isGameWon
              ? "Congratulations! You've won!"
              : "Game Over - No more possible moves!"}
          </p>
          <Button variant="default" onClick={resetGame}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </Button>
          {isGameWon && !showScoreSubmission && (
            <Button
              variant="default"
              onClick={() => setShowScoreSubmission(true)}
            >
              Submit Score
            </Button>
          )}
        </div>
        {showScoreSubmission && isGameWon && (
          <ScoreSubmission time={elapsedTime} onScoreSubmitted={handleScoreSubmitted} />
        )}
      </div>
    );
  }

  if (!tiles.length) {
    return (
      <div
        id="main"
        className="h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-800"
      >
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
            onClick={resetGame}
          >
            Start Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="main" className="relative h-screen w-screen">
      {/* Game Info Panel */}
      <div className="absolute left-4 top-4 z-10 space-y-4">
        <Card className="w-64 bg-slate-800/90 text-white shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">Fast Mahjong</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">
                  Remaining moves: {possibleMoves ?? 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Time: {formatTime(elapsedTime)}</span>
              </div>
              <Button
                variant="default"
                className="mt-4 w-full bg-slate-700 hover:bg-slate-600"
                onClick={resetGame}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <TopScores />

      <div className="h-full w-full">
        <Canvas shadows className="h-full w-full">
          <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            fov={75}
            near={0.1}
            far={1000}
            rotation={[-0.3, -0.3, -0.2]}
          />
          <OrbitControls
            mouseButtons={{
              LEFT: undefined,
              RIGHT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.ROTATE,
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
            {tiles.map((tile) => (
              <MahjongTile key={tile.id} tile={tile} />
            ))}
          </group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow> {/* Position below tiles */}
            <planeGeometry args={[500, 500]} /> {/* Adjust size as needed */}
            <meshStandardMaterial color="#3a4a5a" roughness={0.8} metalness={0.1} /> {/* Darker, less reflective material */}
            {/* Or maybe a texture? */}
          </mesh>
        </Canvas>
      </div>

      <div className="absolute bottom-4 right-4 z-10">
        <div className="relative">
          <Button
            variant="default"
            size="sm"
            className="bg-slate-800/90 hover:bg-slate-700/90"
            onClick={() => setShowControls(!showControls)}
          >
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
