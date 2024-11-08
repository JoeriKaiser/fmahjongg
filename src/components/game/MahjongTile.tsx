/* eslint-disable react/no-unknown-property */
import { TileData } from '@/utils/layoutGenerator';
import { useGameStore } from '@/store/gameStore';
import { useRef } from 'react';
import { TileModel } from './TileModel';
import { ThreeEvent } from '@react-three/fiber';

export function MahjongTile({ tile }: { tile: TileData }) {
  const selectTile = useGameStore((state) => state.selectTile);
  const meshRef = useRef(null);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    // Handles click only if the tile is accessible due to textures being transparent
    event.stopPropagation();
    selectTile(tile);
  };

  return (
    <group
      ref={meshRef}
      position={[tile.position.x, tile.position.y, tile.position.z]}
      onClick={handleClick}
      visible={!tile.isRemoved}>
      <TileModel tile={tile} />
    </group>
  );
}
