/* eslint-disable react/no-unknown-property */
import type { TileData } from "@/utils/mahjong/types";
import { Outlines, useGLTF, useTexture } from "@react-three/drei";
import type { GroupProps } from "@react-three/fiber";
import * as THREE from "three";

export function TileModel({
  props,
  tile,
}: { props?: GroupProps; tile: TileData }) {
  const { nodes } = useGLTF("/textures/models/tile.glb");
  const textures = tile.symbol
    ? useTexture({ symbol: `/textures/Regular/${tile.symbol}.png` })
    : useTexture({ symbol: "/textures/Regular/Chun.png" });

  const sideMat = new THREE.MeshStandardMaterial({
    color: tile.isSelected ? "#ffEeee" : "#ffffff",
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
      <group scale={[-0.35, 1, 0.8]}>
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
