import { canMatch } from '@/utils/gameLogic';
import { generateInitialLayout, TileData } from '@/utils/layoutGenerator';
import * as zu from 'zustand';

interface GameState {
  tiles: TileData[];
  selectedTile: TileData | null;
  score: number;
  gameOver: boolean;
  selectTile: (tile: TileData) => void;
  removePair: (tile1: TileData, tile2: TileData) => void;
  resetGame: () => void;
}

function createTileGrid(tiles: TileData[]) {
  const grid: { [key: string]: TileData } = {};
  tiles.forEach((tile) => {
    if (!tile.isRemoved) {
      const key = `${tile.gridPosition.x},${tile.gridPosition.y},${tile.gridPosition.z}`;
      grid[key] = tile;
    }
  });
  return grid;
}

function getNeighbors(tile: TileData, grid: { [key: string]: TileData }) {
  const { x, y, z } = tile.gridPosition;
  return {
    top: Boolean(grid[`${x},${y + 1},${z}`]),
    left: Boolean(grid[`${x - 1},${y},${z}`]),
    right: Boolean(grid[`${x + 1},${y},${z}`])
  };
}

export const useGameStore = zu.create<GameState>((set) => ({
  tiles: [],
  selectedTile: null,
  score: 0,
  gameOver: false,

  selectTile: (tile) =>
    set((state) => {
      const clearedSelections = state.tiles.map((t) => ({ ...t, isSelected: false }));
      const grid = createTileGrid(state.tiles);

      if (state.selectedTile) {
        const tile1Neighbors = getNeighbors(state.selectedTile, grid);
        const tile2Neighbors = getNeighbors(tile, grid);

        if (canMatch(state.selectedTile, tile, tile1Neighbors, tile2Neighbors)) {
          return {
            selectedTile: null,
            tiles: clearedSelections.map((t) =>
              t.id === tile.id || t.id === state.selectedTile?.id ? { ...t, isRemoved: true } : t
            ),
            score: state.score + 10
          };
        }
      }

      return {
        selectedTile: tile,
        tiles: clearedSelections.map((t) => (t.id === tile.id ? { ...t, isSelected: true } : t))
      };
    }),

  removePair: (tile1, tile2) =>
    set((state) => ({
      tiles: state.tiles.map((t) =>
        t.id === tile1.id || t.id === tile2.id ? { ...t, isRemoved: true } : t
      )
    })),

  resetGame: () => set({ tiles: generateInitialLayout(), score: 0, gameOver: false })
}));
