import { createTileGrid, createGridKey } from '../grid/gridUtils';
import { findMatchableTiles } from '../matching/matcher';
import type { TileData, TileGrid } from '../types';

export function isLayoutSolvable(tiles: TileData[]): boolean {
  const workingTiles = tiles.map((t) => ({ ...t }));
  const grid = createTileGrid(workingTiles);
  
  let remaining = workingTiles.length;
  
  while (remaining > 0) {
    const matches = findMatchableTiles(workingTiles, grid);
    
    if (matches.length === 0) {
      return remaining === 0;
    }
    
    let bestMatch = matches[0];
    let bestScore = bestMatch[0].layer + bestMatch[1].layer;
    
    for (let i = 1; i < matches.length; i++) {
      const score = matches[i][0].layer + matches[i][1].layer;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = matches[i];
      }
    }
    
    const [t1, t2] = bestMatch;
    t1.isRemoved = true;
    t2.isRemoved = true;
    
    const { x: x1, y: y1, z: z1 } = t1.gridPosition;
    const { x: x2, y: y2, z: z2 } = t2.gridPosition;
    grid.delete(createGridKey(x1, y1, z1));
    grid.delete(createGridKey(x2, y2, z2));
    
    remaining -= 2;
  }
  
  return true;
}
