import { canMatch } from '@/utils/gameLogic';
import { generateInitialLayout } from '@/utils/layoutGenerator';
import * as zu from 'zustand'

interface Position {
  x: number;
  y: number;
  z: number;
}

interface TileData {
  id: string;
  symbol: string;
  position: Position;
  layer: number;
  isSelected: boolean;
  isRemoved: boolean;
}

interface GameState {
  tiles: TileData[];
  selectedTile: TileData | null;
  score: number;
  gameOver: boolean;
  selectTile: (tile: TileData) => void;
  removePair: (tile1: TileData, tile2: TileData) => void;
  resetGame: () => void;
}

export const useGameStore = zu.create<GameState>((set) => ({
  tiles: [],
  selectedTile: null,
  score: 0,
  gameOver: false,

  selectTile: (tile) => set((state) => {
    if (state.selectedTile && canMatch(state.selectedTile, tile)) {
      return {
        selectedTile: null,
        tiles: state.tiles.map(t =>
          (t.id === tile.id || t.id === state.selectedTile?.id)
            ? { ...t, isRemoved: true }
            : t
        ),
        score: state.score + 10
      }
    }
    return { selectedTile: tile }
  }),

  removePair: (tile1, tile2) => set((state) => ({
    tiles: state.tiles.map(t =>
      (t.id === tile1.id || t.id === tile2.id)
        ? { ...t, isRemoved: true }
        : t
    )
  })),

  resetGame: () => set({ tiles: generateInitialLayout(), score: 0, gameOver: false })
}))
