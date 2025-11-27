import type { TileData, TileGrid } from '../types';
import { findMatchableTiles } from '../matching/matcher';

export interface Move {
  tile1: TileData;
  tile2: TileData;
}

export function findAvailableMoves(tiles: TileData[], grid: TileGrid): Move[] {
  const pairs = findMatchableTiles(tiles, grid);
  return pairs.map(([tile1, tile2]) => ({ tile1, tile2 }));
}
