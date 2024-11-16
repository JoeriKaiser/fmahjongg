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

export interface ValidationState {
  tiles: TileData[];
  removedTiles: Set<string>;
  grid: { [key: string]: TileData[] };
}

export interface TileNeighbors {
  top: boolean;
  left: boolean;
  right: boolean;
  splitAbove: boolean;
}
