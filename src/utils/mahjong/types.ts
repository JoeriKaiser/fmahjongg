export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface TileData {
  id: string;
  symbol: string;
  position: Position;
  gridPosition: Position;
  layer: number;
  isSelected: boolean;
  isRemoved: boolean;
  isAccessible: boolean;
}

export interface TileNeighbors {
  top: boolean;
  left: boolean;
  right: boolean;
}

export type TileGrid = Map<string, TileData>;
