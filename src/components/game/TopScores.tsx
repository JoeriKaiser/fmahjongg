import { invoke } from "@tauri-apps/api/core";
import { Trophy } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Score {
	id: number;
	name: string;
	time: number;
	timestamp: number;
}

const ScoreRow = memo(function ScoreRow({
	score,
	index,
}: {
	score: Score;
	index: number;
}) {
	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const medalColors = ["text-yellow-400", "text-slate-300", "text-amber-600"];
	const medalColor = medalColors[index] || "text-slate-500";

	return (
		<div className="flex justify-between items-center text-sm py-1">
			<div className="flex items-center gap-2">
				<span className={`font-bold ${medalColor}`}>{index + 1}.</span>
				<span className="truncate max-w-[120px]">{score.name}</span>
			</div>
			<span className="font-mono text-emerald-400">
				{formatTime(score.time)}
			</span>
		</div>
	);
});

export const TopScores = memo(function TopScores() {
	const [scores, setScores] = useState<Score[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchScores = useCallback(async () => {
		try {
			const topScores = await invoke<Score[]>("get_top_scores", { limit: 5 });
			setScores(topScores);
		} catch (error) {
			console.error("Failed to fetch scores:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchScores();
	}, [fetchScores]);

	return (
		<Card className="w-64 bg-slate-800/90 text-white shadow-xl backdrop-blur-sm">
			<CardHeader className="pb-2">
				<CardTitle className="text-lg font-bold flex items-center gap-2">
					<Trophy className="h-5 w-5 text-yellow-400" />
					Top Scores
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-2">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i + _} className="h-6 w-full bg-slate-700" />
						))}
					</div>
				) : scores.length === 0 ? (
					<p className="text-sm text-slate-400 text-center py-4">
						No scores yet. Be the first!
					</p>
				) : (
					<div className="space-y-1">
						{scores.map((score, index) => (
							<ScoreRow key={score.id} score={score} index={index} />
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
});
