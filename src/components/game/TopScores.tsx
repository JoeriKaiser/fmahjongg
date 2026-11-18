import { Trophy } from "lucide-react";
import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBestTimes, type LocalScore } from "@/utils/localScores";

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
	month: "short",
	day: "numeric",
});

function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const ScoreRow = memo(function ScoreRow({
	score,
	index,
}: {
	score: LocalScore;
	index: number;
}) {
	const formattedDate = DATE_FORMATTER.format(new Date(score.completedAt));
	const medalColors = ["text-amber-300", "text-slate-200", "text-amber-500"];
	const medalColor = medalColors[index] || "text-slate-400";

	return (
		<li className="flex justify-between items-center text-sm py-1">
			<div className="flex items-center gap-2">
				<span className={`font-bold tabular-nums ${medalColor}`}>
					{index + 1}.
				</span>
				<span className="text-slate-300 text-xs">{formattedDate}</span>
			</div>
			<span className="font-mono tabular-nums text-emerald-400">
				{formatTime(score.time)}
			</span>
		</li>
	);
});

export const TopScores = memo(function TopScores() {
	const scores = useMemo(() => getBestTimes(5), []);

	return (
		<Card className="w-64">
			<CardHeader className="pb-2">
				<CardTitle className="flex items-center gap-2">
					<Trophy className="h-5 w-5 text-amber-300" aria-hidden="true" />
					Best times
				</CardTitle>
			</CardHeader>
			<CardContent>
				{scores.length === 0 ? (
					<p className="text-sm text-slate-300 text-start text-pretty py-2 leading-relaxed">
						No best times yet. Finish a random board to record your fastest
						runs.
					</p>
				) : (
					<ol className="space-y-1">
						{scores.map((score, index) => (
							<ScoreRow key={score.id} score={score} index={index} />
						))}
					</ol>
				)}
			</CardContent>
		</Card>
	);
});
