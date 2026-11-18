import { Calendar, Check, Play, Share2, Shuffle } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSavedGameSummary } from "@/store/gameStore";
import {
	getTodayCompletionTime,
	isTodayCompleted,
	shareToClipboard,
} from "@/utils/dailyPuzzle";
import {
	getDailyLayout,
	LAYOUT_LIST,
	LAYOUTS,
	type LayoutId,
} from "@/utils/mahjong/layout/layouts";
import { getPuzzleNumber } from "@/utils/seededRandom";
import { SplashTile } from "../show/SplashTile";
import { DailyStats } from "./DailyStats";

interface DailyHomeProps {
	onStartDaily: (forceRestart?: boolean) => void;
	onStartRandom: (layoutId: LayoutId) => void;
	onResumeSaved: () => void;
}

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const DailyHome = memo(function DailyHome({
	onStartDaily,
	onStartRandom,
	onResumeSaved,
}: DailyHomeProps) {
	const puzzleNumber = getPuzzleNumber();
	const dailyLayout = getDailyLayout(puzzleNumber);
	const isCompleted = isTodayCompleted();
	const completionTime = getTodayCompletionTime();
	const savedGame = getSavedGameSummary();
	const [selectedLayout, setSelectedLayout] = useState<LayoutId>("turtle");
	const [shareStatus, setShareStatus] = useState("");

	const hasSavedDaily = savedGame?.isDailyMode === true;
	const hasSavedRandom = savedGame !== null && !savedGame.isDailyMode;

	const handleShare = async () => {
		const success = await shareToClipboard();
		if (success) {
			setShareStatus("Result copied to clipboard");
			setTimeout(() => setShareStatus(""), 2500);
		}
	};

	return (
		<div className="min-h-dvh w-full bg-background overflow-y-auto">
			<div className="min-h-dvh w-full flex flex-col items-center justify-center px-4 py-8 gap-6">
				<header className="text-white flex flex-col items-center gap-2 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 duration-300">
					<h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-[-0.02em] text-balance bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
						Fast Mahjong
					</h1>
					<p className="text-base text-slate-200 text-pretty">
						Daily puzzle challenge
					</p>
				</header>

				<div className="w-36 h-36">
					<SplashTile />
				</div>

				<Card className="w-full max-w-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 duration-300">
					<CardContent className="pt-5">
						<div className="flex items-center justify-between gap-2 mb-4">
							<div className="flex items-center gap-2">
								<Calendar
									className="h-5 w-5 text-emerald-400 shrink-0"
									aria-hidden="true"
								/>
								<h2 className="text-sm font-medium text-slate-200">
									Daily #{puzzleNumber} ({dailyLayout.name})
								</h2>
							</div>
							{isCompleted && (
								<div className="flex items-center gap-1 text-emerald-300">
									<Check className="h-4 w-4" aria-hidden="true" />
									<span className="text-sm font-medium">Completed</span>
								</div>
							)}
						</div>

						{isCompleted && completionTime !== null && !hasSavedDaily ? (
							<div className="space-y-4">
								<div className="text-center p-4 bg-slate-700/50 rounded-lg">
									<div className="text-sm text-slate-300 mb-1">
										Completion time
									</div>
									<div className="text-3xl font-bold font-mono tabular-nums text-emerald-300">
										{formatTime(completionTime)}
									</div>
								</div>
								<div className="flex gap-2">
									<Button
										variant="default"
										className="flex-1"
										onClick={handleShare}
									>
										<Share2 aria-hidden="true" />
										{shareStatus ? "Copied" : "Share result"}
									</Button>
									<Button
										variant="secondary"
										className="flex-1"
										onClick={() => onStartDaily(true)}
									>
										Replay
									</Button>
								</div>
								<p className="text-center text-sm text-slate-300 text-pretty">
									Come back tomorrow for a new daily puzzle.
								</p>
							</div>
						) : hasSavedDaily && savedGame ? (
							<div className="space-y-2">
								<Button
									variant="default"
									className="w-full"
									onClick={onResumeSaved}
								>
									<Play aria-hidden="true" />
									Resume today's puzzle ({savedGame.remainingTiles} left)
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="w-full"
									onClick={() => onStartDaily(true)}
								>
									Start over
								</Button>
							</div>
						) : (
							<Button
								variant="default"
								className="w-full"
								onClick={() => onStartDaily(false)}
							>
								<Calendar aria-hidden="true" />
								Play today's puzzle
							</Button>
						)}
					</CardContent>
				</Card>

				<div className="w-full max-w-md">
					<DailyStats />
				</div>

				<section
					aria-label="Practice mode"
					className="w-full max-w-md flex flex-col items-center gap-3"
				>
					<fieldset className="inline-flex gap-1 bg-card/90 p-1 rounded-[10px] border border-slate-700/80">
						<legend className="sr-only">Random puzzle layout</legend>
						{LAYOUT_LIST.map((layout) => {
							const active = selectedLayout === layout.id;
							return (
								<button
									key={layout.id}
									type="button"
									aria-pressed={active}
									onClick={() => setSelectedLayout(layout.id)}
									className={`min-h-9 px-3 py-1.5 rounded-md text-xs font-medium transition-[color,background-color,transform] duration-150 ease-out motion-safe:active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
										active
											? "bg-primary text-white"
											: "text-slate-200 hover:text-white hover:bg-slate-700/60"
									}`}
								>
									{layout.name}
								</button>
							);
						})}
					</fieldset>

					<div className="flex gap-2 flex-wrap justify-center">
						<Button
							variant="outline"
							onClick={() => onStartRandom(selectedLayout)}
						>
							<Shuffle aria-hidden="true" />
							Play random ({LAYOUTS[selectedLayout].name})
						</Button>

						{hasSavedRandom && savedGame && (
							<Button variant="secondary" onClick={onResumeSaved}>
								<Play aria-hidden="true" />
								Resume {LAYOUTS[savedGame.layoutId].name} (
								{savedGame.remainingTiles} left)
							</Button>
						)}
					</div>
				</section>

				<p className="text-slate-300 text-xs">New daily puzzle at midnight</p>

				<output aria-live="polite" className="sr-only">
					{shareStatus}
				</output>
			</div>
		</div>
	);
});
