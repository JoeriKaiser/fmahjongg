import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Loader2, RotateCcw } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/store/gameStore";
import { SplashTile } from "../show/SplashTile";
import { ScoreSubmission } from "./ScoreSubmission";
import { TileInstances } from "./TileInstances";
import { TopScores } from "./TopScores";

const SCENE_BG_COLOR = "#3a4a5a";

const GameInfoPanel = memo(function GameInfoPanel({
	possibleMoves,
	elapsedTime,
	onReset,
}: {
	possibleMoves: number;
	elapsedTime: number;
	onReset: () => void;
}) {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Card className="w-64 bg-slate-800/90 text-white shadow-xl backdrop-blur-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-bold">Fast Mahjong</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div className="flex justify-between text-sm">
						<span>Moves available:</span>
						<span className="font-mono">{possibleMoves}</span>
					</div>
					<div className="flex justify-between text-sm">
						<span>Time:</span>
						<span className="font-mono">{formatTime(elapsedTime)}</span>
					</div>
					<Button
						variant="default"
						className="mt-4 w-full bg-slate-700 hover:bg-slate-600 transition-colors"
						onClick={onReset}
					>
						<RotateCcw className="mr-2 h-4 w-4" />
						Reset Game
					</Button>
				</div>
			</CardContent>
		</Card>
	);
});

const ControlsHelp = memo(function ControlsHelp() {
	const [show, setShow] = useState(false);

	return (
		<div className="relative">
			<Button
				variant="default"
				size="sm"
				className="bg-slate-800/90 hover:bg-slate-700/90 backdrop-blur-sm"
				onClick={() => setShow(!show)}
			>
				<span className="text-sm">🎮</span>
			</Button>

			{show && (
				<Card className="absolute bottom-12 right-0 w-64 bg-slate-800/90 text-white shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-bold">Controls</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="text-xs space-y-1">
							<li>🖱️ Left Click: Select tile</li>
							<li>🖱️ Right Click + Drag: Rotate camera</li>
							<li>🖱️ Scroll: Zoom in/out</li>
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
});

const LoadingScreen = memo(function LoadingScreen() {
	return (
		<div
			className="h-screen w-screen flex items-center justify-center"
			style={{ backgroundColor: SCENE_BG_COLOR }}
		>
			<div className="text-white flex flex-col items-center gap-4">
				<div className="relative">
					<Loader2 className="h-12 w-12 animate-spin text-emerald-400" />
					<div className="absolute inset-0 h-12 w-12 animate-ping opacity-20 rounded-full bg-emerald-400" />
				</div>
				<p className="text-lg text-slate-300 animate-pulse">
					Generating puzzle...
				</p>
			</div>
		</div>
	);
});

const WelcomeScreen = memo(function WelcomeScreen({
	onStart,
}: {
	onStart: () => void;
}) {
	return (
		<div className="h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-800">
			<div className="h-full w-full flex flex-col items-center justify-center">
				<div className="text-white flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
						Welcome to Fast Mahjong
					</h1>
					<p className="text-lg text-slate-300 tracking-wide">
						Experience the classic game reimagined
					</p>
				</div>
				<div className="w-64 h-64 animate-in fade-in duration-700 delay-200">
					<SplashTile />
				</div>
				<Button
					variant="default"
					className="mt-8 bg-emerald-600 hover:bg-emerald-500 transition-all hover:scale-105 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300"
					onClick={onStart}
				>
					Start Game
				</Button>
			</div>
		</div>
	);
});

const GameOverScreen = memo(function GameOverScreen({
	isWon,
	onReset,
	onSubmitScore,
}: {
	isWon: boolean;
	onReset: () => void;
	onSubmitScore: () => void;
}) {
	return (
		<div className="h-screen w-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
			<div className="text-white flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
				<div className={`text-6xl ${isWon ? "animate-bounce" : ""}`}>
					{isWon ? "🎉" : "😔"}
				</div>
				<p className="text-2xl font-bold">
					{isWon ? "Congratulations!" : "Game Over"}
				</p>
				<p className="text-slate-300">
					{isWon ? "You've cleared all tiles!" : "No more moves available"}
				</p>
				<div className="flex gap-4 mt-4">
					<Button
						variant="default"
						className="bg-slate-700 hover:bg-slate-600 transition-colors"
						onClick={onReset}
					>
						<RotateCcw className="mr-2 h-4 w-4" />
						Play Again
					</Button>
					{isWon && (
						<Button
							variant="default"
							className="bg-emerald-600 hover:bg-emerald-500 transition-colors"
							onClick={onSubmitScore}
						>
							Submit Score
						</Button>
					)}
				</div>
			</div>
		</div>
	);
});

// Sets the scene background color
function SceneSetup() {
	const { scene } = useThree();

	useEffect(() => {
		scene.background = new THREE.Color(SCENE_BG_COLOR);
	}, [scene]);

	return null;
}

const GameScene = memo(function GameScene() {
	const cameraRef = useRef<THREE.PerspectiveCamera>(null);

	useEffect(() => {
		if (cameraRef.current) {
			cameraRef.current.position.set(0, 15, 20);
			cameraRef.current.lookAt(0, 0, 0);
		}
	}, []);

	return (
		<>
			<SceneSetup />
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
				enableDamping
				dampingFactor={0.05}
				enablePan
				enableZoom
				maxPolarAngle={Math.PI / 2}
				minPolarAngle={Math.PI / 12}
				minDistance={10}
				maxDistance={30}
				target={[0, 0, 0]}
			/>

			<ambientLight intensity={0.5} />
			<directionalLight
				position={[15, 15, 5]}
				intensity={0.8}
				castShadow
				shadow-mapSize-width={1024}
				shadow-mapSize-height={1024}
				shadow-camera-far={50}
				shadow-camera-left={-20}
				shadow-camera-right={20}
				shadow-camera-top={20}
				shadow-camera-bottom={-20}
			/>
			<directionalLight position={[-10, 12, -5]} intensity={0.3} />

			<TileInstances />

			<mesh
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, -0.5, 0]}
				receiveShadow
			>
				<planeGeometry args={[100, 100]} />
				<meshStandardMaterial
					color={SCENE_BG_COLOR}
					roughness={0.9}
					metalness={0.1}
				/>
			</mesh>
		</>
	);
});

export function MahjongGame() {
	const [showScoreSubmission, setShowScoreSubmission] = useState(false);

	const tiles = useGameStore((s) => s.tiles);
	const isLoading = useGameStore((s) => s.isLoading);
	const gameOver = useGameStore((s) => s.gameOver);
	const isGameWon = useGameStore((s) => s.isGameWon);
	const elapsedTime = useGameStore((s) => s.elapsedTime);
	const possibleMoves = useGameStore((s) => s.possibleMoves);
	const resetGame = useGameStore((s) => s.resetGame);

	const handleScoreSubmitted = useCallback(() => {
		setShowScoreSubmission(false);
		resetGame();
	}, [resetGame]);

	const handleSubmitScore = useCallback(() => {
		setShowScoreSubmission(true);
	}, []);

	if (isLoading) {
		return <LoadingScreen />;
	}

	if (gameOver) {
		return (
			<>
				<GameOverScreen
					isWon={isGameWon}
					onReset={resetGame}
					onSubmitScore={handleSubmitScore}
				/>
				{showScoreSubmission && isGameWon && (
					<ScoreSubmission
						time={elapsedTime}
						onScoreSubmitted={handleScoreSubmitted}
					/>
				)}
			</>
		);
	}

	if (!tiles.length) {
		return <WelcomeScreen onStart={resetGame} />;
	}

	return (
		<div
			className="relative h-screen w-screen overflow-hidden animate-in fade-in duration-300"
			style={{ backgroundColor: SCENE_BG_COLOR }}
		>
			<div className="absolute left-4 top-4 z-10">
				<GameInfoPanel
					possibleMoves={possibleMoves}
					elapsedTime={elapsedTime}
					onReset={resetGame}
				/>
			</div>

			<div className="absolute right-4 top-4 z-10">
				<TopScores />
			</div>

			<div className="absolute bottom-4 right-4 z-10">
				<ControlsHelp />
			</div>

			<Canvas
				shadows
				dpr={[1, 2]}
				performance={{ min: 0.5 }}
				gl={{
					antialias: true,
					powerPreference: "high-performance",
				}}
				className="h-full w-full"
			>
				<GameScene />
			</Canvas>
		</div>
	);
}
