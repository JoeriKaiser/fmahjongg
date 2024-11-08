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
    [2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], // Added '2' for split tile
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // Added '3' for split tile
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
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0], // Added '2' for split tile
    [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0], // Added '3' for split tile
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
  // Suits (4 copies each)
  suits: {
    man: ['Man1', 'Man2', 'Man3', 'Man4', 'Man5'],
    pin: ['Pin1', 'Pin2', 'Pin3', 'Pin4', 'Pin5'],
    sou: ['Sou1', 'Sou2', 'Sou3', 'Sou4', 'Sou5']
  },
  // Honors (4 copies each)
  // TODO FIND WIND DESIGNS
  winds: ['Nan', 'Pei', 'Ton', 'Man5-Dora', 'Nan', 'Pei', 'Ton'],
  dragons: ['Chun', 'Haku', 'Hatsu', 'Chun', 'Haku', 'Hatsu'],
  // Bonus tiles (4 copies each)
  // TODO find season designs
  seasons: ['Man6', 'Man7', 'Man8', 'Man9'],
  // TODO find flower designs
  flowers: ['Sou6', 'Sou7', 'Sou8', 'Sou9']
};

function generateTileDeck(): string[] {
  const deck: string[] = [];

  // Add suits (4 copies each)
  Object.values(TILE_SYMBOLS.suits).forEach((suit) => {
    suit.forEach((tile) => {
      for (let i = 0; i < 4; i++) {
        deck.push(tile);
      }
    });
  });

  // Add winds (4 copies each)
  TILE_SYMBOLS.winds.forEach((wind) => {
    for (let i = 0; i < 4; i++) {
      deck.push(wind);
    }
  });

  // Add dragons (4 copies each)
  TILE_SYMBOLS.dragons.forEach((dragon) => {
    for (let i = 0; i < 4; i++) {
      deck.push(dragon);
    }
  });

  // Add seasons (4 copies each)
  TILE_SYMBOLS.seasons.forEach((season) => {
    for (let i = 0; i < 4; i++) {
      deck.push(season);
    }
  });

  // Add flowers (4 copies each)
  TILE_SYMBOLS.flowers.forEach((flower) => {
    for (let i = 0; i < 4; i++) {
      deck.push(flower);
    }
  });

  return shuffleArray(deck);
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const SPACING = {
  X: 1.1,
  Y: 0.52,
  Z: 1.6
};

const CENTER_OFFSET = {
  X: -8.4, // -(14 tiles * SPACING.X) / 2
  Z: -5.6 // -(8 rows * SPACING.Z) / 2
};

export function generateInitialLayout(): TileData[] {
  const tiles: TileData[] = [];
  let id = 0;
  const deck = generateTileDeck();
  let deckIndex = 0;

  LAYER_LAYOUTS.forEach((layer, layerIndex) => {
    layer.forEach((row, rowIndex) => {
      row.forEach((tileType, colIndex) => {
        if (tileType === 1) {
          tiles.push({
            id: `${String(id++)}-${layerIndex}-${rowIndex}-${colIndex}`,
            symbol: deck[deckIndex++],
            position: {
              x: colIndex * SPACING.X + CENTER_OFFSET.X,
              y: layerIndex * SPACING.Y,
              z: rowIndex * SPACING.Z + CENTER_OFFSET.Z
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
        } else if (tileType === 2) {
          tiles.push({
            id: `${String(id++)}-${layerIndex}-${rowIndex}-${colIndex}-split`,
            symbol: deck[deckIndex++],
            position: {
              x: colIndex * SPACING.X + CENTER_OFFSET.X,
              y: layerIndex * SPACING.Y,
              z: (rowIndex + 0.5) * SPACING.Z + CENTER_OFFSET.Z
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
        } else if (tileType === 3) {
          tiles.push({
            id: `${String(id++)}-${layerIndex}-${rowIndex}-${colIndex}-split`,
            symbol: deck[deckIndex++],
            position: {
              x: (colIndex + 0.5) * SPACING.X + CENTER_OFFSET.X,
              y: layerIndex * SPACING.Y,
              z: (rowIndex + 0.5) * SPACING.Z + CENTER_OFFSET.Z
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
        }
      });
    });
  });

  return shuffleArray([...tiles, ...tiles]);
}
