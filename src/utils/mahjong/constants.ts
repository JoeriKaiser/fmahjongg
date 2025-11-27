export const TILE_SYMBOLS = {
	suits: {
		man: [
			"Man1",
			"Man2",
			"Man3",
			"Man4",
			"Man5",
			"Man6",
			"Man7",
			"Man8",
			"Man9",
		],
		pin: [
			"Pin1",
			"Pin2",
			"Pin3",
			"Pin4",
			"Pin5",
			"Pin6",
			"Pin7",
			"Pin8",
			"Pin9",
		],
		sou: [
			"Sou1",
			"Sou2",
			"Sou3",
			"Sou4",
			"Sou5",
			"Sou6",
			"Sou7",
			"Sou8",
			"Sou9",
		],
	},
	winds: ["North", "South", "East", "West"],
	dragons: ["Chun", "Haku", "Hatsu"],
	seasons: ["Season1", "Season2", "Season3", "Season4"],
	flowers: ["Bamboo1", "Bamboo2", "Bamboo3", "Bamboo4"],
} as const;

export const ALL_SYMBOLS: string[] = [
	...TILE_SYMBOLS.suits.man,
	...TILE_SYMBOLS.suits.pin,
	...TILE_SYMBOLS.suits.sou,
	...TILE_SYMBOLS.winds,
	...TILE_SYMBOLS.dragons,
	...TILE_SYMBOLS.seasons,
	...TILE_SYMBOLS.flowers,
];

export const SPACING = {
	X: 1.1,
	Y: 0.52,
	Z: 1.6,
} as const;

export const CENTER_OFFSET = {
	X: -8.4,
	Z: -5.6,
} as const;

export const MAX_GENERATION_ATTEMPTS = 20;
