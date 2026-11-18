import { describe, expect, test } from "bun:test";
import { createLayoutSlots } from "../layout/generator";
import type { TileData } from "../types";
import {
	createTileGrid,
	getNeighbors,
	isAccessible,
	isTileAccessible,
} from "./gridUtils";

function makeTile(
	id: string,
	x: number,
	y: number,
	z: number,
	symbol = "Man1",
): TileData {
	return {
		id,
		symbol,
		position: { x: 0, y: 0, z: 0 },
		gridPosition: { x, y, z },
		layer: y,
		isRemoved: false,
		isAccessible: false,
	};
}

describe("gridUtils", () => {
	test("Layer 4 capstone blocks all four Layer 3 tiles beneath it, including the diagonal corner", () => {
		const slots = createLayoutSlots();
		const grid = createTileGrid(slots);

		const capstone = slots.find((t) => t.layer === 4);
		expect(capstone).toBeDefined();
		expect(capstone?.gridPosition).toEqual({ x: 15, y: 4, z: 7 });

		const layer3Tiles = slots.filter((t) => t.layer === 3);
		expect(layer3Tiles).toHaveLength(4);

		for (const tile of layer3Tiles) {
			const neighbors = getNeighbors(tile, grid);
			expect(neighbors.top).toBe(true);
			expect(isAccessible(neighbors)).toBe(false);
		}

		if (capstone) {
			capstone.isRemoved = true;
		}
		const gridWithoutCapstone = createTileGrid(slots);

		for (const tile of layer3Tiles) {
			const neighbors = getNeighbors(tile, gridWithoutCapstone);
			expect(neighbors.top).toBe(false);
			expect(isAccessible(neighbors)).toBe(true);
		}
	});

	test("Layer 0 half-offset ear tiles block both row 3 and row 4 neighbors", () => {
		const slots = createLayoutSlots();
		const grid = createTileGrid(slots);

		const row3Left = slots.find(
			(t) =>
				t.gridPosition.x === 4 &&
				t.gridPosition.y === 0 &&
				t.gridPosition.z === 6,
		);
		const row4Left = slots.find(
			(t) =>
				t.gridPosition.x === 4 &&
				t.gridPosition.y === 0 &&
				t.gridPosition.z === 8,
		);
		const row3Right = slots.find(
			(t) =>
				t.gridPosition.x === 26 &&
				t.gridPosition.y === 0 &&
				t.gridPosition.z === 6,
		);
		const row4Right = slots.find(
			(t) =>
				t.gridPosition.x === 26 &&
				t.gridPosition.y === 0 &&
				t.gridPosition.z === 8,
		);
		const innerLeftEar = slots.find(
			(t) =>
				t.gridPosition.x === 2 &&
				t.gridPosition.y === 0 &&
				t.gridPosition.z === 7,
		);
		const outerLeftEar = slots.find(
			(t) =>
				t.gridPosition.x === 0 &&
				t.gridPosition.y === 0 &&
				t.gridPosition.z === 7,
		);

		expect(row3Left && row4Left && row3Right && row4Right).toBeDefined();
		expect(innerLeftEar && outerLeftEar).toBeDefined();

		expect(getNeighbors(row3Left as TileData, grid).left).toBe(true);
		expect(getNeighbors(row4Left as TileData, grid).left).toBe(true);
		expect(getNeighbors(row3Right as TileData, grid).right).toBe(true);
		expect(getNeighbors(row4Right as TileData, grid).right).toBe(true);

		expect(isTileAccessible(innerLeftEar as TileData, grid)).toBe(false);
		expect(isTileAccessible(outerLeftEar as TileData, grid)).toBe(true);

		(outerLeftEar as TileData).isRemoved = true;
		const updatedGrid = createTileGrid(slots);
		expect(isTileAccessible(innerLeftEar as TileData, updatedGrid)).toBe(true);
	});

	test("side and top blocking rules handle standard accessibility boundaries", () => {
		const left = makeTile("left", 0, 0, 0);
		const middle = makeTile("middle", 2, 0, 0);
		const right = makeTile("right", 4, 0, 0);
		const above = makeTile("above", 0, 1, 0);

		const grid = createTileGrid([left, middle, right, above]);

		expect(isTileAccessible(middle, grid)).toBe(false);
		expect(isTileAccessible(left, grid)).toBe(false);
		expect(isTileAccessible(right, grid)).toBe(true);
		expect(isTileAccessible(above, grid)).toBe(true);
	});
});
