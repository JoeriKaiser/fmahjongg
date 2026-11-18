import { getDateString, getPuzzleNumber } from "./seededRandom";

export interface DailyStats {
	totalCompleted: number;
	currentStreak: number;
	maxStreak: number;
	completedDates: string[];
	lastPlayedDate: string | null;
}

export interface DailyPuzzleCompletion {
	date: string;
	puzzleNumber: number;
	time: number;
	completedAt: number;
}

const STATS_KEY = "fmahjongg-daily-stats";
const COMPLETION_KEY = "fmahjongg-daily-completions";
const MS_PER_DAY = 86_400_000;

function dateStringToDayIndex(dateStr: string): number {
	const [year, month, day] = dateStr.split("-").map(Number);
	return Math.floor(Date.UTC(year, month - 1, day) / MS_PER_DAY);
}

const DEFAULT_STATS: DailyStats = {
	totalCompleted: 0,
	currentStreak: 0,
	maxStreak: 0,
	completedDates: [],
	lastPlayedDate: null,
};

export function getDailyStats(): DailyStats {
	try {
		const stored = localStorage.getItem(STATS_KEY);
		if (!stored) return { ...DEFAULT_STATS, completedDates: [] };
		return JSON.parse(stored) as DailyStats;
	} catch {
		return { ...DEFAULT_STATS, completedDates: [] };
	}
}

export function saveDailyStats(stats: DailyStats): void {
	localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getCompletions(): DailyPuzzleCompletion[] {
	try {
		const stored = localStorage.getItem(COMPLETION_KEY);
		if (!stored) return [];
		const parsed = JSON.parse(stored) as DailyPuzzleCompletion[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function saveCompletions(completions: DailyPuzzleCompletion[]): void {
	localStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));
}

export function isTodayCompleted(): boolean {
	const today = getDateString();
	const stats = getDailyStats();
	return stats.completedDates.includes(today);
}

export function getCompletionForDate(
	date: string,
): DailyPuzzleCompletion | null {
	const completions = getCompletions();
	return completions.find((c) => c.date === date) || null;
}

export function calculateStreak(
	completedDates: string[],
	todayDate: Date = new Date(),
): {
	current: number;
	max: number;
} {
	if (completedDates.length === 0) {
		return { current: 0, max: 0 };
	}

	const uniqueDays = Array.from(
		new Set(completedDates.map(dateStringToDayIndex)),
	).sort((a, b) => b - a);

	const todayDay = dateStringToDayIndex(getDateString(todayDate));
	const yesterdayDay = todayDay - 1;

	let currentStreak = 0;
	if (uniqueDays[0] === todayDay || uniqueDays[0] === yesterdayDay) {
		currentStreak = 1;
		for (let i = 1; i < uniqueDays.length; i++) {
			if (uniqueDays[i - 1] - uniqueDays[i] === 1) {
				currentStreak++;
			} else {
				break;
			}
		}
	}

	let maxStreak = 1;
	let runLength = 1;
	for (let i = 1; i < uniqueDays.length; i++) {
		if (uniqueDays[i - 1] - uniqueDays[i] === 1) {
			runLength++;
			if (runLength > maxStreak) {
				maxStreak = runLength;
			}
		} else {
			runLength = 1;
		}
	}

	return { current: currentStreak, max: Math.max(maxStreak, currentStreak) };
}

export function recordCompletion(time: number): void {
	const today = getDateString();
	const puzzleNumber = getPuzzleNumber();

	if (isTodayCompleted()) {
		return;
	}

	const completions = getCompletions();
	completions.push({
		date: today,
		puzzleNumber,
		time,
		completedAt: Date.now(),
	});
	saveCompletions(completions);

	const stats = getDailyStats();
	stats.completedDates.push(today);
	stats.totalCompleted++;
	stats.lastPlayedDate = today;

	const { current, max } = calculateStreak(stats.completedDates);
	stats.currentStreak = current;
	stats.maxStreak = max;

	saveDailyStats(stats);
}

export function getTodayCompletionTime(): number | null {
	const today = getDateString();
	const completion = getCompletionForDate(today);
	return completion?.time ?? null;
}

export function generateShareText(): string {
	const today = getDateString();
	const completion = getCompletionForDate(today);
	const puzzleNumber = getPuzzleNumber();

	if (!completion) {
		return "";
	}

	const mins = Math.floor(completion.time / 60);
	const secs = completion.time % 60;
	const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

	const stats = getDailyStats();
	const url =
		typeof window !== "undefined" && window.location?.origin
			? window.location.origin
			: "";

	const urlLine = url ? `\n\nPlay at: ${url}` : "";

	return `Fast Mahjong #${puzzleNumber}\n⏱️ ${timeStr}\n🔥 ${stats.currentStreak} day streak${urlLine}`;
}

export async function shareToClipboard(): Promise<boolean> {
	try {
		const shareText = generateShareText();
		await navigator.clipboard.writeText(shareText);
		return true;
	} catch (error) {
		console.error("Failed to copy to clipboard:", error);
		return false;
	}
}
