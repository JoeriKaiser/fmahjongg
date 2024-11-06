/* eslint-disable react/no-unknown-property */
import { TileData } from '@/utils/layoutGenerator'
import { useGameStore } from '@/store/gameStore'
import { useRef } from 'react'
import { TileModel } from './TileModel'

export function MahjongTile({ tile }: { tile: TileData }) {
  const selectTile = useGameStore(state => state.selectTile)
  const meshRef = useRef(null)
  return (
    <group
      ref={meshRef}
      position={[tile.position.x, tile.position.y, tile.position.z]}
      onClick={() => selectTile(tile)}
      visible={!tile.isRemoved}
    >
      <TileModel tile={tile} />
    </group>
  )
}