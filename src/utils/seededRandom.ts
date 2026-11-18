const MS_PER_DAY = 86_400_000;
const EPOCH_UTC_MS = Date.UTC(2024, 0, 1);

export class SeededRandom {
	private state: number;

	constructor(seed: number) {
		this.state = seed;
	}

	next(): number {
		this.state += 0x6d2b79f5;
		let t = this.state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	}

	nextInt(min: number, max: number): number {
		return Math.floor(this.next() * (max - min)) + min;
	}

	shuffle<T>(arr: T[]): T[] {
		for (let i = arr.length - 1; i > 0; i--) {
			const j = this.nextInt(0, i + 1);
			[arr[i], arr[j]] = [arr[j], arr[i]];
		}
		return arr;
	}
}

export function getDailySeed(date: Date = new Date()): number {
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();

	return year * 10000 + month * 100 + day;
}

export function getPuzzleNumber(date: Date = new Date()): number {
	const currentUtcMs = Date.UTC(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
	);
	const diffDays = Math.floor((currentUtcMs - EPOCH_UTC_MS) / MS_PER_DAY);
	return diffDays + 1;
}

export function getDateString(date: Date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}
