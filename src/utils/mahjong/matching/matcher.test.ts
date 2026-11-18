import { describe, expect, test } from "bun:test";
import { createTileGrid } from "../grid/gridUtils";
import type { TileData } from "../types";
import { canMatch, tilesMatch } from "./matcher";

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

describe("matcher", () => {
	test("matches identical regular symbols, any two seasons, and any two flowers", () => {
		expect(tilesMatch(makeTile("1", "Man5", 0), makeTile("2", "Man5", 4))).toBe(
			true,
		);
		expect(tilesMatch(makeTile("1", "Man5", 0), makeTile("2", "Man6", 4))).toBe(
			false,
		);
		expect(
			tilesMatch(makeTile("1", "Season1", 0), makeTile("2", "Season4", 4)),
		).toBe(true);
		expect(
			tilesMatch(makeTile("1", "Bamboo1", 0), makeTile("2", "Bamboo3", 4)),
		).toBe(true);
		expect(
			tilesMatch(makeTile("1", "Season1", 0), makeTile("2", "Bamboo1", 4)),
		).toBe(false);
	});

	test("rejects matching self, removed tiles, or blocked tiles", () => {
		const left = makeTile("left", "East", 0, 0, 0);
		const middle = makeTile("middle", "Chun", 2, 0, 0);
		const right = makeTile("right", "East", 4, 0, 0);
		const freeChun = makeTile("freeChun", "Chun", 8, 0, 0);
		const grid = createTileGrid([left, middle, right, freeChun]);

		expect(canMatch(left, left, grid)).toBe(false);
		expect(canMatch(left, right, grid)).toBe(true);
		expect(canMatch(middle, freeChun, grid)).toBe(false);

		left.isRemoved = true;
		expect(canMatch(left, right, grid)).toBe(false);
	});
});
