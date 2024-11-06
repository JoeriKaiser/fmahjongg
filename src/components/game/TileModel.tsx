/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable react/no-unknown-property */
import { TileData } from '@/utils/layoutGenerator';
import { useGLTF, useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function TileModel({ props, tile }: { props?: any, tile: TileData }) {
  const { nodes } = useGLTF('/textures/models/tile.glb')
  const textures = useTexture({ symbol: `/textures/Regular/${tile.symbol}.png` });

  const sideMat = new THREE.MeshStandardMaterial({ color: 'white' });
  const topMat = new THREE.MeshStandardMaterial({
    map: textures.symbol,
    transparent: true,
  });

  return (
    <group {...props} dispose={null}>
      <group scale={[0.35, 1, 0.8]}>
        <mesh castShadow receiveShadow geometry={(nodes.Cube as THREE.Mesh).geometry} material={sideMat} />
        <mesh rotation={[0, Math.PI, 0]} castShadow receiveShadow geometry={(nodes.Cube001 as THREE.Mesh).geometry} material={topMat} />
      </group>
    </group>
  )
}

useGLTF.preload('/tile.glb')