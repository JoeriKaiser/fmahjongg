/** biome-ignore-all lint/a11y/noStaticElementInteractions: 3D canvas mesh interactions */

import { useTexture } from "@react-three/drei";
import { type ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import {
	memo,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
} from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { useGameStore } from "@/store/gameStore";
import { ALL_SYMBOLS, SPACING } from "@/utils/mahjong/constants";

const TILE_W = SPACING.X;
const TILE_H = SPACING.Y;
const TILE_D = SPACING.Z;
const TILE_RADIUS = 0.045;
const TILE_HALF_W = TILE_W / 2;
const TILE_HALF_H = TILE_H / 2;
const TILE_HALF_D = TILE_D / 2;

const FACE_W = 0.98;
const FACE_D = 1.44;
const FACE_Y_OFFSET = TILE_HALF_H + 0.004;

export const ATLAS_PATH = "/textures/tile-atlas.webp";
const ATLAS_COLS = 7;
const ATLAS_ROWS = 6;
const ATLAS_SCALE_U = 1 / ATLAS_COLS;
const ATLAS_SCALE_V = 1 / ATLAS_ROWS;

const SYMBOL_INDEX = new Map<string, number>(
	ALL_SYMBOLS.map((symbol, index) => [symbol, index]),
);

const COLOR_BASE = new THREE.Color("#f7f4ec");
const COLOR_HOVER = new THREE.Color("#ffffff");
const COLOR_SELECTED = new THREE.Color("#86efac");
const COLOR_HINT = new THREE.Color("#fde047");
const COLOR_DIMMED = new THREE.Color("#94a3b8");

const FACE_COLOR_NORMAL = new THREE.Color("#ffffff");
const FACE_COLOR_DIMMED = new THREE.Color("#8c99a8");

const NOOP_RAYCAST = () => {};

interface AnimBuffers {
	scales: Float32Array;
	lifts: Float32Array;
	colorsR: Float32Array;
	colorsG: Float32Array;
	colorsB: Float32Array;
	faceDimmed: Uint8Array;
}

function createAnimBuffers(count: number): AnimBuffers {
	const scales = new Float32Array(count);
	const lifts = new Float32Array(count);
	const colorsR = new Float32Array(count);
	const colorsG = new Float32Array(count);
	const colorsB = new Float32Array(count);
	const faceDimmed = new Uint8Array(count);

	scales.fill(1);
	colorsR.fill(COLOR_BASE.r);
	colorsG.fill(COLOR_BASE.g);
	colorsB.fill(COLOR_BASE.b);

	return { scales, lifts, colorsR, colorsG, colorsB, faceDimmed };
}

function getTargetColor(
	isSelected: boolean,
	isHinted: boolean,
	isHovered: boolean,
	isAccessible: boolean,
	highlightFreeTiles: boolean,
): THREE.Color {
	if (isSelected) return COLOR_SELECTED;
	if (isHinted) return COLOR_HINT;
	if (isHovered && isAccessible) return COLOR_HOVER;
	if (highlightFreeTiles && !isAccessible) return COLOR_DIMMED;
	return COLOR_BASE;
}

export const TileInstances = memo(function TileInstances({
	onReady,
}: {
	onReady?: () => void;
}) {
	const tiles = useGameStore((s) => s.tiles);
	const boardVersion = useGameStore((s) => s.boardVersion);
	const selectedTileId = useGameStore((s) => s.selectedTileId);
	const hintPair = useGameStore((s) => s.hintPair);
	const highlightFreeTiles = useGameStore((s) => s.highlightFreeTiles);
	const selectTile = useGameStore((s) => s.selectTile);
	const invalidate = useThree((s) => s.invalidate);
	const gl = useThree((s) => s.gl);

	const bodyGeometry = useMemo(
		() => new RoundedBoxGeometry(TILE_W, TILE_H, TILE_D, 2, TILE_RADIUS),
		[],
	);

	const faceGeometry = useMemo(() => {
		const geo = new THREE.PlaneGeometry(FACE_W, FACE_D);
		geo.rotateX(-Math.PI / 2);
		geo.translate(0, FACE_Y_OFFSET, 0);
		return geo;
	}, []);

	useEffect(() => {
		return () => {
			bodyGeometry.dispose();
			faceGeometry.dispose();
		};
	}, [bodyGeometry, faceGeometry]);

	const atlasTexture = useTexture(ATLAS_PATH);

	useLayoutEffect(() => {
		atlasTexture.colorSpace = THREE.SRGBColorSpace;
		atlasTexture.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy());
		atlasTexture.needsUpdate = true;
	}, [atlasTexture, gl]);

	const bodyMaterial = useMemo(
		() =>
			new THREE.MeshLambertMaterial({
				color: "#ffffff",
			}),
		[],
	);

	const faceMaterial = useMemo(() => {
		const mat = new THREE.MeshLambertMaterial({
			map: atlasTexture,
			transparent: true,
			depthWrite: false,
			alphaTest: 0.02,
		});
		mat.onBeforeCompile = (shader) => {
			shader.vertexShader = shader.vertexShader
				.replace(
					"#include <uv_pars_vertex>",
					"#include <uv_pars_vertex>\nattribute vec2 aAtlasOffset;",
				)
				.replace(
					"#include <uv_vertex>",
					`#include <uv_vertex>
#ifdef USE_MAP
	vMapUv = aAtlasOffset + vMapUv * vec2(${ATLAS_SCALE_U.toFixed(8)}, ${ATLAS_SCALE_V.toFixed(8)});
#endif`,
				);
		};
		mat.customProgramCacheKey = () => "tile-atlas-face-v2";
		return mat;
	}, [atlasTexture]);

	useEffect(() => {
		return () => {
			bodyMaterial.dispose();
			faceMaterial.dispose();
		};
	}, [bodyMaterial, faceMaterial]);

	const bodyMeshRef = useRef<THREE.InstancedMesh>(null);
	const faceMeshRef = useRef<THREE.InstancedMesh>(null);
	const hoveredIndexRef = useRef(-1);
	const animRef = useRef<AnimBuffers>(createAnimBuffers(0));
	const initializedBoardRef = useRef<number>(-1);

	const dummy = useMemo(() => new THREE.Object3D(), []);
	const tempColor = useMemo(() => new THREE.Color(), []);
	const tempBox = useMemo(() => new THREE.Box3(), []);
	const tempHit = useMemo(() => new THREE.Vector3(), []);
	const closestHit = useMemo(() => new THREE.Vector3(), []);

	const tilesRef = useRef(tiles);
	tilesRef.current = tiles;
	const selectedIdRef = useRef(selectedTileId);
	selectedIdRef.current = selectedTileId;
	const hintPairRef = useRef(hintPair);
	hintPairRef.current = hintPair;
	const highlightFreeRef = useRef(highlightFreeTiles);
	highlightFreeRef.current = highlightFreeTiles;
	const reducedMotionRef = useRef(false);

	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return;
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		reducedMotionRef.current = mq.matches;
		const onChange = (e: MediaQueryListEvent) => {
			reducedMotionRef.current = e.matches;
			invalidate();
		};
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [invalidate]);

	useLayoutEffect(() => {
		const bodyMesh = bodyMeshRef.current;
		const faceMesh = faceMeshRef.current;
		if (!bodyMesh || !faceMesh || tiles.length === 0) return;

		if (initializedBoardRef.current !== boardVersion) {
			initializedBoardRef.current = boardVersion;
			const buffers = createAnimBuffers(tiles.length);
			animRef.current = buffers;
			hoveredIndexRef.current = -1;

			const offsets = new Float32Array(tiles.length * 2);

			for (let i = 0; i < tiles.length; i++) {
				const tile = tiles[i];
				const scale = tile.isRemoved ? 0 : 1;
				buffers.scales[i] = scale;
				buffers.lifts[i] = 0;

				dummy.position.set(tile.position.x, tile.position.y, tile.position.z);
				dummy.scale.setScalar(scale);
				dummy.updateMatrix();
				bodyMesh.setMatrixAt(i, dummy.matrix);
				faceMesh.setMatrixAt(i, dummy.matrix);

				const color = getTargetColor(
					tile.id === selectedTileId,
					hintPair !== null &&
						(hintPair[0] === tile.id || hintPair[1] === tile.id),
					false,
					tile.isAccessible,
					highlightFreeTiles,
				);
				buffers.colorsR[i] = color.r;
				buffers.colorsG[i] = color.g;
				buffers.colorsB[i] = color.b;
				bodyMesh.setColorAt(i, color);

				const isDimmed = highlightFreeTiles && !tile.isAccessible;
				buffers.faceDimmed[i] = isDimmed ? 1 : 0;
				faceMesh.setColorAt(
					i,
					isDimmed ? FACE_COLOR_DIMMED : FACE_COLOR_NORMAL,
				);

				const symIdx = SYMBOL_INDEX.get(tile.symbol) ?? 0;
				const col = symIdx % ATLAS_COLS;
				const row = Math.floor(symIdx / ATLAS_COLS);
				offsets[i * 2] = col * ATLAS_SCALE_U;
				offsets[i * 2 + 1] = (ATLAS_ROWS - 1 - row) * ATLAS_SCALE_V;
			}

			faceGeometry.setAttribute(
				"aAtlasOffset",
				new THREE.InstancedBufferAttribute(offsets, 2),
			);

			bodyMesh.instanceMatrix.needsUpdate = true;
			faceMesh.instanceMatrix.needsUpdate = true;
			if (bodyMesh.instanceColor) bodyMesh.instanceColor.needsUpdate = true;
			if (faceMesh.instanceColor) faceMesh.instanceColor.needsUpdate = true;
			gl.shadowMap.needsUpdate = true;
		}

		invalidate();
		onReady?.();
	}, [
		boardVersion,
		tiles,
		selectedTileId,
		hintPair,
		highlightFreeTiles,
		faceGeometry,
		dummy,
		gl,
		invalidate,
		onReady,
	]);

	useEffect(() => {
		return () => {
			document.body.style.cursor = "auto";
		};
	}, []);

	const customRaycast = useCallback(
		(raycaster: THREE.Raycaster, intersects: THREE.Intersection[]) => {
			const currentTiles = tilesRef.current;
			const mesh = bodyMeshRef.current;
			if (!mesh || currentTiles.length === 0) return;

			const lifts = animRef.current.lifts;
			const ray = raycaster.ray;
			let closestDistSq = Number.POSITIVE_INFINITY;
			let closestIdx = -1;

			for (let i = 0; i < currentTiles.length; i++) {
				const tile = currentTiles[i];
				if (tile.isRemoved) continue;
				const lift = lifts[i] ?? 0;
				const { x, y, z } = tile.position;

				tempBox.min.set(
					x - TILE_HALF_W,
					y + lift - TILE_HALF_H,
					z - TILE_HALF_D,
				);
				tempBox.max.set(
					x + TILE_HALF_W,
					y + lift + TILE_HALF_H,
					z + TILE_HALF_D,
				);

				if (ray.intersectBox(tempBox, tempHit)) {
					const distSq = ray.origin.distanceToSquared(tempHit);
					if (distSq < closestDistSq) {
						closestDistSq = distSq;
						closestIdx = i;
						closestHit.copy(tempHit);
					}
				}
			}

			if (closestIdx !== -1) {
				intersects.push({
					distance: Math.sqrt(closestDistSq),
					point: closestHit.clone(),
					object: mesh,
					instanceId: closestIdx,
				});
			}
		},
		[tempBox, tempHit, closestHit],
	);

	useFrame((_, delta) => {
		const bodyMesh = bodyMeshRef.current;
		const faceMesh = faceMeshRef.current;
		const currentTiles = tilesRef.current;
		if (!bodyMesh || !faceMesh || currentTiles.length === 0) return;

		const buffers = animRef.current;
		if (buffers.scales.length !== currentTiles.length) return;

		const dt = Math.min(delta, 0.05);
		const reducedMotion = reducedMotionRef.current;
		const scaleFactor = reducedMotion ? 1 : 1 - Math.exp(-18 * dt);
		const liftFactor = reducedMotion ? 1 : 1 - Math.exp(-20 * dt);
		const colorFactor = reducedMotion ? 1 : 1 - Math.exp(-16 * dt);

		const selId = selectedIdRef.current;
		const hint = hintPairRef.current;
		const highlightFree = highlightFreeRef.current;
		const hoveredIdx = hoveredIndexRef.current;

		let matrixDirty = false;
		let shadowDirty = false;
		let bodyColorDirty = false;
		let faceColorDirty = false;
		let needsMoreFrames = false;

		for (let i = 0; i < currentTiles.length; i++) {
			const tile = currentTiles[i];
			const isSelected = selId === tile.id;
			const isHinted =
				hint !== null && (hint[0] === tile.id || hint[1] === tile.id);
			const isHovered = hoveredIdx === i;

			const targetScale = tile.isRemoved ? 0 : 1;
			const targetLift = reducedMotion
				? 0
				: tile.isRemoved
					? 0.35
					: isSelected
						? 0.18
						: isHinted
							? 0.14
							: isHovered && tile.isAccessible
								? 0.09
								: 0;

			let curScale = buffers.scales[i];
			let curLift = buffers.lifts[i];
			let transformChanged = false;

			if (curScale !== targetScale) {
				const diff = targetScale - curScale;
				if (Math.abs(diff) < 0.004) {
					curScale = targetScale;
				} else {
					curScale += diff * scaleFactor;
					needsMoreFrames = true;
				}
				buffers.scales[i] = curScale;
				transformChanged = true;
				shadowDirty = true;
			}

			if (curLift !== targetLift) {
				const diff = targetLift - curLift;
				if (Math.abs(diff) < 0.003) {
					curLift = targetLift;
				} else {
					curLift += diff * liftFactor;
					needsMoreFrames = true;
				}
				buffers.lifts[i] = curLift;
				transformChanged = true;
			}

			if (transformChanged) {
				const renderScale = curScale < 0.005 ? 0 : curScale;
				dummy.position.set(
					tile.position.x,
					tile.position.y + curLift,
					tile.position.z,
				);
				dummy.scale.setScalar(renderScale);
				dummy.updateMatrix();
				bodyMesh.setMatrixAt(i, dummy.matrix);
				faceMesh.setMatrixAt(i, dummy.matrix);
				matrixDirty = true;
			}

			const targetColor = getTargetColor(
				isSelected,
				isHinted,
				isHovered,
				tile.isAccessible,
				highlightFree,
			);
			const curR = buffers.colorsR[i];
			const curG = buffers.colorsG[i];
			const curB = buffers.colorsB[i];

			const dr = targetColor.r - curR;
			const dg = targetColor.g - curG;
			const db = targetColor.b - curB;

			if (dr !== 0 || dg !== 0 || db !== 0) {
				let nextR = curR;
				let nextG = curG;
				let nextB = curB;

				if (
					Math.abs(dr) < 0.004 &&
					Math.abs(dg) < 0.004 &&
					Math.abs(db) < 0.004
				) {
					nextR = targetColor.r;
					nextG = targetColor.g;
					nextB = targetColor.b;
				} else {
					nextR += dr * colorFactor;
					nextG += dg * colorFactor;
					nextB += db * colorFactor;
					needsMoreFrames = true;
				}

				buffers.colorsR[i] = nextR;
				buffers.colorsG[i] = nextG;
				buffers.colorsB[i] = nextB;
				tempColor.setRGB(nextR, nextG, nextB);
				bodyMesh.setColorAt(i, tempColor);
				bodyColorDirty = true;
			}

			const wantFaceDimmed = highlightFree && !tile.isAccessible ? 1 : 0;
			if (buffers.faceDimmed[i] !== wantFaceDimmed) {
				buffers.faceDimmed[i] = wantFaceDimmed;
				faceMesh.setColorAt(
					i,
					wantFaceDimmed ? FACE_COLOR_DIMMED : FACE_COLOR_NORMAL,
				);
				faceColorDirty = true;
			}
		}

		if (matrixDirty) {
			bodyMesh.instanceMatrix.needsUpdate = true;
			faceMesh.instanceMatrix.needsUpdate = true;
		}
		if (shadowDirty) {
			gl.shadowMap.needsUpdate = true;
		}
		if (bodyColorDirty && bodyMesh.instanceColor) {
			bodyMesh.instanceColor.needsUpdate = true;
		}
		if (faceColorDirty && faceMesh.instanceColor) {
			faceMesh.instanceColor.needsUpdate = true;
		}
		if (needsMoreFrames) {
			invalidate();
		}
	});

	const handleClick = useCallback(
		(e: ThreeEvent<MouseEvent>) => {
			e.stopPropagation();
			const idx = e.instanceId;
			if (idx === undefined) return;
			const tile = tilesRef.current[idx];
			if (!tile || tile.isRemoved) return;
			selectTile(tile);
			invalidate();
		},
		[selectTile, invalidate],
	);

	const handlePointerMove = useCallback(
		(e: ThreeEvent<PointerEvent>) => {
			e.stopPropagation();
			const idx = e.instanceId;
			if (idx === undefined) return;
			const tile = tilesRef.current[idx];
			if (!tile || tile.isRemoved) return;

			if (hoveredIndexRef.current !== idx) {
				hoveredIndexRef.current = idx;
				document.body.style.cursor = tile.isAccessible ? "pointer" : "default";
				invalidate();
			}
		},
		[invalidate],
	);

	const handlePointerOut = useCallback(() => {
		if (hoveredIndexRef.current !== -1) {
			hoveredIndexRef.current = -1;
			document.body.style.cursor = "auto";
			invalidate();
		}
	}, [invalidate]);

	if (tiles.length === 0) {
		return null;
	}

	return (
		<group>
			<instancedMesh
				key={`body-${tiles.length}`}
				ref={bodyMeshRef}
				args={[bodyGeometry, bodyMaterial, tiles.length]}
				castShadow
				receiveShadow
				frustumCulled={false}
				raycast={customRaycast}
				onClick={handleClick}
				onPointerMove={handlePointerMove}
				onPointerOut={handlePointerOut}
			/>
			<instancedMesh
				key={`face-${tiles.length}`}
				ref={faceMeshRef}
				args={[faceGeometry, faceMaterial, tiles.length]}
				frustumCulled={false}
				raycast={NOOP_RAYCAST}
			/>
		</group>
	);
});

useTexture.preload(ATLAS_PATH);
