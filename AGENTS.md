# Agents guide for fmahjongg

This repository is a static web-only 3D Mahjong Solitaire app built with React 19, Three.js (React Three Fiber), Zustand, Tailwind CSS v4, and Bun.

## Commands

### Development
```bash
bun dev          # Start Vite dev server
bun preview      # Preview production build
```

### Building
```bash
bun build        # Type-check and build for production (tsc && vite build)
```

### Testing
```bash
bun test         # Run unit tests (Bun test runner)
```

### Code quality
```bash
bun format       # Format and fix with Biome (check --write)
bunx biome check # Check formatting and lint rules
bunx biome lint  # Run Biome linter
```

## Code style

- Tabs for indentation (Biome enforced)
- Double quotes for strings
- `camelCase` for variables, functions, and hooks
- `PascalCase` for components, types, and interfaces
- `UPPER_SNAKE_CASE` for module-level constants
- Strict TypeScript with `noUnusedLocals` and `noUnusedParameters`
- Type-only imports use `import type { ... }`
- Path alias: `@/*` maps to `./src/*`
- Named exports for components (with default export only for lazy-loaded `GameCanvas`)
- No comments unless explicitly requested

## Project structure

```
public/textures/
├── tile-atlas.webp    # Packed 7x6 WebP atlas of all 42 tile symbols
└── Regular/           # Source tile PNGs (Chun.png also used on home card)

src/
├── components/
│   ├── game/          # Game UI, HUD, and lazy-loaded 3D scene (GameCanvas, TileInstances)
│   ├── show/          # CSS 3D floating home tile (SplashTile)
│   └── ui/            # shadcn/ui primitives (button, card)
├── lib/               # Utility functions (cn)
├── store/             # Zustand store (gameStore.ts + unit tests)
└── utils/
    ├── dailyPuzzle.ts # Daily puzzle stats, streaks, and completions (localStorage)
    ├── localScores.ts # Random mode personal best times (localStorage)
    ├── seededRandom.ts# Mulberry32 PRNG and daily seed helpers
    ├── sound.ts       # Web Audio API synthesized tile effects
    └── mahjong/       # Pure TypeScript game logic + unit tests
        ├── grid/      # Half-tile integer grid lookups and blocking rules
        ├── layout/    # 144-tile layouts (Turtle, Pyramid, Fortress) and reverse-peel generator
        ├── matching/  # Tile matching logic
        └── validation/# Move finding and solution verification
```

## Notes

- Static web app only (no backend, no Tauri, no Discord SDK).
- Uses Bun as the package manager, test runner, and build tool.
- 3D rendering uses two `InstancedMesh` draw calls (procedural `RoundedBoxGeometry` bodies + single-atlas `PlaneGeometry` faces), analytical AABB raycasting, `frameloop="demand"`, and on-demand shadow map updates.
- State persistence (daily stats, completions, personal best times, in-progress auto-save, UI toggles) lives in `localStorage`.
