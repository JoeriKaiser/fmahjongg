import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Home, Loader2, RotateCcw, Share2 } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/store/gameStore";
import { shareToClipboard } from "@/utils/dailyPuzzle";
import { DailyHome } from "./DailyHome";
import { ScoreSubmission } from "./ScoreSubmission";
import { TileInstances } from "./TileInstances";
import { TopScores } from "./TopScores";

const SCENE_BG_COLOR = "#3a4a5a";

const GameInfoPanel = memo(function GameInfoPanel({
	possibleMoves,
	elapsedTime,
	onReset,
	onHome,
	isDailyMode,
	puzzleNumber,
}: {
	possibleMoves: number;
	elapsedTime: number;
	onReset: () => void;
	onHome: () => void;
	isDailyMode: boolean;
	puzzleNumber: number;
}) {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	return (
		<Card className="w-64 bg-slate-800/90 text-white shadow-xl backdrop-blur-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-bold">
					{isDailyMode ? `Daily #${puzzleNumber}` : "Fast Mahjong"}
				</CardTitle>
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
					<div className="flex gap-2 mt-4">
						<Button
							variant="default"
							size="sm"
							className="flex-1 bg-slate-700 hover:bg-slate-600 transition-colors"
							onClick={onReset}
						>
							<RotateCcw className="h-4 w-4" />
						</Button>
						<Button
							variant="default"
							size="sm"
							className="flex-1 bg-slate-700 hover:bg-slate-600 transition-colors"
							onClick={onHome}
						>
							<Home className="h-4 w-4" />
						</Button>
					</div>
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

const GameOverScreen = memo(function GameOverScreen({
	isWon,
	onReset,
	onHome,
	onSubmitScore,
	isDailyMode,
}: {
	isWon: boolean;
	onReset: () => void;
	onHome: () => void;
	onSubmitScore: () => void;
	isDailyMode: boolean;
}) {
	const [shareSuccess, setShareSuccess] = useState(false);

	const handleShare = async () => {
		const success = await shareToClipboard();
		if (success) {
			setShareSuccess(true);
			setTimeout(() => setShareSuccess(false), 2000);
		}
	};

	return (
		<div
			className="h-screen w-screen flex items-center justify-center"
			style={{ backgroundColor: "#3a4a5a" }}
		>
			<div className="text-white flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200">
				<div className={`text-6xl ${isWon ? "animate-bounce" : ""}`}>
					{isWon ? "🎉" : "😔"}
				</div>
				<p className="text-2xl font-bold">
					{isWon ? "Congratulations!" : "Game Over"}
				</p>
				<p className="text-slate-300">
					{isWon ? "You've cleared all tiles!" : "No more moves available"}
				</p>
				<div className="flex flex-wrap justify-center gap-3 mt-4">
					{isDailyMode ? (
						<>
							<Button
								variant="default"
								className="bg-slate-700 hover:bg-slate-600 transition-colors"
								onClick={onHome}
							>
								<Home className="mr-2 h-4 w-4" />
								Home
							</Button>
							{isWon && (
								<Button
									variant="default"
									className="bg-blue-600 hover:bg-blue-500 transition-colors"
									onClick={handleShare}
								>
									<Share2 className="mr-2 h-4 w-4" />
									{shareSuccess ? "Copied!" : "Share"}
								</Button>
							)}
							<Button
								variant="default"
								className="bg-emerald-600 hover:bg-emerald-500 transition-colors"
								onClick={onReset}
							>
								<RotateCcw className="mr-2 h-4 w-4" />
								Try Again
							</Button>
						</>
					) : (
						<>
							<Button
								variant="default"
								className="bg-slate-700 hover:bg-slate-600 transition-colors"
								onClick={onHome}
							>
								<Home className="mr-2 h-4 w-4" />
								Home
							</Button>
							<Button
								variant="default"
								className="bg-emerald-600 hover:bg-emerald-500 transition-colors"
								onClick={onReset}
							>
								<RotateCcw className="mr-2 h-4 w-4" />
								Play Again
							</Button>
							{isWon && (
								<Button
									variant="default"
									className="bg-blue-600 hover:bg-blue-500 transition-colors"
									onClick={onSubmitScore}
								>
									Submit Score
								</Button>
							)}
						</>
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
			cameraRef.current.position.set(0, 18, 5);
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
			/>
			<OrbitControls
				enableDamping
				dampingFactor={0.05}
				enablePan={false}
				enableRotate={false}
				enableZoom
				minDistance={8}
				maxDistance={80}
				target={[0, 0, 0]}
			/>

			<ambientLight intensity={0.5} />
			<directionalLight
				position={[15, 15, 5]}
				intensity={0.8}
				castShadow
				shadow-mapSize-width={512}
				shadow-mapSize-height={512}
				shadow-camera-far={30}
				shadow-camera-left={-15}
				shadow-camera-right={15}
				shadow-camera-top={15}
				shadow-camera-bottom={-15}
			/>
			<directionalLight position={[-10, 12, -5]} intensity={0.3} />

			<TileInstances />

			{/* Shadow-receiving floor plane - uses shadowMaterial to be invisible
			    but still catch shadows, so background matches CSS exactly */}
			<mesh
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, -0.5, 0]}
				receiveShadow
			>
				<planeGeometry args={[100, 100]} />
				<shadowMaterial opacity={0.3} />
			</mesh>
		</>
	);
});

export function MahjongGame() {
	const [showScoreSubmission, setShowScoreSubmission] = useState(false);

	const viewState = useGameStore((s) => s.viewState);
	const isGameWon = useGameStore((s) => s.isGameWon);
	const elapsedTime = useGameStore((s) => s.elapsedTime);
	const possibleMoves = useGameStore((s) => s.possibleMoves);
	const isDailyMode = useGameStore((s) => s.isDailyMode);
	const puzzleNumber = useGameStore((s) => s.puzzleNumber);
	const resetGame = useGameStore((s) => s.resetGame);
	const startDailyPuzzle = useGameStore((s) => s.startDailyPuzzle);
	const goHome = useGameStore((s) => s.goHome);
	const undo = useGameStore((s) => s.undo);

	const handleScoreSubmitted = useCallback(() => {
		setShowScoreSubmission(false);
		goHome();
	}, [goHome]);

	const handleSubmitScore = useCallback(() => {
		setShowScoreSubmission(true);
	}, []);

	const handleResetGame = useCallback(() => {
		if (isDailyMode) {
			startDailyPuzzle();
		} else {
			resetGame();
		}
	}, [isDailyMode, startDailyPuzzle, resetGame]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === " " && viewState === "playing") {
				e.preventDefault();
				handleResetGame();
			} else if (e.ctrlKey && e.key === "z" && viewState === "playing") {
				e.preventDefault();
				undo();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleResetGame, undo, viewState]);

	if (viewState === "home") {
		return (
			<DailyHome onStartDaily={startDailyPuzzle} onStartRandom={resetGame} />
		);
	}

	if (viewState === "loading") {
		return <LoadingScreen />;
	}

	if (viewState === "gameOver") {
		return (
			<>
				<GameOverScreen
					isWon={isGameWon}
					onReset={handleResetGame}
					onHome={goHome}
					onSubmitScore={handleSubmitScore}
					isDailyMode={isDailyMode}
				/>
				{showScoreSubmission && isGameWon && !isDailyMode && (
					<ScoreSubmission
						time={elapsedTime}
						onScoreSubmitted={handleScoreSubmitted}
					/>
				)}
			</>
		);
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
					onReset={handleResetGame}
					onHome={goHome}
					isDailyMode={isDailyMode}
					puzzleNumber={puzzleNumber}
				/>
			</div>

			{!isDailyMode && (
				<div className="absolute right-4 top-4 z-10">
					<TopScores />
				</div>
			)}

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
