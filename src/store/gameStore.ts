import { canMatch } from '@/utils/mahjong/matching/matcher';
import { generateInitialLayout } from '@/utils/mahjong/layout/generator';
import { TileData } from '@/utils/mahjong/types';
import { getNeighbors, createTileGrid } from '@/utils/mahjong/grid/gridUtils';
import { findAvailableMoves } from '@/utils/mahjong/validation/moves';
import * as zu from 'zustand';

interface MatchingPair {
  tile1Id: string;
  tile2Id: string;
}

interface GameState {
  tiles: TileData[];
  selectedTile: TileData | null;
  gameOver: boolean;
  setGameOver: (gameOver: boolean) => void;
  possibleMoves: number;
  matchingPairs: MatchingPair[];
  getPossibleMoves: () => { count: number; pairs: MatchingPair[] };
  selectTile: (tile: TileData) => void;
  removePair: (tile1: TileData, tile2: TileData) => void;
  resetGame: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  startTime: number | null;
  elapsedTime: number;
  updateTimer: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  isGameWon: boolean;
}

export const useGameStore = zu.create<GameState>((set, get) => ({
  tiles: [],
  selectedTile: null,
  gameOver: false,
  possibleMoves: 0,
  isLoading: false,
  matchingPairs: [],
  startTime: null,
  elapsedTime: 0,
  isGameWon: false,

  selectTile: (tile) =>
    set((state) => {
      const clearedSelections = state.tiles.map((t) => ({ ...t, isSelected: false }));
      const grid = createTileGrid(state.tiles);

      if (state.selectedTile) {
        const tile1Neighbors = getNeighbors(state.selectedTile, grid);
        const tile2Neighbors = getNeighbors(tile, grid);

        if (canMatch(state.selectedTile, tile, tile1Neighbors, tile2Neighbors)) {
          if (!state.startTime && !state.gameOver) {
            get().startTimer();
          }

          return {
            selectedTile: null,
            tiles: clearedSelections.map((t) =>
              t.id === tile.id || t.id === state.selectedTile?.id ? { ...t, isRemoved: true } : t
            )
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

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setGameOver: (gameOver: boolean) =>
    set({
      gameOver,
      isGameWon: gameOver && get().tiles.every((t) => t.isRemoved)
    }),

  resetGame: () => {
    set({
      isLoading: true,
      startTime: null,
      elapsedTime: 0
    });

    setTimeout(() => {
      set({
        tiles: generateInitialLayout(),
        gameOver: false,
        isLoading: false
      });
    }, 100);
  },

  getPossibleMoves: () => {
    const state = get();
    const validationState = {
      tiles: state.tiles,
      removedTiles: new Set(state.tiles.filter((t) => t.isRemoved).map((t) => t.id)),
      grid: createTileGrid(state.tiles.filter((t) => !t.isRemoved))
    };

    const moves = findAvailableMoves(validationState);
    const pairs = moves.map((move) => ({
      tile1Id: move.tile1.id,
      tile2Id: move.tile2.id
    }));

    if (moves.length === 0 || state.tiles.every((t) => t.isRemoved)) {
      set((state) => ({ ...state, gameOver: true }));
      get().stopTimer();
    }

    set((state) => ({
      ...state,
      possibleMoves: moves.length,
      matchingPairs: pairs
    }));

    return { count: moves.length, pairs };
  },

  startTimer: () => {
    set({ startTime: Date.now() });
  },

  stopTimer: () => {
    if (get().startTime) {
      set({
        elapsedTime: Math.floor((Date.now() - get().startTime!) / 1000),
        startTime: null
      });
    }
  },

  updateTimer: () => {
    if (get().startTime) {
      set({ elapsedTime: Math.floor((Date.now() - get().startTime!) / 1000) });
    }
  }
}));
