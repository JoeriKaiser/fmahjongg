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
  // Bottom layer (0)
  [
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1]
  ],
  // Middle layer (1)
  [
    [0, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 1, 0]
  ],
  // Top layer (2)
  [
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0]
  ]
]

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
  'Shaa',
  'Sou1',
  'Sou2',
  'Sou3',
  'Sou4',
  'Sou5',
  'Sou6',
  'Sou7',
  'Sou8',
  'Sou9',
  'Ton'
]

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function generateInitialLayout(): TileData[] {
  const tiles: TileData[] = [];
  let id = 0;

  LAYER_LAYOUTS.forEach((layer, layerIndex) => {
    layer.forEach((row, rowIndex) => {
      row.forEach((hasTitle, colIndex) => {
        if (hasTitle) {
          tiles.push({
            id: `${String(id++)}-${layerIndex}-${rowIndex}-${colIndex}`,
            symbol: TILE_SYMBOLS[Math.floor(Math.random() * TILE_SYMBOLS.length)],
            position: {
              x: colIndex * 1.1,
              y: layerIndex * 0.6,
              z: rowIndex * 1.6
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

