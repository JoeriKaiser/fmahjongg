import { TileData } from './layoutGenerator';

export function canMatch(tile1: TileData, tile2: TileData): boolean {
  if (tile1.id === tile2.id) return false;
  if (tile1.symbol !== tile2.symbol) return false;
  if (tile1.isRemoved || tile2.isRemoved) return false;

  return isAccessible(tile1) && isAccessible(tile2);
}

function hasTopNeighbor(tile: TileData): boolean {
  return tile.position.y > 0;
}

function hasLeftFree(tile: TileData): boolean {
  return tile.position.x > 0;
}

function hasRightFree(tile: TileData): boolean {
  return tile.position.x < 1;
}

export function isAccessible(tile: TileData): boolean {
  // A tile is accessible if it has no tile directly above it
  // and at least one side (left or right) is free
  return !hasTopNeighbor(tile) && (hasLeftFree(tile) || hasRightFree(tile));
}
