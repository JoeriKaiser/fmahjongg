/**
 * Mulberry32 PRNG - Fast, high-quality seeded random number generator
 * Returns numbers in [0, 1) range like Math.random()
 */
export class SeededRandom {
	private state: number;

	constructor(seed: number) {
		this.state = seed;
	}

	/**
	 * Generate next random number in [0, 1) range
	 */
	next(): number {
		this.state += 0x6d2b79f5;
		let t = this.state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	}

	/**
	 * Generate random integer in [min, max) range
	 */
	nextInt(min: number, max: number): number {
		return Math.floor(this.next() * (max - min)) + min;
	}

	/**
	 * Shuffle array using Fisher-Yates with seeded random
	 */
	shuffle<T>(arr: T[]): T[] {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = this.nextInt(0, i + 1);
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}
}

/**
 * Get daily seed from date (YYYY-MM-DD format)
 */
export function getDailySeed(date: Date = new Date()): number {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	// Combine year, month, day into a single seed
	// This ensures consistent seeds for the same date
	return year * 10000 + month * 100 + day;
}

/**
 * Get puzzle number (days since epoch)
 */
export function getPuzzleNumber(date: Date = new Date()): number {
	const epoch = new Date("2024-01-01");
	const diffTime = date.getTime() - epoch.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
	return diffDays + 1;
}

/**
 * Get date string in YYYY-MM-DD format
 */
export function getDateString(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}
