import { ALL_SYMBOLS, CENTER_OFFSET, MAX_GENERATION_ATTEMPTS, SPACING } from '../constants';
import type { TileData } from '../types';
import { isLayoutSolvable } from '../validation/solvability';
import { LAYER_LAYOUTS, countTotalTiles } from './layouts';

/**
 * Fisher-Yates shuffle - modifies array in place
 */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateDeck(totalTiles: number): string[] {
  if (totalTiles % 2 !== 0) {
    throw new Error('Total tiles must be even for pairing');
  }
  
  const pairsNeeded = totalTiles / 2;
  const deck: string[] = [];
  
  const symbols = shuffle([...ALL_SYMBOLS]);
  let symbolIndex = 0;
  
  while (deck.length < totalTiles) {
    const symbol = symbols[symbolIndex % symbols.length];
    deck.push(symbol, symbol);
    symbolIndex++;
  }
  
  return shuffle(deck);
}

function createTilesFromLayout(deck: string[]): TileData[] {
  const tiles: TileData[] = [];
  let deckIndex = 0;
  let tileId = 0;
  
  for (let layerIndex = 0; layerIndex < LAYER_LAYOUTS.length; layerIndex++) {
    const layer = LAYER_LAYOUTS[layerIndex];
    
    for (let rowIndex = 0; rowIndex < layer.length; rowIndex++) {
      const row = layer[rowIndex];
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const tileType = row[colIndex];
        
        if (tileType >= 1 && tileType <= 3) {
          const symbol = deck[deckIndex++];
          
          const xOffset = tileType === 3 ? 0.5 : 0;
          const zOffset = tileType >= 2 ? 0.5 : 0;
          
          tiles.push({
            id: `tile-${tileId++}-L${layerIndex}${tileType > 1 ? '-split' : ''}`,
            symbol,
            position: {
              x: (colIndex + xOffset) * SPACING.X + CENTER_OFFSET.X,
              y: layerIndex * SPACING.Y,
              z: (rowIndex + zOffset) * SPACING.Z + CENTER_OFFSET.Z
            },
            gridPosition: {
              x: colIndex,
              y: layerIndex,
              z: rowIndex
            },
            layer: layerIndex,
            isSelected: false,
            isRemoved: false,
            isAccessible: true
          });
        }
      }
    }
  }
  
  return tiles;
}

export function generateInitialLayout(): TileData[] {
  const totalTiles = countTotalTiles();
  
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    try {
      const deck = generateDeck(totalTiles);
      const tiles = createTilesFromLayout(deck);
      
      if (isLayoutSolvable(tiles)) {
        return tiles.map((t) => ({ ...t, isRemoved: false }));
      }
    } catch (error) {
      console.warn(`Generation attempt ${attempt + 1} failed:`, error);
    }
  }
  
  console.warn('Could not generate solvable layout, using fallback');
  const deck = generateDeck(totalTiles);
  return createTilesFromLayout(deck);
}
