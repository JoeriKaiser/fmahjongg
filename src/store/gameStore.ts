import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { recordCompletion } from "@/utils/dailyPuzzle";
import { recordRandomTime } from "@/utils/localScores";
import {
	createTileGrid,
	isTileAccessible,
} from "@/utils/mahjong/grid/gridUtils";
import { generateInitialLayout } from "@/utils/mahjong/layout/generator";
import {
	getDailyLayout,
	LAYOUTS,
	type LayoutId,
} from "@/utils/mahjong/layout/layouts";
import { canMatch } from "@/utils/mahjong/matching/matcher";
import type { TileData, TileGrid } from "@/utils/mahjong/types";
import { findAvailableMoves } from "@/utils/mahjong/validation/moves";
import {
	getDailySeed,
	getDateString,
	getPuzzleNumber,
	SeededRandom,
} from "@/utils/seededRandom";
import {
	getInitialSoundMuted,
	persistSoundMuted,
	playBlockedSound,
	playMatchSound,
	playSelectSound,
	playWinSound,
} from "@/utils/sound";

type ViewState = "home" | "playing" | "gameOver";

const HIGHLIGHT_STORAGE_KEY = "fmahjongg-highlight-free";
const ACTIVE_SAVE_KEY = "fmahjongg-active-game";
const SAVE_SCHEMA_VERSION = 1;

export interface SavedGameSummary {
	isDailyMode: boolean;
	layoutId: LayoutId;
	puzzleDate: string;
	puzzleNumber: number;
	remainingTiles: number;
	elapsedTime: number;
}

interface SavedGamePayload extends SavedGameSummary {
	version: number;
	tiles: TileData[];
	moveHistory: Array<[string, string]>;
}

function getInitialHighlightFree(): boolean {
	try {
		return localStorage.getItem(HIGHLIGHT_STORAGE_KEY) === "true";
	} catch {
		return false;
	}
}

function persistHighlightFree(enabled: boolean): void {
	try {
		localStorage.setItem(HIGHLIGHT_STORAGE_KEY, String(enabled));
	} catch {}
}

function readSavedGame(): SavedGamePayload | null {
	try {
		const raw = localStorage.getItem(ACTIVE_SAVE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<SavedGamePayload>;
		if (
			parsed.version !== SAVE_SCHEMA_VERSION ||
			!Array.isArray(parsed.tiles) ||
			parsed.tiles.length === 0 ||
			!parsed.layoutId ||
			!(parsed.layoutId in LAYOUTS)
		) {
			return null;
		}
		if (parsed.isDailyMode && parsed.puzzleDate !== getDateString()) {
			localStorage.removeItem(ACTIVE_SAVE_KEY);
			return null;
		}
		const remaining = parsed.tiles.filter((t) => !t.isRemoved).length;
		if (remaining === 0) {
			localStorage.removeItem(ACTIVE_SAVE_KEY);
			return null;
		}
		return {
			version: SAVE_SCHEMA_VERSION,
			isDailyMode: Boolean(parsed.isDailyMode),
			layoutId: parsed.layoutId,
			puzzleDate: parsed.puzzleDate ?? getDateString(),
			puzzleNumber: parsed.puzzleNumber ?? getPuzzleNumber(),
			remainingTiles: remaining,
			elapsedTime:
				typeof parsed.elapsedTime === "number" ? parsed.elapsedTime : 0,
			tiles: parsed.tiles,
			moveHistory: Array.isArray(parsed.moveHistory) ? parsed.moveHistory : [],
		};
	} catch {
		return null;
	}
}

export function getSavedGameSummary(): SavedGameSummary | null {
	const saved = readSavedGame();
	if (!saved) return null;
	return {
		isDailyMode: saved.isDailyMode,
		layoutId: saved.layoutId,
		puzzleDate: saved.puzzleDate,
		puzzleNumber: saved.puzzleNumber,
		remainingTiles: saved.remainingTiles,
		elapsedTime: saved.elapsedTime,
	};
}

export function clearSavedGame(): void {
	try {
		localStorage.removeItem(ACTIVE_SAVE_KEY);
	} catch {}
}

interface GameState {
	tiles: TileData[];
	grid: TileGrid;
	selectedTileId: string | null;
	hintPair: [string, string] | null;
	gameOver: boolean;
	isGameWon: boolean;
	viewState: ViewState;
	possibleMoves: number;
	remainingTiles: number;
	startTime: number | null;
	elapsedTime: number;
	timerIntervalId: number | null;
	moveHistory: Array<[string, string]>;
	isDailyMode: boolean;
	layoutId: LayoutId;
	boardVersion: number;
	puzzleNumber: number;
	puzzleDate: string;
	highlightFreeTiles: boolean;
	soundMuted: boolean;

	selectTile: (tile: TileData) => void;
	clearSelection: () => void;
	showHint: () => void;
	toggleHighlightFreeTiles: () => void;
	toggleSoundMuted: () => void;
	resetGame: (layoutId?: LayoutId) => void;
	startDailyPuzzle: (forceRestart?: boolean) => void;
	resumeSavedGame: () => boolean;
	updatePossibleMoves: () => void;
	startTimer: () => void;
	stopTimer: () => void;
	updateTimer: () => void;
	undo: () => void;
	goHome: () => void;
	saveGame: () => void;
	loadGame: () => boolean;
}

function withAccessibility(tiles: TileData[], grid: TileGrid): TileData[] {
	return tiles.map((t) => {
		const accessible = isTileAccessible(t, grid);
		return t.isAccessible === accessible
			? t
			: { ...t, isAccessible: accessible };
	});
}

export const useGameStore = create<GameState>()(
	subscribeWithSelector((set, get) => ({
		tiles: [],
		grid: new Map(),
		selectedTileId: null,
		hintPair: null,
		gameOver: false,
		isGameWon: false,
		viewState: "home" as ViewState,
		possibleMoves: 0,
		remainingTiles: 0,
		startTime: null,
		elapsedTime: 0,
		timerIntervalId: null,
		moveHistory: [],
		isDailyMode: true,
		layoutId: getDailyLayout(getPuzzleNumber()).id,
		boardVersion: 0,
		puzzleNumber: getPuzzleNumber(),
		puzzleDate: getDateString(),
		highlightFreeTiles: getInitialHighlightFree(),
		soundMuted: getInitialSoundMuted(),

		selectTile: (tile) => {
			const state = get();

			if (tile.isRemoved || state.gameOver) return;
			if (!isTileAccessible(tile, state.grid)) {
				playBlockedSound(state.soundMuted);
				return;
			}

			if (!state.startTime) {
				get().startTimer();
			}

			if (!state.selectedTileId) {
				playSelectSound(state.soundMuted);
				set({ selectedTileId: tile.id, hintPair: null });
				return;
			}

			if (state.selectedTileId === tile.id) {
				playSelectSound(state.soundMuted);
				set({ selectedTileId: null, hintPair: null });
				return;
			}

			const previousSelected = state.tiles.find(
				(t) => t.id === state.selectedTileId,
			);

			if (previousSelected && canMatch(previousSelected, tile, state.grid)) {
				playMatchSound(state.soundMuted);
				const matchedId1 = previousSelected.id;
				const matchedId2 = tile.id;
				const removedTiles = state.tiles.map((t) =>
					t.id === matchedId1 || t.id === matchedId2
						? { ...t, isRemoved: true, isAccessible: false }
						: t,
				);

				const newGrid = createTileGrid(removedTiles);
				const updatedTiles = withAccessibility(removedTiles, newGrid);

				set({
					selectedTileId: null,
					hintPair: null,
					tiles: updatedTiles,
					grid: newGrid,
					remainingTiles: newGrid.size,
					moveHistory: [...state.moveHistory, [matchedId1, matchedId2]],
				});

				get().saveGame();
				queueMicrotask(() => get().updatePossibleMoves());
			} else {
				playSelectSound(state.soundMuted);
				set({ selectedTileId: tile.id, hintPair: null });
			}
		},

		clearSelection: () => set({ selectedTileId: null, hintPair: null }),

		showHint: () => {
			const state = get();
			if (state.gameOver || state.viewState !== "playing") return;

			const moves = findAvailableMoves(state.tiles, state.grid);
			if (moves.length === 0) return;

			let bestMove = moves[0];
			let bestLayerScore = bestMove.tile1.layer + bestMove.tile2.layer;
			for (let i = 1; i < moves.length; i++) {
				const score = moves[i].tile1.layer + moves[i].tile2.layer;
				if (score > bestLayerScore) {
					bestLayerScore = score;
					bestMove = moves[i];
				}
			}

			playSelectSound(state.soundMuted);
			set({
				hintPair: [bestMove.tile1.id, bestMove.tile2.id],
				selectedTileId: null,
			});
		},

		toggleHighlightFreeTiles: () => {
			const next = !get().highlightFreeTiles;
			persistHighlightFree(next);
			set({ highlightFreeTiles: next });
		},

		toggleSoundMuted: () => {
			const next = !get().soundMuted;
			persistSoundMuted(next);
			set({ soundMuted: next });
		},

		resetGame: (requestedLayoutId) => {
			const state = get();
			const layoutId = requestedLayoutId ?? state.layoutId;

			if (state.timerIntervalId) {
				clearInterval(state.timerIntervalId);
			}
			clearSavedGame();

			const newTiles = generateInitialLayout(
				undefined,
				LAYOUTS[layoutId].layers,
			);
			const newGrid = createTileGrid(newTiles);
			const moves = findAvailableMoves(newTiles, newGrid);

			set({
				tiles: newTiles,
				grid: newGrid,
				remainingTiles: newGrid.size,
				possibleMoves: moves.length,
				viewState: "playing",
				startTime: null,
				elapsedTime: 0,
				timerIntervalId: null,
				gameOver: false,
				isGameWon: false,
				selectedTileId: null,
				hintPair: null,
				moveHistory: [],
				isDailyMode: false,
				layoutId,
				boardVersion: state.boardVersion + 1,
			});
		},

		startDailyPuzzle: (forceRestart = false) => {
			if (!forceRestart) {
				const saved = readSavedGame();
				if (saved?.isDailyMode && saved.puzzleDate === getDateString()) {
					if (get().loadGame()) return;
				}
			}

			const state = get();

			if (state.timerIntervalId) {
				clearInterval(state.timerIntervalId);
			}
			clearSavedGame();

			const puzzleNumber = getPuzzleNumber();
			const puzzleDate = getDateString();
			const dailyLayout = getDailyLayout(puzzleNumber);
			const seed = getDailySeed();
			const rng = new SeededRandom(seed);
			const newTiles = generateInitialLayout(rng, dailyLayout.layers);
			const newGrid = createTileGrid(newTiles);
			const moves = findAvailableMoves(newTiles, newGrid);

			set({
				tiles: newTiles,
				grid: newGrid,
				remainingTiles: newGrid.size,
				possibleMoves: moves.length,
				viewState: "playing",
				startTime: null,
				elapsedTime: 0,
				timerIntervalId: null,
				gameOver: false,
				isGameWon: false,
				selectedTileId: null,
				hintPair: null,
				moveHistory: [],
				isDailyMode: true,
				layoutId: dailyLayout.id,
				boardVersion: state.boardVersion + 1,
				puzzleNumber,
				puzzleDate,
			});
		},

		resumeSavedGame: () => get().loadGame(),

		updatePossibleMoves: () => {
			const state = get();
			const activeCount = state.grid.size;

			if (activeCount === 0 && state.tiles.length > 0) {
				get().stopTimer();
				clearSavedGame();
				const finalTime = get().elapsedTime;
				playWinSound(state.soundMuted);
				set({
					gameOver: true,
					isGameWon: true,
					possibleMoves: 0,
					remainingTiles: 0,
					viewState: "gameOver",
				});

				if (state.isDailyMode) {
					recordCompletion(finalTime);
				} else {
					recordRandomTime(finalTime);
				}
				return;
			}

			const moves = findAvailableMoves(state.tiles, state.grid);

			if (moves.length === 0) {
				get().stopTimer();
				clearSavedGame();
				set({
					gameOver: true,
					isGameWon: false,
					possibleMoves: 0,
					viewState: "gameOver",
				});
			} else {
				set({ possibleMoves: moves.length, remainingTiles: activeCount });
			}
		},

		startTimer: () => {
			const state = get();

			if (state.timerIntervalId) {
				clearInterval(state.timerIntervalId);
			}

			const startTime = Date.now() - state.elapsedTime * 1000;
			const intervalId =
				typeof window !== "undefined"
					? window.setInterval(() => get().updateTimer(), 1000)
					: null;

			set({ startTime, timerIntervalId: intervalId });
		},

		stopTimer: () => {
			const state = get();

			if (state.timerIntervalId) {
				clearInterval(state.timerIntervalId);
			}

			if (state.startTime) {
				set({
					elapsedTime: Math.floor((Date.now() - state.startTime) / 1000),
					startTime: null,
					timerIntervalId: null,
				});
			}
		},

		updateTimer: () => {
			const state = get();
			if (state.startTime) {
				set({ elapsedTime: Math.floor((Date.now() - state.startTime) / 1000) });
			}
		},

		undo: () => {
			const state = get();
			if (state.moveHistory.length === 0) return;

			const [id1, id2] = state.moveHistory[state.moveHistory.length - 1];
			const restoredTiles = state.tiles.map((t) =>
				t.id === id1 || t.id === id2 ? { ...t, isRemoved: false } : t,
			);
			const newGrid = createTileGrid(restoredTiles);
			const updatedTiles = withAccessibility(restoredTiles, newGrid);

			playSelectSound(state.soundMuted);
			set({
				tiles: updatedTiles,
				grid: newGrid,
				remainingTiles: newGrid.size,
				moveHistory: state.moveHistory.slice(0, -1),
				selectedTileId: null,
				hintPair: null,
			});
			get().saveGame();
			queueMicrotask(() => get().updatePossibleMoves());
		},

		goHome: () => {
			const state = get();

			if (state.viewState === "playing" && !state.gameOver) {
				get().stopTimer();
				if (get().moveHistory.length > 0 || get().elapsedTime > 0) {
					get().saveGame();
				}
			} else if (state.timerIntervalId) {
				clearInterval(state.timerIntervalId);
			}

			set({
				tiles: [],
				grid: new Map(),
				selectedTileId: null,
				hintPair: null,
				gameOver: false,
				isGameWon: false,
				viewState: "home",
				possibleMoves: 0,
				remainingTiles: 0,
				startTime: null,
				elapsedTime: 0,
				timerIntervalId: null,
				moveHistory: [],
			});
		},

		saveGame: () => {
			const state = get();
			if (state.gameOver || state.tiles.length === 0) return;

			const elapsedTime = state.startTime
				? Math.floor((Date.now() - state.startTime) / 1000)
				: state.elapsedTime;

			const payload: SavedGamePayload = {
				version: SAVE_SCHEMA_VERSION,
				tiles: state.tiles,
				moveHistory: state.moveHistory,
				isDailyMode: state.isDailyMode,
				layoutId: state.layoutId,
				puzzleNumber: state.puzzleNumber,
				puzzleDate: state.puzzleDate,
				remainingTiles: state.grid.size,
				elapsedTime,
			};

			try {
				localStorage.setItem(ACTIVE_SAVE_KEY, JSON.stringify(payload));
			} catch {}
		},

		loadGame: () => {
			const saved = readSavedGame();
			if (!saved) return false;

			const state = get();
			if (state.timerIntervalId) {
				clearInterval(state.timerIntervalId);
			}

			const grid = createTileGrid(saved.tiles);
			const tiles = withAccessibility(saved.tiles, grid);
			const moves = findAvailableMoves(tiles, grid);

			set({
				tiles,
				grid,
				remainingTiles: grid.size,
				possibleMoves: moves.length,
				selectedTileId: null,
				hintPair: null,
				gameOver: false,
				isGameWon: false,
				viewState: "playing",
				startTime: null,
				elapsedTime: saved.elapsedTime,
				timerIntervalId: null,
				moveHistory: saved.moveHistory,
				isDailyMode: saved.isDailyMode,
				layoutId: saved.layoutId,
				boardVersion: state.boardVersion + 1,
				puzzleNumber: saved.puzzleNumber,
				puzzleDate: saved.puzzleDate,
			});

			if (saved.elapsedTime > 0 || saved.moveHistory.length > 0) {
				get().startTimer();
			}

			return true;
		},
	})),
);
