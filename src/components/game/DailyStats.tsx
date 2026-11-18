import { Calendar, Flame, Trophy } from "lucide-react";
import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyStats } from "@/utils/dailyPuzzle";

export const DailyStats = memo(function DailyStats() {
	const stats = getDailyStats();

	const statItems = [
		{
			icon: Flame,
			label: "Current streak",
			value: stats.currentStreak,
			color: "text-orange-400",
		},
		{
			icon: Trophy,
			label: "Max streak",
			value: stats.maxStreak,
			color: "text-amber-300",
		},
		{
			icon: Calendar,
			label: "Completed",
			value: stats.totalCompleted,
			color: "text-emerald-400",
		},
	];

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="pb-3">
				<CardTitle>Daily stats</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-3 gap-4">
					{statItems.map(({ icon: Icon, label, value, color }) => (
						<div key={label} className="flex flex-col items-center gap-1.5">
							<Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
							<div className="text-2xl font-bold font-mono tabular-nums">
								{value}
							</div>
							<div className="text-xs text-slate-300 text-center">{label}</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
});
