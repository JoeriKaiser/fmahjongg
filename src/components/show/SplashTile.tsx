import { memo } from "react";

export const SplashTile = memo(function SplashTile() {
	return (
		<div
			className="h-full w-full flex items-center justify-center [perspective:600px]"
			aria-hidden="true"
		>
			<div className="splash-tile relative w-24 h-32 rounded-xl bg-[#f7f4ec] border-b-[10px] border-r-[6px] border-[#d6d0c0] shadow-2xl flex items-center justify-center p-3">
				<img
					src="/textures/Regular/Chun.png"
					alt=""
					className="w-full h-full object-contain select-none pointer-events-none"
					draggable={false}
				/>
			</div>
		</div>
	);
});
