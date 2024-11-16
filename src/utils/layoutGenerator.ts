export interface TileData {
  id: string;
  symbol: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  gridPosition: {
    x: number;
    y: number;
    z: number;
  };
  layer: number;
  isSelected: boolean;
  isRemoved: boolean;
}

const LAYER_LAYOUTS = [
  // Layer 0 (bottom)
  [
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // Tile 2 (split)
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
  ],
  // Layer 1
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  // Layer 2
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  // Layer 3
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0], // Tile 2 (split)
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ],
  // Layer 4
  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]
];

export const TILE_SYMBOLS = {
  suits: {
    man: ['Man1', 'Man2', 'Man3', 'Man4', 'Man5', 'Man6', 'Man7', 'Man8', 'Man9'],
    pin: ['Pin1', 'Pin2', 'Pin3', 'Pin4', 'Pin5', 'Pin6', 'Pin7', 'Pin8', 'Pin9'],
    sou: ['Sou1', 'Sou2', 'Sou3', 'Sou4', 'Sou5', 'Sou6', 'Sou7', 'Sou8', 'Sou9']
  },
  winds: ['North', 'South', 'East', 'West'],
  dragons: ['Chun', 'Haku', 'Hatsu'],
  seasons: ['Season1', 'Season2'],
  flowers: ['Bamboo1', 'Bamboo2', 'Bamboo3', 'Bamboo4']
};

function generateTileDeck(): string[] {
  const deck: string[] = [];

  const addTilePair = (tileType: string) => {
    deck.push(tileType, tileType);
  };

  const totalSpaces = LAYER_LAYOUTS.reduce((total, layer) => {
    return total + layer.flat().filter((val) => val === 1 || val === 2 || val === 3).length;
  }, 0);

  const neededPairs = totalSpaces / 2;

  const allTiles = [
    ...TILE_SYMBOLS.suits.man,
    ...TILE_SYMBOLS.suits.pin,
    ...TILE_SYMBOLS.suits.sou,
    ...TILE_SYMBOLS.winds,
    ...TILE_SYMBOLS.dragons,
    ...TILE_SYMBOLS.seasons,
    ...TILE_SYMBOLS.flowers
  ];

  for (let i = 0; i < neededPairs; i++) {
    const randomTile = allTiles[Math.floor(Math.random() * allTiles.length)];
    addTilePair(randomTile);
  }

  return shuffleArray(deck);
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const SPACING = {
  X: 1.1,
  Y: 0.52,
  Z: 1.6
};

export const CENTER_OFFSET = {
  X: -8.4,
  Z: -5.6
};

function distributeLayerTiles(deck: string[], layerCount: number): string[][] {
  const tilesNeededPerLayer = LAYER_LAYOUTS.map(
    (layer) => layer.flat().filter((val) => val === 1 || val === 2 || val === 3).length
  );

  const layerTiles: string[][] = [];
  let deckIndex = 0;

  const totalSpacesNeeded = tilesNeededPerLayer.reduce((a, b) => a + b, 0);
  if (deck.length !== totalSpacesNeeded) {
    throw new Error(
      `Deck size (${deck.length}) doesn't match required tiles (${totalSpacesNeeded})`
    );
  }

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

function validateLayout(tiles: TileData[]): boolean {
  const symbolCounts = new Map<string, number>();

  tiles.forEach((tile) => {
    const count = symbolCounts.get(tile.symbol) || 0;
    symbolCounts.set(tile.symbol, count + 1);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_symbol, count] of symbolCounts) {
    if (count % 2 !== 0) {
      return false;
    }
  }

  return true;
}

export function generateInitialLayout(): TileData[] {
  let tiles: TileData[] = [];
  let isValid = false;

  while (!isValid) {
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
              id: `${String(id++)}-${layerIndex}-${rowIndex}-${colIndex}${tileType > 1 ? '-split' : ''}`,
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

    isValid = validateLayout(tiles);
  }

  return tiles;
}
