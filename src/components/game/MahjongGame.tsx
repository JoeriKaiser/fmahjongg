import {
	Eye,
	EyeOff,
	Home,
	Lightbulb,
	Loader2,
	RotateCcw,
	Share2,
	Undo2,
	Volume2,
	VolumeX,
} from "lucide-react";
import type { ComponentType } from "react";
import {
	lazy,
	memo,
	Suspense,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/store/gameStore";
import { shareToClipboard } from "@/utils/dailyPuzzle";
import { LAYOUTS, type LayoutId } from "@/utils/mahjong/layout/layouts";
import { DailyHome } from "./DailyHome";
import { TopScores } from "./TopScores";

let cachedGameCanvas: ComponentType | null = null;
let preloadPromise: Promise<{ default: ComponentType }> | null = null;

function loadGameCanvas(): Promise<{ default: ComponentType }> {
	if (!preloadPromise) {
		preloadPromise = import("./GameCanvas").then((mod) => {
			cachedGameCanvas = mod.GameCanvas;
			return mod;
		});
	}
	return preloadPromise;
}

const LazyGameCanvas = lazy(loadGameCanvas);

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const GameTimer = memo(function GameTimer() {
	const elapsedTime = useGameStore((s) => s.elapsedTime);
	return (
		<span className="font-mono tabular-nums">{formatTime(elapsedTime)}</span>
	);
});

const GameInfoPanel = memo(function GameInfoPanel({
	possibleMoves,
	remainingTiles,
	canUndo,
	highlightFreeTiles,
	soundMuted,
	onUndo,
	onHint,
	onToggleHighlightFree,
	onToggleMute,
	onRestartRequest,
	onHome,
	isDailyMode,
	layoutId,
	puzzleNumber,
}: {
	possibleMoves: number;
	remainingTiles: number;
	canUndo: boolean;
	highlightFreeTiles: boolean;
	soundMuted: boolean;
	onUndo: () => void;
	onHint: () => void;
	onToggleHighlightFree: () => void;
	onToggleMute: () => void;
	onRestartRequest: () => void;
	onHome: () => void;
	isDailyMode: boolean;
	layoutId: LayoutId;
	puzzleNumber: number;
}) {
	const layoutName = LAYOUTS[layoutId].name;

	return (
		<Card className="w-full md:w-64 rounded-none md:rounded-xl border-x-0 border-t-0 md:border">
			<CardHeader className="p-3 pb-2 md:p-5 md:pb-2">
				<div className="flex items-baseline justify-between gap-2 md:block">
					<h1 className="text-sm sm:text-base md:text-lg font-bold leading-snug tracking-[-0.01em] text-start">
						{isDailyMode ? `Daily #${puzzleNumber}` : layoutName}
					</h1>
					{isDailyMode && (
						<p className="text-xs text-slate-300 text-start">
							{layoutName} layout
						</p>
					)}
				</div>
			</CardHeader>
			<CardContent className="p-3 pt-0 md:p-5 md:pt-0">
				<dl className="flex items-center justify-between gap-3 md:block md:space-y-1.5">
					<div className="flex items-baseline gap-1.5 md:justify-between text-xs md:text-sm">
						<dt className="text-slate-300">Tiles</dt>
						<dd className="font-mono tabular-nums font-semibold md:font-normal">
							{remainingTiles}
						</dd>
					</div>
					<div className="flex items-baseline gap-1.5 md:justify-between text-xs md:text-sm">
						<dt className="text-slate-300">Moves</dt>
						<dd className="font-mono tabular-nums font-semibold md:font-normal">
							{possibleMoves}
						</dd>
					</div>
					<div className="flex items-baseline gap-1.5 md:justify-between text-xs md:text-sm">
						<dt className="text-slate-300">Time</dt>
						<dd className="font-semibold md:font-normal">
							<GameTimer />
						</dd>
					</div>
				</dl>
				<div
					role="toolbar"
					aria-label="Board controls"
					className="grid grid-cols-6 md:grid-cols-3 gap-1.5 pt-2.5 md:pt-3"
				>
					<Button
						variant="secondary"
						size="sm"
						title="Undo last match (Ctrl+Z)"
						aria-label="Undo last match"
						disabled={!canUndo}
						className="px-0 md:px-3"
						onClick={onUndo}
					>
						<Undo2 aria-hidden="true" />
					</Button>
					<Button
						variant="secondary"
						size="sm"
						title="Show hint (H)"
						aria-label="Show hint"
						className="px-0 md:px-3"
						onClick={onHint}
					>
						<Lightbulb className="text-amber-300" aria-hidden="true" />
					</Button>
					<Button
						variant={highlightFreeTiles ? "default" : "secondary"}
						size="sm"
						title="Highlight free tiles"
						aria-label="Highlight free tiles"
						aria-pressed={highlightFreeTiles}
						className="px-0 md:px-3"
						onClick={onToggleHighlightFree}
					>
						{highlightFreeTiles ? (
							<Eye aria-hidden="true" />
						) : (
							<EyeOff aria-hidden="true" />
						)}
					</Button>
					<Button
						variant="secondary"
						size="sm"
						title="Mute sound"
						aria-label="Mute sound"
						aria-pressed={soundMuted}
						className="px-0 md:px-3"
						onClick={onToggleMute}
					>
						{soundMuted ? (
							<VolumeX className="text-slate-300" aria-hidden="true" />
						) : (
							<Volume2 aria-hidden="true" />
						)}
					</Button>
					<Button
						variant="secondary"
						size="sm"
						title="Restart puzzle"
						aria-label="Restart puzzle"
						className="px-0 md:px-3"
						onClick={onRestartRequest}
					>
						<RotateCcw aria-hidden="true" />
					</Button>
					<Button
						variant="secondary"
						size="sm"
						title="Return home"
						aria-label="Return home"
						className="px-0 md:px-3"
						onClick={onHome}
					>
						<Home aria-hidden="true" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
});

const ControlsHelp = memo(function ControlsHelp() {
	const [show, setShow] = useState(false);
	const panelId = useId();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!show) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				setShow(false);
			}
		};

		const handlePointerDown = (e: PointerEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setShow(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("pointerdown", handlePointerDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [show]);

	return (
		<div ref={containerRef} className="relative">
			<Button
				variant="secondary"
				size="sm"
				aria-label="Controls help"
				aria-expanded={show}
				aria-controls={panelId}
				className="bg-card/90 hover:bg-slate-700/90 backdrop-blur-sm border-slate-700/80"
				onClick={() => setShow((prev) => !prev)}
			>
				<span className="text-sm font-semibold" aria-hidden="true">
					?
				</span>
			</Button>

			{show && (
				<Card
					id={panelId}
					className="absolute bottom-12 end-0 w-64 max-w-[calc(100vw-2rem)] overscroll-contain motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 duration-150"
				>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm text-start">Controls</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="text-xs space-y-1.5 text-start text-slate-200 leading-relaxed">
							<li>Select a free tile to pair it</li>
							<li>Scroll or pinch to zoom</li>
							<li>Ctrl or Cmd + Z to undo</li>
							<li>Press H for a hint</li>
							<li>Press Esc to clear selection</li>
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
});

const RestartConfirmDialog = memo(function RestartConfirmDialog({
	open,
	onCancel,
	onConfirm,
}: {
	open: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby="restart-dialog-title"
			aria-describedby="restart-dialog-desc"
			onCancel={(e) => {
				e.preventDefault();
				onCancel();
			}}
			className="m-auto w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-slate-700/80 bg-card p-6 text-card-foreground shadow-2xl overscroll-contain"
		>
			<h2
				id="restart-dialog-title"
				className="text-lg font-semibold leading-snug text-start"
			>
				Restart this puzzle?
			</h2>
			<p
				id="restart-dialog-desc"
				className="mt-2 text-sm text-slate-300 text-start text-pretty leading-relaxed"
			>
				Your current progress and timer for this board will be lost.
			</p>
			<div className="mt-5 flex justify-end gap-2">
				<Button variant="secondary" onClick={onCancel}>
					Cancel
				</Button>
				<Button variant="destructive" onClick={onConfirm}>
					Restart puzzle
				</Button>
			</div>
		</dialog>
	);
});

const LoadingScreen = memo(function LoadingScreen() {
	return (
		<output
			aria-live="polite"
			className="h-full w-full bg-background flex items-center justify-center"
		>
			<div className="text-white flex flex-col items-center gap-4">
				<Loader2
					className="h-10 w-10 text-emerald-400 motion-safe:animate-spin"
					aria-hidden="true"
				/>
				<p className="text-base text-slate-200">Loading board…</p>
			</div>
		</output>
	);
});

const GameOverScreen = memo(function GameOverScreen({
	isWon,
	onReset,
	onHome,
	isDailyMode,
}: {
	isWon: boolean;
	onReset: () => void;
	onHome: () => void;
	isDailyMode: boolean;
}) {
	const elapsedTime = useGameStore((s) => s.elapsedTime);
	const [shareStatus, setShareStatus] = useState("");

	const handleShare = async () => {
		const success = await shareToClipboard();
		if (success) {
			setShareStatus("Result copied to clipboard");
			setTimeout(() => setShareStatus(""), 2500);
		}
	};

	return (
		<div className="min-h-dvh w-full bg-background flex items-center justify-center px-4 py-8">
			<div className="text-white flex flex-col items-center gap-5 max-w-md w-full motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 duration-200">
				<h1 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-balance">
					{isWon ? "Board cleared" : "No moves left"}
				</h1>
				{isWon && (
					<div className="text-4xl font-mono font-bold tabular-nums text-emerald-300">
						{formatTime(elapsedTime)}
					</div>
				)}
				<p className="text-slate-200 text-center text-pretty">
					{isWon
						? "Every pair matched."
						: "No playable pairs remain on this board."}
				</p>
				<div className="flex flex-wrap justify-center gap-3 mt-2">
					<Button variant="secondary" onClick={onHome}>
						<Home aria-hidden="true" />
						Home
					</Button>
					{isDailyMode && isWon ? (
						<>
							<Button variant="default" onClick={handleShare}>
								<Share2 aria-hidden="true" />
								{shareStatus ? "Copied" : "Share result"}
							</Button>
							<Button variant="secondary" onClick={onReset}>
								<RotateCcw aria-hidden="true" />
								Replay
							</Button>
						</>
					) : (
						<Button variant="default" onClick={onReset}>
							<RotateCcw aria-hidden="true" />
							{isDailyMode ? "Replay" : "Play again"}
						</Button>
					)}
				</div>
				<output aria-live="polite" className="sr-only">
					{shareStatus}
				</output>
			</div>
		</div>
	);
});

export function MahjongGame() {
	const viewState = useGameStore((s) => s.viewState);
	const isGameWon = useGameStore((s) => s.isGameWon);
	const possibleMoves = useGameStore((s) => s.possibleMoves);
	const remainingTiles = useGameStore((s) => s.remainingTiles);
	const canUndo = useGameStore((s) => s.moveHistory.length > 0);
	const highlightFreeTiles = useGameStore((s) => s.highlightFreeTiles);
	const soundMuted = useGameStore((s) => s.soundMuted);
	const isDailyMode = useGameStore((s) => s.isDailyMode);
	const layoutId = useGameStore((s) => s.layoutId);
	const puzzleNumber = useGameStore((s) => s.puzzleNumber);
	const resetGame = useGameStore((s) => s.resetGame);
	const startDailyPuzzle = useGameStore((s) => s.startDailyPuzzle);
	const resumeSavedGame = useGameStore((s) => s.resumeSavedGame);
	const saveGame = useGameStore((s) => s.saveGame);
	const goHome = useGameStore((s) => s.goHome);
	const undo = useGameStore((s) => s.undo);
	const showHint = useGameStore((s) => s.showHint);
	const clearSelection = useGameStore((s) => s.clearSelection);
	const toggleHighlightFreeTiles = useGameStore(
		(s) => s.toggleHighlightFreeTiles,
	);
	const toggleSoundMuted = useGameStore((s) => s.toggleSoundMuted);

	const [confirmRestartOpen, setConfirmRestartOpen] = useState(false);
	const [announcement, setAnnouncement] = useState("");

	useEffect(() => {
		if (viewState === "playing") {
			document.title = isDailyMode
				? `Daily #${puzzleNumber} - Fast Mahjong`
				: `${LAYOUTS[layoutId].name} - Fast Mahjong`;
		} else {
			document.title = "Fast Mahjong";
		}
	}, [viewState, isDailyMode, puzzleNumber, layoutId]);

	const handleResetGame = useCallback(() => {
		setConfirmRestartOpen(false);
		if (isDailyMode) {
			startDailyPuzzle(true);
		} else {
			resetGame(layoutId);
		}
	}, [isDailyMode, layoutId, startDailyPuzzle, resetGame]);

	const handleRestartRequest = useCallback(() => {
		if (canUndo) {
			setConfirmRestartOpen(true);
		} else {
			handleResetGame();
		}
	}, [canUndo, handleResetGame]);

	const handleUndo = useCallback(() => {
		if (!canUndo) return;
		undo();
		setAnnouncement("Last match undone");
	}, [canUndo, undo]);

	const handleHint = useCallback(() => {
		showHint();
		setAnnouncement("Playable pair highlighted");
	}, [showHint]);

	useEffect(() => {
		if (viewState !== "home") return;

		const timer = setTimeout(() => {
			loadGameCanvas().catch(() => {});
		}, 50);

		return () => clearTimeout(timer);
	}, [viewState]);

	useEffect(() => {
		if (viewState !== "playing") return;

		const handlePersist = () => saveGame();
		const handleVisibility = () => {
			if (document.visibilityState === "hidden") {
				saveGame();
			}
		};

		window.addEventListener("beforeunload", handlePersist);
		document.addEventListener("visibilitychange", handleVisibility);
		return () => {
			window.removeEventListener("beforeunload", handlePersist);
			document.removeEventListener("visibilitychange", handleVisibility);
		};
	}, [viewState, saveGame]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (viewState !== "playing" || confirmRestartOpen) return;

			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
				e.preventDefault();
				handleUndo();
			} else if (e.key.toLowerCase() === "h" && !e.ctrlKey && !e.metaKey) {
				e.preventDefault();
				handleHint();
			} else if (e.key === "Escape") {
				clearSelection();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleUndo, handleHint, clearSelection, viewState, confirmRestartOpen]);

	if (viewState === "home") {
		return (
			<DailyHome
				onStartDaily={startDailyPuzzle}
				onStartRandom={resetGame}
				onResumeSaved={resumeSavedGame}
			/>
		);
	}

	if (viewState === "gameOver") {
		return (
			<GameOverScreen
				isWon={isGameWon}
				onReset={handleResetGame}
				onHome={goHome}
				isDailyMode={isDailyMode}
			/>
		);
	}

	return (
		<div className="relative flex flex-col md:block h-dvh w-full bg-background overflow-hidden motion-safe:animate-in motion-safe:fade-in duration-300">
			<div className="shrink-0 z-10 md:absolute md:start-4 md:top-4">
				<GameInfoPanel
					possibleMoves={possibleMoves}
					remainingTiles={remainingTiles}
					canUndo={canUndo}
					highlightFreeTiles={highlightFreeTiles}
					soundMuted={soundMuted}
					onUndo={handleUndo}
					onHint={handleHint}
					onToggleHighlightFree={toggleHighlightFreeTiles}
					onToggleMute={toggleSoundMuted}
					onRestartRequest={handleRestartRequest}
					onHome={goHome}
					isDailyMode={isDailyMode}
					layoutId={layoutId}
					puzzleNumber={puzzleNumber}
				/>
			</div>

			{!isDailyMode && (
				<div className="hidden md:block absolute end-4 top-4 z-10">
					<TopScores />
				</div>
			)}

			<div className="absolute bottom-3 end-3 md:bottom-4 md:end-4 z-10">
				<ControlsHelp />
			</div>

			<RestartConfirmDialog
				open={confirmRestartOpen}
				onCancel={() => setConfirmRestartOpen(false)}
				onConfirm={handleResetGame}
			/>

			<output aria-live="polite" className="sr-only">
				{announcement}
			</output>

			<div className="relative flex-1 min-h-0 md:h-full md:w-full">
				{cachedGameCanvas ? (
					(() => {
						const ResolvedCanvas = cachedGameCanvas;
						return <ResolvedCanvas />;
					})()
				) : (
					<Suspense fallback={<LoadingScreen />}>
						<LazyGameCanvas />
					</Suspense>
				)}
			</div>
		</div>
	);
}
