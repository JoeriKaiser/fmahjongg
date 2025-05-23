import type { TileData, TileNeighbors } from "../types";

export function createTileGrid(tiles: TileData[]): {
	[key: string]: TileData[];
} {
	const grid: {
		[key: string]: TileData[];
	} = tiles.reduce<{
		[key: string]: TileData[];
	}>((acc, tile) => {
		const { x, y, z } = tile.gridPosition;
		const key = `${x},${y},${z}`;

		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(tile);

		return acc;
	}, {});

	return grid;
}

export function getNeighbors(
	tile: TileData,
	grid: { [key: string]: TileData[] },
): TileNeighbors {
	const { x, y, z } = tile.gridPosition;

	const hasTop = Boolean(grid[`${x},${y + 1},${z}`]?.length);
	const hasLeft = Boolean(grid[`${x - 1},${y},${z}`]?.length);
	const hasRight = Boolean(grid[`${x + 1},${y},${z}`]?.length);

	const hasSplitAbove = Boolean(
		grid[`${x},${y + 1},${z - 1}`]?.some((t) => t.id.includes("split")),
	);

	return {
		top: hasTop,
		left: hasLeft,
		right: hasRight,
		splitAbove: hasSplitAbove,
	};
}
