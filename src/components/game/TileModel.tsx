import { Outlines, useGLTF, useTexture } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import React from "react";
import * as THREE from "three";
import type { TileData } from "@/utils/mahjong/types";

export function TileModel({
	props,
	tile,
}: {
	props?: ThreeElements["group"];
	tile: TileData;
}) {
	const [hovered, hover] = React.useState(false);
	const { nodes } = useGLTF("/textures/models/tile.glb");
	const texturePath = tile.symbol
		? `/textures/Regular/${tile.symbol}.png`
		: "/textures/Regular/Chun.png";

	console.log("Loading texture:", texturePath, "tile.symbol:", tile.symbol);

	const textures = useTexture({ symbol: texturePath });

	const sideMat = new THREE.MeshStandardMaterial({
		color: tile.isSelected ? "#ffEeee" : "#ffffff",
		emissive: "#ffffff",
		emissiveIntensity: hovered ? 0.25 : 0,
	});

	const topMat = new THREE.MeshStandardMaterial({
		map: textures.symbol,
		transparent: true,
		alphaTest: 0.1,
		side: THREE.DoubleSide,
	});

	const sidesGeometry = (nodes.Cube as THREE.Mesh).geometry;
	const topGeometry = (nodes.Cube001 as THREE.Mesh).geometry;

	return (
		<group {...props} dispose={null} rotation={[0, Math.PI, 0]}>
			<group
				scale={[-0.35, 1, 0.8]}
				onPointerOver={(event) => (event.stopPropagation(), hover(true))}
				onPointerOut={() => hover(false)}
			>
				<mesh
					castShadow
					receiveShadow
					geometry={sidesGeometry}
					material={sideMat}
				/>
				<mesh
					castShadow
					receiveShadow
					geometry={topGeometry}
					material={topMat}
				/>
				<Outlines
					screenspace={true}
					thickness={0.08}
					color="hotpink"
					transparent={true}
					opacity={1}
					angle={Math.PI}
				/>
			</group>
		</group>
	);
}

useGLTF.preload("/tile.glb");
