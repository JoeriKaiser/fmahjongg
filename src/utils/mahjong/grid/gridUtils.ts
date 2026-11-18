import type { TileData, TileGrid, TileNeighbors } from "../types";

const GRID_OFFSET = 64;
const GRID_STRIDE_X = 256;
const GRID_STRIDE_Y = 65536;

export function createGridKey(x: number, y: number, z: number): number {
	return (
		(y + GRID_OFFSET) * GRID_STRIDE_Y +
		(x + GRID_OFFSET) * GRID_STRIDE_X +
		(z + GRID_OFFSET)
	);
}

export function createTileGrid(tiles: TileData[]): TileGrid {
	const grid: TileGrid = new Map();

	for (const tile of tiles) {
		if (tile.isRemoved) continue;
		const { x, y, z } = tile.gridPosition;
		grid.set(createGridKey(x, y, z), tile);
	}

	return grid;
}

export function getTileAt(
	grid: TileGrid,
	x: number,
	y: number,
	z: number,
): TileData | undefined {
	return grid.get(createGridKey(x, y, z));
}

export function hasBlockingTileAbove(
	grid: TileGrid,
	x: number,
	y: number,
	z: number,
): boolean {
	const aboveLayer = y + 1;

	for (let dx = -1; dx <= 1; dx++) {
		for (let dz = -1; dz <= 1; dz++) {
			const tile = getTileAt(grid, x + dx, aboveLayer, z + dz);
			if (tile && !tile.isRemoved) {
				return true;
			}
		}
	}

	return false;
}

function hasBlockingTileOnSide(
	grid: TileGrid,
	x: number,
	y: number,
	z: number,
	dx: -2 | 2,
): boolean {
	const neighborX = x + dx;

	for (let dz = -1; dz <= 1; dz++) {
		const tile = getTileAt(grid, neighborX, y, z + dz);
		if (tile && !tile.isRemoved) {
			return true;
		}
	}

	return false;
}

export function getNeighbors(tile: TileData, grid: TileGrid): TileNeighbors {
	const { x, y, z } = tile.gridPosition;

	return {
		top: hasBlockingTileAbove(grid, x, y, z),
		left: hasBlockingTileOnSide(grid, x, y, z, -2),
		right: hasBlockingTileOnSide(grid, x, y, z, 2),
	};
}

export function isAccessible(neighbors: TileNeighbors): boolean {
	return !neighbors.top && (!neighbors.left || !neighbors.right);
}

export function isTileAccessible(tile: TileData, grid: TileGrid): boolean {
	if (tile.isRemoved) return false;
	return isAccessible(getNeighbors(tile, grid));
}
