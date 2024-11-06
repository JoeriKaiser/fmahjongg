export interface TileData {
  id: string;
  symbol: string;
  position: {
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

const TILE_SYMBOLS = [
  'Chun',
  'Haku',
  'Hatsu',
  'Man1',
  'Man2',
  'Man3',
  'Man4',
  'Man5',
  'Man6',
  'Man7',
  'Man8',
  'Man9',
  'Pin1',
  'Pin2',
  'Pin3',
  'Pin4',
  'Pin5',
  'Pin6',
  'Pin7',
  'Pin8',
  'Pin9',
  'Sou1',
  'Sou2',
  'Sou3',
  'Sou4',
  'Sou5',
  'Sou6',
  'Sou7',
  'Sou8',
  'Sou9',
  'Ton',
  'Shaa'
];

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

  LAYER_LAYOUTS.forEach((layer, layerIndex) => {
    layer.forEach((row, rowIndex) => {
      row.forEach((tileType, colIndex) => {
        if (tileType === 1) {
          // Normal tile
          tiles.push({
            id: `${String(id++)}-${layerIndex}-${rowIndex}-${colIndex}`,
            symbol: TILE_SYMBOLS[Math.floor(Math.random() * TILE_SYMBOLS.length)],
            position: {
              x: colIndex * SPACING.X + CENTER_OFFSET.X,
              y: layerIndex * SPACING.Y,
              z: rowIndex * SPACING.Z + CENTER_OFFSET.Z
            },
            layer: layerIndex,
            isSelected: false,
            isRemoved: false
          });
        } else if (tileType === 2) {
          // Split tile horizontally
          tiles.push({
            id: `${String(id++)}-${layerIndex}-${rowIndex}-${colIndex}-split`,
            symbol: TILE_SYMBOLS[Math.floor(Math.random() * TILE_SYMBOLS.length)],
            position: {
              x: colIndex * SPACING.X + CENTER_OFFSET.X,
              y: layerIndex * SPACING.Y,
              z: (rowIndex + 0.5) * SPACING.Z + CENTER_OFFSET.Z // Position between rows
            },
            layer: layerIndex,
            isSelected: false,
            isRemoved: false
          });
        } else if (tileType === 3) {
          // Split tile horizontally and vertically
          tiles.push({
            id: `${String(id++)}-${layerIndex}-${rowIndex}-${colIndex}-split`,
            symbol: TILE_SYMBOLS[Math.floor(Math.random() * TILE_SYMBOLS.length)],
            position: {
              x: (colIndex + 0.5) * SPACING.X + CENTER_OFFSET.X,
              y: layerIndex * SPACING.Y,
              z: (rowIndex + 0.5) * SPACING.Z + CENTER_OFFSET.Z // Position between rows
            },
            layer: layerIndex,
            isSelected: false,
            isRemoved: false
          });
        }
      });
    });
  });

  // Ensure pairs exist by duplicating and shuffling
  return shuffleArray([...tiles, ...tiles]);
}
