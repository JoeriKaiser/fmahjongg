import { TileData } from '../types';
import { TILE_SYMBOLS, SPACING, CENTER_OFFSET, MAX_GENERATION_ATTEMPTS } from '../constants';
import { LAYER_LAYOUTS } from './layouts';
import { validateLayout } from '../validation/validator';
import { isLayoutSolvable } from '../validation/solvability';

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function generateTileDeck(): string[] {
  const deck: string[] = [];
  const tilesNeededPerLayer = LAYER_LAYOUTS.map(
    (layer) => layer.flat().filter((val) => val === 1 || val === 2 || val === 3).length
  );
  const totalTilesNeeded = tilesNeededPerLayer.reduce((a, b) => a + b, 0);

  const tilePool = [
    ...TILE_SYMBOLS.suits.man,
    ...TILE_SYMBOLS.suits.pin,
    ...TILE_SYMBOLS.suits.sou,
    ...TILE_SYMBOLS.winds,
    ...TILE_SYMBOLS.dragons,
    ...TILE_SYMBOLS.seasons,
    ...TILE_SYMBOLS.flowers
  ];

  const shuffledPool = shuffleArray([...tilePool]);
  const pairCounts = new Map<string, number>();

  let poolIndex = 0;
  while (deck.length < totalTilesNeeded) {
    if (poolIndex >= shuffledPool.length) {
      poolIndex = 0;
      shuffleArray(shuffledPool);
    }

    const currentTile = shuffledPool[poolIndex];
    const currentCount = pairCounts.get(currentTile) || 0;

    if (currentCount < 2) {
      deck.push(currentTile, currentTile);
      pairCounts.set(currentTile, currentCount + 1);
    }

    poolIndex++;
  }

  return shuffleArray(deck);
}

function distributeLayerTiles(deck: string[], layerCount: number): string[][] {
  const tilesNeededPerLayer = LAYER_LAYOUTS.map(
    (layer) => layer.flat().filter((val) => val === 1 || val === 2 || val === 3).length
  );

  const layerTiles: string[][] = [];
  let deckIndex = 0;

  for (let i = 0; i < layerCount; i++) {
    layerTiles[i] = [];
    const tilesNeeded = tilesNeededPerLayer[i];

    for (let j = 0; j < tilesNeeded; j++) {
      layerTiles[i].push(deck[deckIndex]);
      deckIndex++;
    }
  }

  return layerTiles;
}

export function generateInitialLayout(): TileData[] {
  let tiles: TileData[] = [];
  let isValid = false;
  let attempts = 0;

  while (!isValid && attempts < MAX_GENERATION_ATTEMPTS) {
    attempts++;
    tiles = [];
    let id = 0;

    const deck = generateTileDeck();
    const layerTiles = distributeLayerTiles(deck, LAYER_LAYOUTS.length);
    const layerTileCounts = Array(LAYER_LAYOUTS.length).fill(0);

    LAYER_LAYOUTS.forEach((layer, layerIndex) => {
      layer.forEach((row, rowIndex) => {
        row.forEach((tileType, colIndex) => {
          if (tileType >= 1 && tileType <= 3) {
            const tileSymbol = layerTiles[layerIndex][layerTileCounts[layerIndex]];

            tiles.push({
              id: `${String(id++)}-${layerIndex}-${rowIndex}-${colIndex}${
                tileType > 1 ? '-split' : ''
              }`,
              symbol: tileSymbol,
              position: {
                x: (tileType === 3 ? colIndex + 0.5 : colIndex) * SPACING.X + CENTER_OFFSET.X,
                y: layerIndex * SPACING.Y,
                z: (tileType >= 2 ? rowIndex + 0.5 : rowIndex) * SPACING.Z + CENTER_OFFSET.Z
              },
              gridPosition: {
                x: colIndex,
                y: layerIndex,
                z: rowIndex
              },
              layer: layerIndex,
              isSelected: false,
              isRemoved: false
            });

            layerTileCounts[layerIndex]++;
          }
        });
      });
    });

    isValid = validateLayout(tiles) && isLayoutSolvable(tiles);
  }

  return tiles;
}
