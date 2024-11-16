import { TileData, ValidationState } from '../types';
import { getNeighbors } from '../grid/gridUtils';
import { canMatch } from '../matching/matcher';

export function findAvailableMoves(
  state: ValidationState
): Array<{ tile1: TileData; tile2: TileData }> {
  const moves: Array<{ tile1: TileData; tile2: TileData }> = [];
  const activeTiles = state.tiles.filter((t) => !state.removedTiles.has(t.id));

  const symbolMap = new Map<string, TileData[]>();
  activeTiles.forEach((tile) => {
    if (!symbolMap.has(tile.symbol)) {
      symbolMap.set(tile.symbol, []);
    }
    symbolMap.get(tile.symbol)!.push(tile);
  });

  for (const [, tiles] of symbolMap) {
    if (tiles.length < 2) continue;

    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        const tile1 = tiles[i];
        const tile2 = tiles[j];

        const tile1Neighbors = getNeighbors(tile1, state.grid);
        const tile2Neighbors = getNeighbors(tile2, state.grid);

        if (canMatch(tile1, tile2, tile1Neighbors, tile2Neighbors)) {
          moves.push({ tile1, tile2 });
        }
      }
    }
  }

  return moves;
}
