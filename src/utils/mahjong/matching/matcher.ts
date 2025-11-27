import { TILE_SYMBOLS } from "../constants";
import { getNeighbors, isAccessible } from "../grid/gridUtils";
import type { TileData, TileGrid } from "../types";

const SEASON_SET = new Set<string>(TILE_SYMBOLS.seasons);
const FLOWER_SET = new Set<string>(TILE_SYMBOLS.flowers);

export function tilesMatch(tile1: TileData, tile2: TileData): boolean {
	if (SEASON_SET.has(tile1.symbol) && SEASON_SET.has(tile2.symbol)) {
		return true;
	}

	if (FLOWER_SET.has(tile1.symbol) && FLOWER_SET.has(tile2.symbol)) {
		return true;
	}

	return tile1.symbol === tile2.symbol;
}

export function canMatch(
	tile1: TileData,
	tile2: TileData,
	grid: TileGrid,
): boolean {
	if (tile1.id === tile2.id) return false;
	if (tile1.isRemoved || tile2.isRemoved) return false;

	if (!tilesMatch(tile1, tile2)) return false;

	const neighbors1 = getNeighbors(tile1, grid);
	const neighbors2 = getNeighbors(tile2, grid);

	return isAccessible(neighbors1) && isAccessible(neighbors2);
}

export function findMatchableTiles(
	tiles: TileData[],
	grid: TileGrid,
): Array<[TileData, TileData]> {
	const matches: Array<[TileData, TileData]> = [];
	const activeTiles = tiles.filter((t) => !t.isRemoved);

	const symbolGroups = new Map<string, TileData[]>();

	for (const tile of activeTiles) {
		let groupKey = tile.symbol;
		if (SEASON_SET.has(tile.symbol)) groupKey = "__SEASONS__";
		else if (FLOWER_SET.has(tile.symbol)) groupKey = "__FLOWERS__";

		const group = symbolGroups.get(groupKey);
		if (group) {
			group.push(tile);
		} else {
			symbolGroups.set(groupKey, [tile]);
		}
	}

	for (const group of symbolGroups.values()) {
		if (group.length < 2) continue;

		for (let i = 0; i < group.length; i++) {
			for (let j = i + 1; j < group.length; j++) {
				const t1 = group[i];
				const t2 = group[j];

				const n1 = getNeighbors(t1, grid);
				const n2 = getNeighbors(t2, grid);

				if (isAccessible(n1) && isAccessible(n2)) {
					matches.push([t1, t2]);
				}
			}
		}
	}

	return matches;
}
