import { TileData } from '../types';

export function validateLayout(tiles: TileData[]): boolean {
  const symbolCounts = new Map<string, number>();

  tiles.forEach((tile) => {
    const count = symbolCounts.get(tile.symbol) || 0;
    symbolCounts.set(tile.symbol, count + 1);
  });

  for (const [, count] of symbolCounts) {
    if (count % 2 !== 0) return false;
  }

  return true;
}
