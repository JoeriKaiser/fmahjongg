import { useGameStore } from '@/store/gameStore';
import type { TileData } from '@/utils/mahjong/types';
import type { ThreeEvent } from '@react-three/fiber';
import { useRef } from 'react';
import { TileModel } from './TileModel';

export function MahjongTile({ tile }: { tile: TileData }) {
  const selectTile = useGameStore((state) => state.selectTile);
  const meshRef = useRef(null);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (tile.isAccessible) {
      event.stopPropagation();
      selectTile(tile);
    } else {
      console.log("Tile is not accessible!");
    }
  };

  if (tile.isRemoved) {
    return null;
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <group
      ref={meshRef}
      position={[tile.position.x, tile.position.y, tile.position.z]}
      onClick={handleClick}
    >
      <TileModel tile={tile} />
    </group>
  );
}
