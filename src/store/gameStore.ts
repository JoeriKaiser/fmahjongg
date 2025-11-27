import { createTileGrid } from '@/utils/mahjong/grid/gridUtils';
import { generateInitialLayout } from '@/utils/mahjong/layout/generator';
import { canMatch } from '@/utils/mahjong/matching/matcher';
import type { TileData, TileGrid } from '@/utils/mahjong/types';
import { findAvailableMoves } from '@/utils/mahjong/validation/moves';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface GameState {
  tiles: TileData[];
  grid: TileGrid;
  selectedTile: TileData | null;
  gameOver: boolean;
  isGameWon: boolean;
  isLoading: boolean;
  possibleMoves: number;
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

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    tiles: [],
    grid: new Map(),
    selectedTile: null,
    gameOver: false,
    isGameWon: false,
    isLoading: false,
    possibleMoves: 0,
    startTime: null,
    elapsedTime: 0,
    timerIntervalId: null,

    selectTile: (tile) => {
      const state = get();

      if (tile.isRemoved || state.gameOver) return;

      if (!state.startTime) {
        get().startTimer();
      }

      if (!state.selectedTile) {
        set({
          selectedTile: tile,
          tiles: state.tiles.map((t) => ({
            ...t,
            isSelected: t.id === tile.id
          }))
        });
        return;
      }

      if (state.selectedTile.id === tile.id) {
        set({
          selectedTile: null,
          tiles: state.tiles.map((t) => ({ ...t, isSelected: false }))
        });
        return;
      }

      if (canMatch(state.selectedTile, tile, state.grid)) {
        const updatedTiles = state.tiles.map((t) => ({
          ...t,
          isSelected: false,
          isRemoved: t.isRemoved || t.id === tile.id || t.id === state.selectedTile?.id
        }));

        const newGrid = createTileGrid(updatedTiles);

        set({
          selectedTile: null,
          tiles: updatedTiles,
          grid: newGrid
        });

        queueMicrotask(() => get().updatePossibleMoves());
      } else {
        set({
          selectedTile: tile,
          tiles: state.tiles.map((t) => ({
            ...t,
            isSelected: t.id === tile.id
          }))
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
        possibleMoves: 0
      });

      const generate = () => {
        const newTiles = generateInitialLayout();
        const newGrid = createTileGrid(newTiles);

        set({
          tiles: newTiles,
          grid: newGrid,
          isLoading: false
        });

        queueMicrotask(() => get().updatePossibleMoves());
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(generate, { timeout: 100 });
      } else {
        setTimeout(generate, 16);
      }
    },

    setLoading: (loading) => set({ isLoading: loading }),

    updatePossibleMoves: () => {
      const state = get();
      const activeTiles = state.tiles.filter((t) => !t.isRemoved);

      if (activeTiles.length === 0) {
        get().stopTimer();
        set({ gameOver: true, isGameWon: true, possibleMoves: 0 });
        return;
      }

      const moves = findAvailableMoves(state.tiles, state.grid);

      if (moves.length === 0) {
        get().stopTimer();
        set({ gameOver: true, isGameWon: false, possibleMoves: 0 });
      } else {
        set({ possibleMoves: moves.length });
      }
    },

    startTimer: () => {
      const state = get();

      if (state.timerIntervalId) {
        clearInterval(state.timerIntervalId);
      }

      const startTime = Date.now();
      const intervalId = window.setInterval(() => get().updateTimer(), 1000);

      set({ startTime, timerIntervalId: intervalId });
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
          timerIntervalId: null
        });
      }
    },

    updateTimer: () => {
      const state = get();
      if (state.startTime) {
        set({ elapsedTime: Math.floor((Date.now() - state.startTime) / 1000) });
      }
    }
  }))
);
