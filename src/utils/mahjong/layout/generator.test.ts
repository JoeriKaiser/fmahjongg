import { describe, expect, test } from "bun:test";
import { SeededRandom } from "@/utils/seededRandom";
import { REGULAR_SYMBOLS, TILE_SYMBOLS } from "../constants";
import { createTileGrid, getNeighbors } from "../grid/gridUtils";
import { findMatchableTiles } from "../matching/matcher";
import { verifySolution } from "../validation/solvability";
import {
	createLayoutSlots,
	generateInitialLayout,
	generateSolvableLayout,
} from "./generator";
import {
	countTotalTiles,
	FORTRESS_LAYERS,
	getDailyLayout,
	LAYOUT_LIST,
} from "./layouts";

describe("generator", () => {
	test("builds a standard 144-tile Mahjong deck", () => {
		const tiles = generateInitialLayout(new SeededRandom(20261118));
		expect(tiles).toHaveLength(144);

		const counts = new Map<string, number>();
		for (const tile of tiles) {
			counts.set(tile.symbol, (counts.get(tile.symbol) ?? 0) + 1);
		}

		for (const symbol of REGULAR_SYMBOLS) {
			expect(counts.get(symbol)).toBe(4);
		}
		for (const season of TILE_SYMBOLS.seasons) {
			expect(counts.get(season)).toBe(1);
		}
		for (const flower of TILE_SYMBOLS.flowers) {
			expect(counts.get(flower)).toBe(1);
		}
	});

	test("is deterministic for a given daily seed", () => {
		const a = generateInitialLayout(new SeededRandom(20260501));
		const b = generateInitialLayout(new SeededRandom(20260501));
		const c = generateInitialLayout(new SeededRandom(20260502));

		expect(a.map((t) => t.symbol)).toEqual(b.map((t) => t.symbol));
		expect(a.map((t) => t.symbol)).not.toEqual(c.map((t) => t.symbol));
	});

	test("all layouts contain 144 tiles, center around origin, and generate verified solvable boards", () => {
		for (const layout of LAYOUT_LIST) {
			expect(countTotalTiles(layout.layers)).toBe(144);

			const slots = createLayoutSlots(layout.layers);
			const xs = slots.map((t) => t.position.x);
			const zs = slots.map((t) => t.position.z);
			expect(Math.min(...xs) + Math.max(...xs)).toBeCloseTo(0, 6);
			expect(Math.min(...zs) + Math.max(...zs)).toBeCloseTo(0, 6);

			for (let i = 0; i < 40; i++) {
				const seed = 20260101 + i;
				const { tiles, solution } = generateSolvableLayout(
					new SeededRandom(seed),
					layout.layers,
				);

				expect(tiles).toHaveLength(144);
				expect(solution).toHaveLength(72);
				expect(verifySolution(tiles, solution)).toBe(true);

				const grid = createTileGrid(tiles);
				const initialMoves = findMatchableTiles(tiles, grid);
				expect(initialMoves.length).toBeGreaterThan(0);
			}
		}
	});

	test("fortress corner capstones block all 16 Layer 2 corner tiles underneath them", () => {
		const slots = createLayoutSlots(FORTRESS_LAYERS);
		const grid = createTileGrid(slots);

		const layer2Tiles = slots.filter((t) => t.layer === 2);
		expect(layer2Tiles).toHaveLength(16);

		for (const tile of layer2Tiles) {
			expect(getNeighbors(tile, grid).top).toBe(true);
		}
	});

	test("getDailyLayout rotates cleanly across layouts", () => {
		expect(getDailyLayout(1).id).toBe("turtle");
		expect(getDailyLayout(2).id).toBe("pyramid");
		expect(getDailyLayout(3).id).toBe("fortress");
		expect(getDailyLayout(4).id).toBe("turtle");
	});
});
