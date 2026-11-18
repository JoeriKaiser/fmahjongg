import type { SeededRandom } from "@/utils/seededRandom";
import {
	MAX_GENERATION_ATTEMPTS,
	REGULAR_SYMBOLS,
	SPACING,
	TILE_SYMBOLS,
} from "../constants";
import {
	createGridKey,
	createTileGrid,
	isTileAccessible,
} from "../grid/gridUtils";
import type { TileData } from "../types";
import { LAYER_LAYOUTS } from "./layouts";

function nextInt(max: number, rng?: SeededRandom): number {
	return rng ? rng.nextInt(0, max) : Math.floor(Math.random() * max);
}

function shuffle<T>(arr: T[], rng?: SeededRandom): T[] {
	for (let i = arr.length - 1; i > 0; i--) {
		const j = nextInt(i + 1, rng);
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

export function generatePairs(
	totalTiles: number,
	rng?: SeededRandom,
): Array<[string, string]> {
	if (totalTiles % 2 !== 0) {
		throw new Error("Total tiles must be even for pairing");
	}

	const neededPairs = totalTiles / 2;
	const standardPairs: Array<[string, string]> = [];

	for (const symbol of REGULAR_SYMBOLS) {
		standardPairs.push([symbol, symbol], [symbol, symbol]);
	}

	const seasons = shuffle([...TILE_SYMBOLS.seasons], rng);
	standardPairs.push([seasons[0], seasons[1]], [seasons[2], seasons[3]]);

	const flowers = shuffle([...TILE_SYMBOLS.flowers], rng);
	standardPairs.push([flowers[0], flowers[1]], [flowers[2], flowers[3]]);

	if (neededPairs <= standardPairs.length) {
		return shuffle(standardPairs, rng).slice(0, neededPairs);
	}

	const pairs: Array<[string, string]> = [];
	while (pairs.length < neededPairs) {
		const batch = shuffle([...standardPairs], rng);
		for (const pair of batch) {
			if (pairs.length >= neededPairs) break;
			pairs.push(pair);
		}
	}
	return pairs;
}

export function createLayoutSlots(
	layerLayouts: number[][][] = LAYER_LAYOUTS,
): TileData[] {
	const rawSlots: Array<{
		id: string;
		gx: number;
		gy: number;
		gz: number;
	}> = [];
	let tileId = 0;
	let minGx = Number.POSITIVE_INFINITY;
	let maxGx = Number.NEGATIVE_INFINITY;
	let minGz = Number.POSITIVE_INFINITY;
	let maxGz = Number.NEGATIVE_INFINITY;

	for (let layerIndex = 0; layerIndex < layerLayouts.length; layerIndex++) {
		const layer = layerLayouts[layerIndex];

		for (let rowIndex = 0; rowIndex < layer.length; rowIndex++) {
			const row = layer[rowIndex];

			for (let colIndex = 0; colIndex < row.length; colIndex++) {
				const tileType = row[colIndex];

				if (tileType >= 1 && tileType <= 3) {
					const gx = colIndex * 2 + (tileType === 3 ? 1 : 0);
					const gz = rowIndex * 2 + (tileType >= 2 ? 1 : 0);

					if (gx < minGx) minGx = gx;
					if (gx > maxGx) maxGx = gx;
					if (gz < minGz) minGz = gz;
					if (gz > maxGz) maxGz = gz;

					rawSlots.push({
						id: `tile-${tileId++}-L${layerIndex}`,
						gx,
						gy: layerIndex,
						gz,
					});
				}
			}
		}
	}

	if (rawSlots.length === 0) return [];

	const centerGx = (minGx + maxGx) / 2;
	const centerGz = (minGz + maxGz) / 2;

	return rawSlots.map(({ id, gx, gy, gz }) => ({
		id,
		symbol: "",
		position: {
			x: ((gx - centerGx) / 2) * SPACING.X,
			y: gy * SPACING.Y,
			z: ((gz - centerGz) / 2) * SPACING.Z,
		},
		gridPosition: {
			x: gx,
			y: gy,
			z: gz,
		},
		layer: gy,
		isRemoved: false,
		isAccessible: false,
	}));
}

function peelLayout(
	slots: TileData[],
	rng?: SeededRandom,
): Array<[number, number]> | null {
	const workingGrid = createTileGrid(slots);
	const activeIndices = slots.map((_, index) => index);
	const peelOrder: Array<[number, number]> = [];

	while (activeIndices.length > 0) {
		const freePositions: number[] = [];

		for (let i = 0; i < activeIndices.length; i++) {
			const slot = slots[activeIndices[i]];
			if (isTileAccessible(slot, workingGrid)) {
				freePositions.push(i);
			}
		}

		if (freePositions.length < 2) {
			return null;
		}

		const firstPick = nextInt(freePositions.length, rng);
		const firstActivePos = freePositions[firstPick];
		freePositions[firstPick] = freePositions[freePositions.length - 1];
		freePositions.pop();

		const secondPick = nextInt(freePositions.length, rng);
		const secondActivePos = freePositions[secondPick];

		const slotIdxA = activeIndices[firstActivePos];
		const slotIdxB = activeIndices[secondActivePos];

		const slotA = slots[slotIdxA];
		const slotB = slots[slotIdxB];

		workingGrid.delete(
			createGridKey(
				slotA.gridPosition.x,
				slotA.gridPosition.y,
				slotA.gridPosition.z,
			),
		);
		workingGrid.delete(
			createGridKey(
				slotB.gridPosition.x,
				slotB.gridPosition.y,
				slotB.gridPosition.z,
			),
		);

		const highPos = Math.max(firstActivePos, secondActivePos);
		const lowPos = Math.min(firstActivePos, secondActivePos);
		activeIndices[highPos] = activeIndices[activeIndices.length - 1];
		activeIndices.pop();
		activeIndices[lowPos] = activeIndices[activeIndices.length - 1];
		activeIndices.pop();

		peelOrder.push([slotIdxA, slotIdxB]);
	}

	return peelOrder;
}

export interface GeneratedLayout {
	tiles: TileData[];
	solution: Array<[string, string]>;
}

export function generateSolvableLayout(
	rng?: SeededRandom,
	layerLayouts: number[][][] = LAYER_LAYOUTS,
): GeneratedLayout {
	const slots = createLayoutSlots(layerLayouts);
	if (slots.length % 2 !== 0) {
		throw new Error("Layout must contain an even number of tiles");
	}

	for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
		const peelOrder = peelLayout(slots, rng);
		if (!peelOrder) continue;

		const pairs = generatePairs(slots.length, rng);
		const tiles = slots.map((slot) => ({ ...slot }));
		const solution: Array<[string, string]> = [];

		for (let i = 0; i < peelOrder.length; i++) {
			const [idxA, idxB] = peelOrder[i];
			const [symA, symB] = pairs[i];
			tiles[idxA].symbol = symA;
			tiles[idxB].symbol = symB;
			solution.push([tiles[idxA].id, tiles[idxB].id]);
		}

		const grid = createTileGrid(tiles);
		for (const tile of tiles) {
			tile.isAccessible = isTileAccessible(tile, grid);
		}

		return { tiles, solution };
	}

	throw new Error(
		`Failed to generate solvable layout after ${MAX_GENERATION_ATTEMPTS} attempts`,
	);
}

export function generateInitialLayout(
	rng?: SeededRandom,
	layerLayouts: number[][][] = LAYER_LAYOUTS,
): TileData[] {
	return generateSolvableLayout(rng, layerLayouts).tiles;
}
