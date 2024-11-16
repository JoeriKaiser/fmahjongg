import { canMatch } from '@/utils/gameLogic';
import { CENTER_OFFSET, generateInitialLayout, SPACING, TileData } from '@/utils/layoutGenerator';
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

function createTileGrid(tiles: TileData[]) {
  const grid: { [key: string]: TileData[] } = {};

  tiles.forEach((tile) => {
    if (!tile.isRemoved) {
      if (tile.id.includes('split')) {
        const { x, y, z } = tile.gridPosition;
        const positions = [];

        // Type 2 tiles (shifted down)
        if (tile.position.x === x * SPACING.X + CENTER_OFFSET.X) {
          positions.push(
            `${x},${y},${z}`, // Base position
            `${x},${y},${z + 1}` // Position below
          );
        }
        // Type 3 tiles (shifted down and right)
        else {
          positions.push(
            `${x},${y},${z}`, // Base position
            `${x},${y},${z + 1}`, // Position below
            `${x + 1},${y},${z}`, // Position right
            `${x + 1},${y},${z + 1}` // Position diagonal
          );
        }

        positions.forEach((key) => {
          grid[key] = grid[key] || [];
          grid[key].push(tile);
        });
      } else {
        const key = `${tile.gridPosition.x},${tile.gridPosition.y},${tile.gridPosition.z}`;
        grid[key] = grid[key] || [];
        grid[key].push(tile);
      }
    }
  });
  return grid;
}

export function getNeighbors(tile: TileData, grid: { [key: string]: TileData[] }) {
  const { x, y, z } = tile.gridPosition;
  return {
    top: Boolean(grid[`${x},${y + 1},${z}`]?.length),
    left: Boolean(grid[`${x - 1},${y},${z}`]?.length),
    right: Boolean(grid[`${x + 1},${y},${z}`]?.length),
    splitAbove: grid[`${x},${y + 1},${z - 1}`]?.some((t) => t.id.includes('split')) ?? false
  };
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
      // TODO FIX, this is not setting to true on finished game
      isGameWon: gameOver && get().tiles.length === 0
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
    const grid = createTileGrid(state.tiles);
    const activeTiles = state.tiles.filter((tile) => !tile.isRemoved);
    let possiblePairs = 0;
    const counted = new Set<string>();
    const matchingPairs: MatchingPair[] = [];

    for (let i = 0; i < activeTiles.length; i++) {
      for (let j = i + 1; j < activeTiles.length; j++) {
        const tile1 = activeTiles[i];
        const tile2 = activeTiles[j];
        const tile1Neighbors = getNeighbors(tile1, grid);
        const tile2Neighbors = getNeighbors(tile2, grid);

        if (
          canMatch(tile1, tile2, tile1Neighbors, tile2Neighbors) &&
          !counted.has(`${tile1.id}-${tile2.id}`) &&
          !counted.has(`${tile2.id}-${tile1.id}`)
        ) {
          possiblePairs++;
          counted.add(`${tile1.id}-${tile2.id}`);
          matchingPairs.push({
            tile1Id: tile1.id,
            tile2Id: tile2.id
          });
        }
      }
    }

    if (possiblePairs === 0 || activeTiles.length === 0) {
      set((state) => ({ ...state, gameOver: true }));
      get().stopTimer();
    }

    set((state) => ({
      ...state,
      possibleMoves: possiblePairs,
      matchingPairs: matchingPairs
    }));

    return { count: possiblePairs, pairs: matchingPairs };
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
