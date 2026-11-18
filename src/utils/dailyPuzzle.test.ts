import { describe, expect, test } from "bun:test";
import { calculateStreak } from "./dailyPuzzle";
import { getPuzzleNumber } from "./seededRandom";

describe("dailyPuzzle streak and puzzle numbering", () => {
	test("maintains streak across DST spring-forward and fall-back transitions", () => {
		const spring = calculateStreak(
			["2026-03-27", "2026-03-28", "2026-03-29", "2026-03-30"],
			new Date(2026, 2, 30),
		);
		expect(spring).toEqual({ current: 4, max: 4 });

		const fall = calculateStreak(
			["2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26"],
			new Date(2026, 9, 26),
		);
		expect(fall).toEqual({ current: 4, max: 4 });
	});

	test("keeps streak alive when played yesterday, resets when a day is missed, and ignores duplicates", () => {
		const yesterdayAlive = calculateStreak(
			["2026-06-01", "2026-06-02", "2026-06-02"],
			new Date(2026, 5, 3),
		);
		expect(yesterdayAlive).toEqual({ current: 2, max: 2 });

		const broken = calculateStreak(
			["2026-06-01", "2026-06-02", "2026-06-03"],
			new Date(2026, 5, 6),
		);
		expect(broken).toEqual({ current: 0, max: 3 });
	});

	test("getPuzzleNumber increments by exactly 1 across DST and leap day", () => {
		expect(getPuzzleNumber(new Date(2024, 0, 1))).toBe(1);
		expect(
			getPuzzleNumber(new Date(2024, 2, 1)) -
				getPuzzleNumber(new Date(2024, 1, 28)),
		).toBe(2);
		expect(
			getPuzzleNumber(new Date(2026, 2, 30)) -
				getPuzzleNumber(new Date(2026, 2, 28)),
		).toBe(2);
		expect(
			getPuzzleNumber(new Date(2026, 9, 26)) -
				getPuzzleNumber(new Date(2026, 9, 24)),
		).toBe(2);
	});
});
