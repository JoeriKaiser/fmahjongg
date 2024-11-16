/* eslint-disable react/no-unknown-property */
import { TileData } from '@/utils/mahjong/types';
import { useGLTF, useTexture } from '@react-three/drei';
import { GroupProps } from '@react-three/fiber';
import * as THREE from 'three';

export function TileModel({ props, tile }: { props?: GroupProps; tile: TileData }) {
  const { nodes } = useGLTF('/textures/models/tile.glb');
  const textures = tile.symbol
    ? useTexture({ symbol: `/textures/Regular/${tile.symbol}.png` })
    : useTexture({ symbol: `/textures/Regular/Chun.png` });

  const sideMat = new THREE.MeshStandardMaterial({
    color: tile.isSelected ? '#ffEeee' : '#ffffff'
  });
  const topMat = new THREE.MeshStandardMaterial({
    map: textures.symbol,
    transparent: true
  });

  return (
    <group {...props} dispose={null} rotation={[0, Math.PI, 0]}>
      <group scale={[-0.35, 1, 0.8]}>
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube as THREE.Mesh).geometry}
          material={sideMat}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={(nodes.Cube001 as THREE.Mesh).geometry}
          material={topMat}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/tile.glb');
