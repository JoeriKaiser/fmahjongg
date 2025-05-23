import { createTileGrid } from "../grid/gridUtils";
import type { TileData, ValidationState } from "../types";
import { findAvailableMoves } from "./moves";

interface Move {
	tile1: TileData;
	tile2: TileData;
}

export function isLayoutSolvable(initialTiles: TileData[]): boolean {
	const state: ValidationState = {
		tiles: [...initialTiles],
		removedTiles: new Set<string>(),
		grid: createTileGrid(initialTiles),
	};

	while (true) {
		const moves = findAvailableMoves(state);
		if (moves.length === 0) {
			return (
				state.tiles.filter((t) => !state.removedTiles.has(t.id)).length === 0
			);
		}

		moves.sort((a: Move, b: Move) => {
			if (a.tile1.layer !== b.tile1.layer) {
				return b.tile1.layer - a.tile1.layer;
			}
			return a.tile1.gridPosition.z - b.tile1.gridPosition.z;
		});

		const move = moves[0];
		state.removedTiles.add(move.tile1.id);
		state.removedTiles.add(move.tile2.id);
		state.grid = createTileGrid(
			state.tiles.filter((t) => !state.removedTiles.has(t.id)),
		);
	}
}
