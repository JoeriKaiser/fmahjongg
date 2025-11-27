/** biome-ignore-all lint/a11y/noStaticElementInteractions: doesn't matter */

import { useGLTF, useTexture } from "@react-three/drei";
import { type ThreeEvent, useFrame } from "@react-three/fiber";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/gameStore";
import type { TileData } from "@/utils/mahjong/types";

const TEXTURE_PATHS = [
	"Man1",
	"Man2",
	"Man3",
	"Man4",
	"Man5",
	"Man6",
	"Man7",
	"Man8",
	"Man9",
	"Pin1",
	"Pin2",
	"Pin3",
	"Pin4",
	"Pin5",
	"Pin6",
	"Pin7",
	"Pin8",
	"Pin9",
	"Sou1",
	"Sou2",
	"Sou3",
	"Sou4",
	"Sou5",
	"Sou6",
	"Sou7",
	"Sou8",
	"Sou9",
	"North",
	"South",
	"East",
	"West",
	"Chun",
	"Haku",
	"Hatsu",
	"Season1",
	"Season2",
	"Season3",
	"Season4",
	"Bamboo1",
	"Bamboo2",
	"Bamboo3",
	"Bamboo4",
];

interface TileInstanceProps {
	tile: TileData;
	geometry: THREE.BufferGeometry;
	topGeometry: THREE.BufferGeometry;
	texture: THREE.Texture;
	onSelect: (tile: TileData) => void;
}

const TileInstance = memo(function TileInstance({
	tile,
	geometry,
	topGeometry,
	texture,
	onSelect,
}: TileInstanceProps) {
	const meshRef = useRef<THREE.Group>(null);
	const sideMatRef = useRef<THREE.MeshStandardMaterial>(null);
	const hovered = useRef(false);
	const targetEmissive = useRef(0);
	const currentEmissive = useRef(0);
	const scaleRef = useRef(1);
	const targetScale = useRef(1);

	useEffect(() => {
		if (tile.isRemoved) {
			targetScale.current = 0;
		}
	}, [tile.isRemoved]);

	useFrame((_, delta) => {
		if (!sideMatRef.current || !meshRef.current) return;

		const targetEm = hovered.current ? 0.3 : tile.isSelected ? 0.2 : 0;
		targetEmissive.current = targetEm;
		currentEmissive.current = THREE.MathUtils.lerp(
			currentEmissive.current,
			targetEmissive.current,
			delta * 10,
		);
		sideMatRef.current.emissiveIntensity = currentEmissive.current;

		scaleRef.current = THREE.MathUtils.lerp(
			scaleRef.current,
			targetScale.current,
			delta * 8,
		);
		meshRef.current.scale.setScalar(scaleRef.current);
	});

	const handleClick = useCallback(
		(e: ThreeEvent<MouseEvent>) => {
			e.stopPropagation();
			onSelect(tile);
		},
		[tile, onSelect],
	);

	const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
		e.stopPropagation();
		hovered.current = true;
		document.body.style.cursor = "pointer";
	}, []);

	const handlePointerOut = useCallback(() => {
		hovered.current = false;
		document.body.style.cursor = "auto";
	}, []);

	if (scaleRef.current < 0.01 && tile.isRemoved) {
		return null;
	}

	const sideColor = tile.isSelected ? "#ffe8e8" : "#ffffff";

	return (
		<group
			ref={meshRef}
			position={[tile.position.x, tile.position.y, tile.position.z]}
			rotation={[0, Math.PI, 0]}
			onClick={handleClick}
			onPointerOver={handlePointerOver}
			onPointerOut={handlePointerOut}
		>
			<group scale={[-0.35, 1, 0.8]}>
				<mesh castShadow receiveShadow geometry={geometry}>
					<meshStandardMaterial
						ref={sideMatRef}
						color={sideColor}
						emissive="#ffffff"
						emissiveIntensity={0}
					/>
				</mesh>
				<mesh castShadow receiveShadow geometry={topGeometry}>
					<meshStandardMaterial
						map={texture}
						transparent
						alphaTest={0.1}
						side={THREE.DoubleSide}
					/>
				</mesh>
			</group>
		</group>
	);
});

export const TileInstances = memo(function TileInstances() {
	const tiles = useGameStore((s) => s.tiles);
	const selectTile = useGameStore((s) => s.selectTile);

	const { nodes } = useGLTF("/textures/models/tile.glb");
	const sidesGeometry = useMemo(
		() => (nodes.Cube as THREE.Mesh).geometry,
		[nodes],
	);
	const topGeometry = useMemo(
		() => (nodes.Cube001 as THREE.Mesh).geometry,
		[nodes],
	);

	const texturePaths = useMemo(
		() => TEXTURE_PATHS.map((name) => `/textures/Regular/${name}.png`),
		[],
	);
	const textureArray = useTexture(texturePaths);

	const textureMap = useMemo(() => {
		const map = new Map<string, THREE.Texture>();
		TEXTURE_PATHS.forEach((name, i) => {
			const tex = textureArray[i];
			tex.colorSpace = THREE.SRGBColorSpace;
			map.set(name, tex);
		});
		return map;
	}, [textureArray]);

	const handleSelect = useCallback(
		(tile: TileData) => {
			selectTile(tile);
		},
		[selectTile],
	);

	const visibleTiles = useMemo(
		() => tiles.filter((t) => !t.isRemoved),
		[tiles],
	);

	return (
		<group>
			{visibleTiles.map((tile) => (
				<TileInstance
					key={tile.id}
					tile={tile}
					geometry={sidesGeometry}
					topGeometry={topGeometry}
					texture={textureMap.get(tile.symbol) || textureMap.get("Chun")!}
					onSelect={handleSelect}
				/>
			))}
		</group>
	);
});

useGLTF.preload("/textures/models/tile.glb");
