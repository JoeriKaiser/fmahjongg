import {
	CENTER_OFFSET,
	MAX_GENERATION_ATTEMPTS,
	SPACING,
	TILE_SYMBOLS,
} from "../constants";
import type { TileData } from "../types";
import { isLayoutSolvable } from "../validation/solvability";
import { validateLayout } from "../validation/validator";
import { LAYER_LAYOUTS } from "./layouts";

function shuffleArray<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

function createTileSymbolPool(): string[] {
	return [
		...TILE_SYMBOLS.suits.man,
		...TILE_SYMBOLS.suits.pin,
		...TILE_SYMBOLS.suits.sou,
		...TILE_SYMBOLS.winds,
		...TILE_SYMBOLS.dragons,
		...TILE_SYMBOLS.seasons,
		...TILE_SYMBOLS.flowers,
	];
}

function generateTileDeck(): string[] {
	const totalTilesNeeded = LAYER_LAYOUTS.reduce(
		(total, layer) =>
			total + layer.flat().filter((val) => val >= 1 && val <= 3).length,
		0,
	);

	const symbolPool = createTileSymbolPool();
	const deck: string[] = [];
	const symbolUsage = new Map<string, number>();

	const shuffledPool = shuffleArray(symbolPool);
	let poolIndex = 0;

	while (deck.length < totalTilesNeeded) {
		const symbol = shuffledPool[poolIndex % shuffledPool.length];
		const currentUsage = symbolUsage.get(symbol) || 0;

		if (currentUsage === 0) {
			deck.push(symbol, symbol);
			symbolUsage.set(symbol, 2);
		} else if (currentUsage % 2 === 0 && deck.length + 2 <= totalTilesNeeded) {
			deck.push(symbol, symbol);
			symbolUsage.set(symbol, currentUsage + 2);
		}

		poolIndex++;

		if (poolIndex >= shuffledPool.length * 10) {
			break;
		}
	}

	while (deck.length < totalTilesNeeded) {
		const symbol =
			shuffledPool[Math.floor(Math.random() * shuffledPool.length)];
		deck.push(symbol);
	}

	return shuffleArray(deck.slice(0, totalTilesNeeded));
}

function createTilesFromLayout(deck: string[]): TileData[] {
	const tiles: TileData[] = [];
	let deckIndex = 0;
	let tileId = 0;

	LAYER_LAYOUTS.forEach((layer, layerIndex) => {
		layer.forEach((row, rowIndex) => {
			row.forEach((tileType, colIndex) => {
				if (tileType >= 1 && tileType <= 3) {
					const symbol = deck[deckIndex];

					tiles.push({
						id: `${tileId++}-${layerIndex}-${rowIndex}-${colIndex}${
							tileType > 1 ? "-split" : ""
						}`,
						symbol,
						position: {
							x:
								(tileType === 3 ? colIndex + 0.5 : colIndex) * SPACING.X +
								CENTER_OFFSET.X,
							y: layerIndex * SPACING.Y,
							z:
								(tileType >= 2 ? rowIndex + 0.5 : rowIndex) * SPACING.Z +
								CENTER_OFFSET.Z,
						},
						gridPosition: {
							x: colIndex,
							y: layerIndex,
							z: rowIndex,
						},
						layer: layerIndex,
						isSelected: false,
						isRemoved: false,
						isAccessible: true,
					});

					deckIndex++;
				}
			});
		});
	});

	return tiles;
}

export function generateInitialLayout(): TileData[] {
	let attempts = 0;

	while (attempts < MAX_GENERATION_ATTEMPTS) {
		attempts++;

		try {
			const deck = generateTileDeck();
			const tiles = createTilesFromLayout(deck);

			if (validateLayout(tiles) && isLayoutSolvable(tiles)) {
				return tiles;
			}
		} catch (error) {
			console.warn(`Layout generation attempt ${attempts} failed:`, error);
		}
	}

	console.warn("Could not generate perfectly solvable layout, using fallback");
	const deck = generateTileDeck();
	return createTilesFromLayout(deck);
}
