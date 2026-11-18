import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import {
	memo,
	Suspense,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import * as THREE from "three";
import { TileInstances } from "./TileInstances";

const SCENE_BG_COLOR = "#3a4a5a";
const CAMERA_FOV = 55;
const BOARD_HALF_WIDTH = 9.2;
const BOARD_HALF_DEPTH = 7.4;
const CAMERA_DIRECTION = new THREE.Vector3(0, 18, 5).normalize();

function computeCameraPosition(
	width: number,
	height: number,
): [number, number, number] {
	const aspect = Math.max(0.4, width / Math.max(1, height));
	const vFov = THREE.MathUtils.degToRad(CAMERA_FOV) / 2;
	const hFov = Math.atan(Math.tan(vFov) * aspect);

	const padding = width < 640 ? 1.18 : 1.28;
	const distForWidth = (BOARD_HALF_WIDTH * padding) / Math.tan(hFov);
	const distForHeight = (BOARD_HALF_DEPTH * padding) / Math.tan(vFov);
	const distance = Math.max(14, distForWidth, distForHeight);

	return [
		CAMERA_DIRECTION.x * distance,
		CAMERA_DIRECTION.y * distance,
		CAMERA_DIRECTION.z * distance,
	];
}

function ResponsiveCamera() {
	const cameraRef = useRef<THREE.PerspectiveCamera>(null);
	const size = useThree((s) => s.size);
	const invalidate = useThree((s) => s.invalidate);

	const initialPos = computeCameraPosition(size.width, size.height);

	useLayoutEffect(() => {
		const cam = cameraRef.current;
		if (!cam) return;

		const [x, y, z] = computeCameraPosition(size.width, size.height);
		cam.position.set(x, y, z);
		cam.lookAt(0, 0.4, 0);
		cam.updateProjectionMatrix();
		invalidate();
	}, [size.width, size.height, invalidate]);

	return (
		<PerspectiveCamera
			ref={cameraRef}
			makeDefault
			position={initialPos}
			fov={CAMERA_FOV}
			near={0.1}
			far={200}
		/>
	);
}

const GameScene = memo(function GameScene({
	onBoardReady,
}: {
	onBoardReady: () => void;
}) {
	return (
		<>
			<color attach="background" args={[SCENE_BG_COLOR]} />
			<ResponsiveCamera />
			<OrbitControls
				enableDamping
				dampingFactor={0.08}
				enablePan={false}
				enableRotate={false}
				enableZoom
				minDistance={10}
				maxDistance={60}
				target={[0, 0.4, 0]}
			/>

			<ambientLight intensity={0.65} />
			<directionalLight
				position={[14, 18, 6]}
				intensity={0.85}
				castShadow
				shadow-mapSize-width={1024}
				shadow-mapSize-height={1024}
				shadow-camera-far={40}
				shadow-camera-left={-14}
				shadow-camera-right={14}
				shadow-camera-top={12}
				shadow-camera-bottom={-12}
				shadow-bias={-0.0004}
			/>
			<directionalLight position={[-10, 12, -5]} intensity={0.35} />

			<Suspense fallback={null}>
				<TileInstances onReady={onBoardReady} />
			</Suspense>

			<mesh
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, -0.35, 0]}
				receiveShadow
			>
				<planeGeometry args={[100, 100]} />
				<shadowMaterial opacity={0.28} />
			</mesh>
		</>
	);
});

export const GameCanvas = memo(function GameCanvas() {
	const [boardReady, setBoardReady] = useState(false);
	const handleBoardReady = useCallback(() => setBoardReady(true), []);

	return (
		<div className="relative h-full w-full">
			<div
				className={`h-full w-full transition-opacity duration-150 ease-out ${
					boardReady ? "opacity-100" : "opacity-0"
				}`}
			>
				<Canvas
					frameloop="demand"
					shadows="percentage"
					dpr={[1, 1.5]}
					performance={{ min: 0.5 }}
					gl={{
						antialias: true,
						powerPreference: "high-performance",
					}}
					onCreated={({ gl }) => {
						gl.shadowMap.autoUpdate = false;
						gl.shadowMap.needsUpdate = true;
					}}
					className="h-full w-full"
				>
					<GameScene onBoardReady={handleBoardReady} />
				</Canvas>
			</div>
		</div>
	);
});

export default GameCanvas;
