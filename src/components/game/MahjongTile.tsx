/** biome-ignore-all lint/a11y/noStaticElementInteractions: doesn't matter */
import type { ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import type { TileData } from "@/utils/mahjong/types";
import { TileModel } from "./TileModel";

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
		<group
			ref={meshRef}
			position={[tile.position.x, tile.position.y, tile.position.z]}
			onClick={handleClick}
		>
			<TileModel tile={tile} />
		</group>
	);
}
