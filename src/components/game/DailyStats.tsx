import { Calendar, Flame, Trophy } from "lucide-react";
import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyStats } from "@/utils/dailyPuzzle";

export const DailyStats = memo(function DailyStats() {
	const stats = getDailyStats();

	const statItems = [
		{
			icon: Flame,
			label: "Current Streak",
			value: stats.currentStreak,
			color: "text-orange-400",
		},
		{
			icon: Trophy,
			label: "Max Streak",
			value: stats.maxStreak,
			color: "text-yellow-400",
		},
		{
			icon: Calendar,
			label: "Completed",
			value: stats.totalCompleted,
			color: "text-emerald-400",
		},
	];

	return (
		<Card className="w-full max-w-md bg-slate-800/90 text-white shadow-xl backdrop-blur-sm">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg font-bold">Your Stats</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-3 gap-4">
					{statItems.map(({ icon: Icon, label, value, color }) => (
						<div key={label} className="flex flex-col items-center gap-2">
							<Icon className={`h-6 w-6 ${color}`} />
							<div className="text-2xl font-bold font-mono">{value}</div>
							<div className="text-xs text-slate-400 text-center">{label}</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
});
