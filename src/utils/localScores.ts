export interface LocalScore {
	id: number;
	time: number;
	completedAt: number;
}

const BEST_TIMES_KEY = "fmahjongg-best-times";
const MAX_STORED_SCORES = 20;

export function getBestTimes(limit = 5): LocalScore[] {
	try {
		const stored = localStorage.getItem(BEST_TIMES_KEY);
		if (!stored) return [];
		const parsed = JSON.parse(stored) as LocalScore[];
		if (!Array.isArray(parsed)) return [];
		return parsed.slice(0, limit);
	} catch {
		return [];
	}
}

export function recordRandomTime(timeSeconds: number): LocalScore[] {
	const existing = getBestTimes(MAX_STORED_SCORES);
	const now = Date.now();
	const updated = [
		...existing,
		{ id: now, time: timeSeconds, completedAt: now },
	]
		.sort((a, b) => a.time - b.time)
		.slice(0, MAX_STORED_SCORES);

	localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(updated));
	return updated;
}
