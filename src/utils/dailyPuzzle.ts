import { getDateString, getPuzzleNumber } from "./seededRandom";

export interface DailyStats {
	totalCompleted: number;
	currentStreak: number;
	maxStreak: number;
	completedDates: string[]; // Array of YYYY-MM-DD strings
	lastPlayedDate: string | null;
}

export interface DailyPuzzleCompletion {
	date: string;
	puzzleNumber: number;
	time: number;
	completedAt: number; // timestamp
}

const STATS_KEY = "fmahjongg-daily-stats";
const COMPLETION_KEY = "fmahjongg-daily-completions";

/**
 * Get user's daily puzzle statistics
 */
export function getDailyStats(): DailyStats {
	const stored = localStorage.getItem(STATS_KEY);
	if (!stored) {
		return {
			totalCompleted: 0,
			currentStreak: 0,
			maxStreak: 0,
			completedDates: [],
			lastPlayedDate: null,
		};
	}
	return JSON.parse(stored);
}

/**
 * Save daily puzzle statistics
 */
export function saveDailyStats(stats: DailyStats): void {
	localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

/**
 * Get all completions
 */
export function getCompletions(): DailyPuzzleCompletion[] {
	const stored = localStorage.getItem(COMPLETION_KEY);
	if (!stored) return [];
	return JSON.parse(stored);
}

/**
 * Save completions
 */
export function saveCompletions(completions: DailyPuzzleCompletion[]): void {
	localStorage.setItem(COMPLETION_KEY, JSON.stringify(completions));
}

/**
 * Check if today's puzzle is completed
 */
export function isTodayCompleted(): boolean {
	const today = getDateString();
	const stats = getDailyStats();
	return stats.completedDates.includes(today);
}

/**
 * Get completion for specific date
 */
export function getCompletionForDate(
	date: string,
): DailyPuzzleCompletion | null {
	const completions = getCompletions();
	return completions.find((c) => c.date === date) || null;
}

/**
 * Calculate streak from completed dates
 */
function calculateStreak(completedDates: string[]): {
	current: number;
	max: number;
} {
	if (completedDates.length === 0) {
		return { current: 0, max: 0 };
	}

	// Sort dates in descending order
	const sorted = [...completedDates].sort((a, b) => b.localeCompare(a));

	let currentStreak = 0;
	let maxStreak = 0;
	let streakCount = 0;

	const today = getDateString();
	const yesterday = getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

	// Check if streak is alive (today or yesterday completed)
	if (sorted[0] === today || sorted[0] === yesterday) {
		streakCount = 1;

		// Count consecutive days
		for (let i = 1; i < sorted.length; i++) {
			const currentDate = new Date(sorted[i - 1]);
			const prevDate = new Date(sorted[i]);
			const diffTime = currentDate.getTime() - prevDate.getTime();
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays === 1) {
				streakCount++;
			} else {
				break;
			}
		}
		currentStreak = streakCount;
	}

	// Calculate max streak
	streakCount = 1;
	for (let i = 1; i < sorted.length; i++) {
		const currentDate = new Date(sorted[i - 1]);
		const prevDate = new Date(sorted[i]);
		const diffTime = currentDate.getTime() - prevDate.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) {
			streakCount++;
			maxStreak = Math.max(maxStreak, streakCount);
		} else {
			streakCount = 1;
		}
	}

	maxStreak = Math.max(maxStreak, currentStreak, 1);

	return { current: currentStreak, max: maxStreak };
}

/**
 * Record puzzle completion
 */
export function recordCompletion(time: number): void {
	const today = getDateString();
	const puzzleNumber = getPuzzleNumber();

	// Don't record if already completed today
	if (isTodayCompleted()) {
		return;
	}

	// Add new completion
	const completions = getCompletions();
	completions.push({
		date: today,
		puzzleNumber,
		time,
		completedAt: Date.now(),
	});
	saveCompletions(completions);

	// Update stats
	const stats = getDailyStats();
	stats.completedDates.push(today);
	stats.totalCompleted++;
	stats.lastPlayedDate = today;

	const { current, max } = calculateStreak(stats.completedDates);
	stats.currentStreak = current;
	stats.maxStreak = max;

	saveDailyStats(stats);
}

/**
 * Get today's completion time (if completed)
 */
export function getTodayCompletionTime(): number | null {
	const today = getDateString();
	const completion = getCompletionForDate(today);
	return completion?.time || null;
}

/**
 * Generate share text for today's puzzle
 */
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

	return `Fast Mahjong #${puzzleNumber}\n⏱️ ${timeStr}\n🔥 ${stats.currentStreak} day streak\n\nPlay at: [Your URL Here]`;
}

/**
 * Copy share text to clipboard
 */
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
