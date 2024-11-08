import { TILE_SYMBOLS, TileData } from './layoutGenerator';

interface TileNeighbors {
  top: boolean;
  left: boolean;
  right: boolean;
  splitAbove: boolean;
}

export function canMatch(
  tile1: TileData,
  tile2: TileData,
  tile1Neighbors: TileNeighbors,
  tile2Neighbors: TileNeighbors
): boolean {
  if (tile1.id === tile2.id) return false;
  if (tile1.isRemoved || tile2.isRemoved) return false;

  if (!isAccessible(tile1Neighbors) || !isAccessible(tile2Neighbors)) return false;

  const isSeasonTile = (tile: TileData) => TILE_SYMBOLS.seasons.includes(tile.symbol);
  const isFlowerTile = (tile: TileData) => TILE_SYMBOLS.flowers.includes(tile.symbol);

  if (isSeasonTile(tile1) && isSeasonTile(tile2)) return true;

  if (isFlowerTile(tile1) && isFlowerTile(tile2)) return true;

  return tile1.symbol === tile2.symbol;
}

export function isAccessible(neighbors: TileNeighbors): boolean {
  if (neighbors.splitAbove) return false;

  return !neighbors.top && (!neighbors.left || !neighbors.right);
}
