import { TILE_SYMBOLS } from "../constants";
import type { TileData } from "../types";

const SEASON_SET = new Set<string>(TILE_SYMBOLS.seasons);
const FLOWER_SET = new Set<string>(TILE_SYMBOLS.flowers);

export function validateLayout(tiles: TileData[]): boolean {
	const symbolCounts = new Map<string, number>();

	for (const tile of tiles) {
		let key = tile.symbol;
		if (SEASON_SET.has(key)) key = "__SEASONS__";
		else if (FLOWER_SET.has(key)) key = "__FLOWERS__";

		symbolCounts.set(key, (symbolCounts.get(key) || 0) + 1);
	}

	for (const count of symbolCounts.values()) {
		if (count % 2 !== 0) return false;
	}

	return true;
}
