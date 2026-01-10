import { Calendar, Check, Share2, Shuffle } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	getTodayCompletionTime,
	isTodayCompleted,
	shareToClipboard,
} from "@/utils/dailyPuzzle";
import { getPuzzleNumber } from "@/utils/seededRandom";
import { SplashTile } from "../show/SplashTile";
import { DailyStats } from "./DailyStats";

interface DailyHomeProps {
	onStartDaily: () => void;
	onStartRandom: () => void;
}

export const DailyHome = memo(function DailyHome({
	onStartDaily,
	onStartRandom,
}: DailyHomeProps) {
	const puzzleNumber = getPuzzleNumber();
	const isCompleted = isTodayCompleted();
	const completionTime = getTodayCompletionTime();
	const [shareSuccess, setShareSuccess] = useState(false);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const handleShare = async () => {
		const success = await shareToClipboard();
		if (success) {
			setShareSuccess(true);
			setTimeout(() => setShareSuccess(false), 2000);
		}
	};

	return (
		<div
			className="h-screen w-screen overflow-auto"
			style={{ backgroundColor: "#3a4a5a" }}
		>
			<div className="min-h-full w-full flex flex-col items-center justify-center p-4 gap-8">
				<div className="text-white flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
					<h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
						Fast Mahjong
					</h1>
					<p className="text-lg text-slate-300 tracking-wide">
						Daily Puzzle Challenge
					</p>
				</div>

				<div className="w-48 h-48 animate-in fade-in duration-300 delay-75">
					<SplashTile />
				</div>

				<Card className="w-full max-w-md bg-slate-800/90 text-white shadow-xl backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Calendar className="h-5 w-5 text-emerald-400" />
								<span className="text-sm text-slate-300">
									Puzzle #{puzzleNumber}
								</span>
							</div>
							{isCompleted && (
								<div className="flex items-center gap-1 text-emerald-400">
									<Check className="h-4 w-4" />
									<span className="text-sm font-medium">Completed</span>
								</div>
							)}
						</div>

						{isCompleted && completionTime !== null ? (
							<div className="space-y-4">
								<div className="text-center p-4 bg-slate-700/50 rounded-lg">
									<div className="text-sm text-slate-400 mb-1">Your time</div>
									<div className="text-3xl font-bold font-mono text-emerald-400">
										{formatTime(completionTime)}
									</div>
								</div>
								<div className="flex gap-2">
									<Button
										variant="default"
										className="flex-1 bg-blue-600 hover:bg-blue-500 transition-all"
										onClick={handleShare}
									>
										<Share2 className="mr-2 h-4 w-4" />
										{shareSuccess ? "Copied!" : "Share"}
									</Button>
									<Button
										variant="default"
										className="flex-1 bg-slate-600 hover:bg-slate-500 transition-all"
										onClick={onStartDaily}
									>
										View Solution
									</Button>
								</div>
								<div className="text-center text-sm text-slate-400">
									Come back tomorrow for a new puzzle!
								</div>
							</div>
						) : (
							<Button
								variant="default"
								className="w-full bg-emerald-600 hover:bg-emerald-500 transition-all hover:scale-105"
								onClick={onStartDaily}
							>
								<Calendar className="mr-2 h-5 w-5" />
								Play Today's Puzzle
							</Button>
						)}
					</CardContent>
				</Card>

				<div className="animate-in fade-in duration-300 delay-150">
					<DailyStats />
				</div>

				<Button
					variant="outline"
					className="bg-slate-700/50 hover:bg-slate-600/50 text-white border-slate-600 transition-all animate-in fade-in duration-300 delay-200"
					onClick={onStartRandom}
				>
					<Shuffle className="mr-2 h-4 w-4" />
					Play Random Puzzle
				</Button>

				<div className="text-slate-500 text-xs animate-in fade-in duration-300 delay-200">
					New puzzle every day at midnight
				</div>
			</div>
		</div>
	);
});
