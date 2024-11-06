/* eslint-disable react/no-unknown-property */
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useHelper } from '@react-three/drei'
import { useGameStore } from '@/store/gameStore'
import { MahjongTile } from './MahjongTile'
import { Perf } from "r3f-perf"
import { SpotLightHelper } from 'three'
import { useRef } from 'react'
import { Button } from '../ui/button'

export function MahjongGame() {
  const tiles = useGameStore(state => state.tiles)
  const score = useGameStore(state => state.score)
  const resetGame = useGameStore(state => state.resetGame)

  console.log("TILES", tiles);

  const Lights = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const light = useRef<any>(null)
    useHelper(light, SpotLightHelper, 'cyan')
    return (
      <group>
        <spotLight intensity={20} ref={light} position={[4, 3, 0]} castShadow penumbra={0.2} />
      </group>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        Score: {score}
        <Button onClick={resetGame}>Reset Game</Button>
      </div>
      <Canvas camera={{ position: [0, 10, 10] }}>
        <Lights />
        <OrbitControls />
        <group>
          {tiles.map((tile, index) => (
            <MahjongTile key={`${tile.id}-${index}`} tile={tile} />
          ))}
        </group>
        <Perf />
      </Canvas>
    </div>
  )
}