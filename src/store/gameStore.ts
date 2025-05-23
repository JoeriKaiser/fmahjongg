import { createTileGrid, getNeighbors } from "@/utils/mahjong/grid/gridUtils";
import { generateInitialLayout } from "@/utils/mahjong/layout/generator";
import { canMatch } from "@/utils/mahjong/matching/matcher";
import type { TileData } from "@/utils/mahjong/types";
import { findAvailableMoves } from "@/utils/mahjong/validation/moves";
import * as zu from "zustand";

interface MatchingPair {
  tile1Id: string;
  tile2Id: string;
}

interface GameState {
  tiles: TileData[];
  selectedTile: TileData | null;
  gameOver: boolean;
  isGameWon: boolean;
  isLoading: boolean;
  possibleMoves: number;
  matchingPairs: MatchingPair[];

  startTime: number | null;
  elapsedTime: number;
  timerIntervalId: number | null;

  selectTile: (tile: TileData) => void;
  resetGame: () => void;
  setLoading: (loading: boolean) => void;
  updatePossibleMoves: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  updateTimer: () => void;
}

export const useGameStore = zu.create<GameState>((set, get) => ({
  tiles: [],
  selectedTile: null,
  gameOver: false,
  isGameWon: false,
  isLoading: false,
  possibleMoves: 0,
  matchingPairs: [],
  startTime: null,
  elapsedTime: 0,
  timerIntervalId: null,

  selectTile: (tile) => {
    const state = get();
    
    if (tile.isRemoved) return;

    if (!state.startTime && !state.gameOver) {
      get().startTimer();
    }

    const clearedTiles = state.tiles.map((t) => ({
      ...t,
      isSelected: false,
    }));

    if (!state.selectedTile) {
      set({
        selectedTile: tile,
        tiles: clearedTiles.map((t) =>
          t.id === tile.id ? { ...t, isSelected: true } : t
        ),
      });
      return;
    }

    if (state.selectedTile.id === tile.id) {
      set({
        selectedTile: null,
        tiles: clearedTiles,
      });
      return;
    }

    const grid = createTileGrid(state.tiles.filter((t) => !t.isRemoved));
    const tile1Neighbors = getNeighbors(state.selectedTile, grid);
    const tile2Neighbors = getNeighbors(tile, grid);

    if (canMatch(state.selectedTile, tile, tile1Neighbors, tile2Neighbors)) {
      const updatedTiles = clearedTiles.map((t) =>
        t.id === tile.id || t.id === state.selectedTile?.id
          ? { ...t, isRemoved: true }
          : t
      );

      set({
        selectedTile: null,
        tiles: updatedTiles,
      });

      setTimeout(() => {
        get().updatePossibleMoves();
      }, 0);
    } else {
      set({
        selectedTile: tile,
        tiles: clearedTiles.map((t) =>
          t.id === tile.id ? { ...t, isSelected: true } : t
        ),
      });
    }
  },

  resetGame: () => {
    const state = get();
    
    if (state.timerIntervalId) {
      clearInterval(state.timerIntervalId);
    }

    set({
      isLoading: true,
      startTime: null,
      elapsedTime: 0,
      timerIntervalId: null,
      gameOver: false,
      isGameWon: false,
      selectedTile: null,
    });

    setTimeout(() => {
      const newTiles = generateInitialLayout();
      set({
        tiles: newTiles,
        isLoading: false,
      });
      
      setTimeout(() => {
        get().updatePossibleMoves();
      }, 0);
    }, 100);
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  updatePossibleMoves: () => {
    const state = get();
    const activeTiles = state.tiles.filter((t) => !t.isRemoved);
    
    if (activeTiles.length === 0) {
      set({
        gameOver: true,
        isGameWon: true,
      });
      get().stopTimer();
      return;
    }

    const validationState = {
      tiles: state.tiles,
      removedTiles: new Set(
        state.tiles.filter((t) => t.isRemoved).map((t) => t.id)
      ),
      grid: createTileGrid(activeTiles),
    };

    const moves = findAvailableMoves(validationState);
    const pairs = moves.map((move) => ({
      tile1Id: move.tile1.id,
      tile2Id: move.tile2.id,
    }));

    if (moves.length === 0) {
      set({
        gameOver: true,
        isGameWon: false,
        possibleMoves: 0,
        matchingPairs: [],
      });
      get().stopTimer();
    } else {
      set({
        possibleMoves: moves.length,
        matchingPairs: pairs,
      });
    }
  },

  startTimer: () => {
    const state = get();
    
    if (state.timerIntervalId) {
      clearInterval(state.timerIntervalId);
    }

    const startTime = Date.now();
    const intervalId = window.setInterval(() => {
      get().updateTimer();
    }, 1000);

    set({
      startTime,
      timerIntervalId: intervalId,
    });
  },

  stopTimer: () => {
    const state = get();
    
    if (state.timerIntervalId) {
      clearInterval(state.timerIntervalId);
    }

    if (state.startTime) {
      set({
        elapsedTime: Math.floor((Date.now() - state.startTime) / 1000),
        startTime: null,
        timerIntervalId: null,
      });
    }
  },

  updateTimer: () => {
    const state = get();
    
    if (state.startTime) {
      set({
        elapsedTime: Math.floor((Date.now() - state.startTime) / 1000),
      });
    }
  },
}));
