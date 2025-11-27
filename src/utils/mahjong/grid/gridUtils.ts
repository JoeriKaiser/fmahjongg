import type { TileData, TileGrid, TileNeighbors } from '../types';

export function createGridKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
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

export function getTileAt(grid: TileGrid, x: number, y: number, z: number): TileData | undefined {
  return grid.get(createGridKey(x, y, z));
}

export function hasBlockingTileAbove(grid: TileGrid, x: number, y: number, z: number): boolean {
  const aboveLayer = y + 1;
  
  const positionsToCheck = [
    [x, aboveLayer, z],
    [x - 1, aboveLayer, z],
    [x + 1, aboveLayer, z],
    [x, aboveLayer, z - 1],
    [x, aboveLayer, z + 1]
  ];
  
  for (const [px, py, pz] of positionsToCheck) {
    const tile = getTileAt(grid, px, py, pz);
    if (tile && !tile.isRemoved) {
      if (tilesOverlapVertically(tile, x, z)) {
        return true;
      }
    }
  }
  
  return false;
}

function tilesOverlapVertically(upperTile: TileData, lowerX: number, lowerZ: number): boolean {
  const { x: ux, z: uz } = upperTile.gridPosition;
  const id = upperTile.id;
  
  const isSplit = id.includes('-split');
  const isType3 = id.includes('type3') || (isSplit && upperTile.layer === 4);
  
  if (isType3) {
    return (
      lowerX >= ux - 0.5 && lowerX <= ux + 1.5 &&
      lowerZ >= uz - 0.5 && lowerZ <= uz + 1.5
    );
  } else if (isSplit) {
    return (
      lowerX === ux &&
      lowerZ >= uz - 0.5 && lowerZ <= uz + 1.5
    );
  } else {
    return lowerX === ux && lowerZ === uz;
  }
}

export function getNeighbors(tile: TileData, grid: TileGrid): TileNeighbors {
  const { x, y, z } = tile.gridPosition;
  
  const top = hasBlockingTileAbove(grid, x, y, z);
  
  const leftTile = getTileAt(grid, x - 1, y, z);
  const left = leftTile !== undefined && !leftTile.isRemoved;
  
  const rightTile = getTileAt(grid, x + 1, y, z);
  const right = rightTile !== undefined && !rightTile.isRemoved;
  
  return { top, left, right };
}

export function isAccessible(neighbors: TileNeighbors): boolean {
  return !neighbors.top && (!neighbors.left || !neighbors.right);
}
