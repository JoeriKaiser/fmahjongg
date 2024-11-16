import { TileData, TileNeighbors } from '../types';

export function createTileGrid(tiles: TileData[]) {
  const grid: { [key: string]: TileData[] } = {};

  tiles.forEach((tile) => {
    const { x, y, z } = tile.gridPosition;
    const key = `${x},${y},${z}`;
    grid[key] = grid[key] || [];
    grid[key].push(tile);
  });

  return grid;
}

export function getNeighbors(tile: TileData, grid: { [key: string]: TileData[] }): TileNeighbors {
  const { x, y, z } = tile.gridPosition;
  return {
    top: Boolean(grid[`${x},${y + 1},${z}`]?.length),
    left: Boolean(grid[`${x - 1},${y},${z}`]?.length),
    right: Boolean(grid[`${x + 1},${y},${z}`]?.length),
    splitAbove: grid[`${x},${y + 1},${z - 1}`]?.some((t) => t.id.includes('split')) ?? false
  };
}
