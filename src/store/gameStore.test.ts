import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createTileGrid } from "@/utils/mahjong/grid/gridUtils";
import type { TileData } from "@/utils/mahjong/types";
import { getDateString } from "@/utils/seededRandom";
import { clearSavedGame, getSavedGameSummary, useGameStore } from "./gameStore";

function createMemoryStorage(): Storage {
	const store = new Map<string, string>();
	return {
		get length() {
			return store.size;
		},
		clear() {
			store.clear();
		},
		getItem(key: string) {
			return store.get(key) ?? null;
		},
		key(index: number) {
			return Array.from(store.keys())[index] ?? null;
		},
		removeItem(key: string) {
			store.delete(key);
		},
		setItem(key: string, value: string) {
			store.set(key, value);
		},
	};
}

function makeTile(
	id: string,
	symbol: string,
	x: number,
	y = 0,
	z = 0,
): TileData {
	return {
		id,
		symbol,
		position: { x: 0, y: 0, z: 0 },
		gridPosition: { x, y, z },
		layer: y,
		isRemoved: false,
		isAccessible: true,
	};
}

describe("gameStore", () => {
	const originalStorage = globalThis.localStorage;

	beforeEach(() => {
		Object.defineProperty(globalThis, "localStorage", {
			value: createMemoryStorage(),
			configurable: true,
		});
		clearSavedGame();
		useGameStore.getState().goHome();
	});

	afterEach(() => {
		Object.defineProperty(globalThis, "localStorage", {
			value: originalStorage,
			configurable: true,
		});
	});

	test("ignores clicks on blocked tiles", () => {
		const left = makeTile("left", "Man1", 0);
		const middle = makeTile("middle", "Man2", 2);
		const right = makeTile("right", "Man1", 4);
		const tiles = [left, middle, right];

		useGameStore.setState({
			tiles,
			grid: createTileGrid(tiles),
			remainingTiles: tiles.length,
			viewState: "playing",
		});

		useGameStore.getState().selectTile(middle);
		expect(useGameStore.getState().selectedTileId).toBeNull();
	});

	test("selecting and deselecting does not replace the tiles array", () => {
		const a1 = makeTile("a1", "Man1", 0, 0, 0);
		const a2 = makeTile("a2", "Pin1", 4, 0, 0);
		const tiles = [a1, a2];

		useGameStore.setState({
			tiles,
			grid: createTileGrid(tiles),
			remainingTiles: tiles.length,
			viewState: "playing",
		});

		useGameStore.getState().selectTile(a1);
		expect(useGameStore.getState().selectedTileId).toBe("a1");
		expect(useGameStore.getState().tiles).toBe(tiles);

		useGameStore.getState().selectTile(a1);
		expect(useGameStore.getState().selectedTileId).toBeNull();
		expect(useGameStore.getState().tiles).toBe(tiles);
	});

	test("showHint highlights a playable pair and clears on selection", () => {
		const a1 = makeTile("a1", "Man1", 0, 0, 0);
		const a2 = makeTile("a2", "Man1", 4, 0, 0);
		const tiles = [a1, a2];

		useGameStore.setState({
			tiles,
			grid: createTileGrid(tiles),
			remainingTiles: tiles.length,
			viewState: "playing",
		});

		useGameStore.getState().showHint();
		expect(useGameStore.getState().hintPair).toEqual(["a1", "a2"]);

		useGameStore.getState().selectTile(a1);
		expect(useGameStore.getState().hintPair).toBeNull();
	});

	test("supports multi-step undo across consecutive matches", () => {
		const a1 = makeTile("a1", "Man1", 0, 0, 0);
		const a2 = makeTile("a2", "Man1", 4, 0, 0);
		const b1 = makeTile("b1", "Pin1", 0, 0, 4);
		const b2 = makeTile("b2", "Pin1", 4, 0, 4);
		const c1 = makeTile("c1", "Sou1", 0, 0, 8);
		const c2 = makeTile("c2", "Sou1", 4, 0, 8);
		const tiles = [a1, a2, b1, b2, c1, c2];

		useGameStore.setState({
			tiles,
			grid: createTileGrid(tiles),
			remainingTiles: tiles.length,
			viewState: "playing",
		});

		useGameStore.getState().selectTile(a1);
		useGameStore.getState().selectTile(a2);
		useGameStore.getState().selectTile(b1);
		useGameStore.getState().selectTile(b2);

		expect(useGameStore.getState().moveHistory).toHaveLength(2);
		expect(useGameStore.getState().remainingTiles).toBe(2);

		useGameStore.getState().undo();
		expect(useGameStore.getState().moveHistory).toHaveLength(1);
		expect(useGameStore.getState().remainingTiles).toBe(4);

		useGameStore.getState().undo();
		expect(useGameStore.getState().moveHistory).toHaveLength(0);
		expect(useGameStore.getState().remainingTiles).toBe(6);
	});

	test("auto-saves in-progress runs and resumes them with preserved elapsed time and history", () => {
		const a1 = makeTile("a1", "Man1", 0, 0, 0);
		const a2 = makeTile("a2", "Man1", 4, 0, 0);
		const b1 = makeTile("b1", "Pin1", 0, 0, 4);
		const b2 = makeTile("b2", "Pin1", 4, 0, 4);
		const tiles = [a1, a2, b1, b2];

		useGameStore.setState({
			tiles,
			grid: createTileGrid(tiles),
			remainingTiles: tiles.length,
			viewState: "playing",
			isDailyMode: true,
			layoutId: "fortress",
			puzzleDate: getDateString(),
			elapsedTime: 42,
		});

		useGameStore.getState().selectTile(a1);
		useGameStore.getState().selectTile(a2);
		useGameStore.getState().goHome();

		const summary = getSavedGameSummary();
		expect(summary).not.toBeNull();
		expect(summary?.remainingTiles).toBe(2);
		expect(summary?.layoutId).toBe("fortress");
		expect(summary?.isDailyMode).toBe(true);

		const resumed = useGameStore.getState().resumeSavedGame();
		expect(resumed).toBe(true);
		expect(useGameStore.getState().viewState).toBe("playing");
		expect(useGameStore.getState().remainingTiles).toBe(2);
		expect(useGameStore.getState().layoutId).toBe("fortress");
		expect(useGameStore.getState().moveHistory).toEqual([["a1", "a2"]]);
		expect(useGameStore.getState().elapsedTime).toBeGreaterThanOrEqual(42);
	});

	test("expires stale daily saves from previous dates", () => {
		const a1 = makeTile("a1", "Man1", 0, 0, 0);
		const a2 = makeTile("a2", "Man1", 4, 0, 0);
		const tiles = [a1, a2];

		useGameStore.setState({
			tiles,
			grid: createTileGrid(tiles),
			remainingTiles: tiles.length,
			viewState: "playing",
			isDailyMode: true,
			layoutId: "turtle",
			puzzleDate: "2020-01-01",
		});

		useGameStore.getState().saveGame();
		expect(getSavedGameSummary()).toBeNull();
	});
});
