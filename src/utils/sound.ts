const MUTE_STORAGE_KEY = "fmahjongg-sound-muted";

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	if (!audioContext) {
		const Ctx =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext?: typeof AudioContext })
				.webkitAudioContext;
		if (!Ctx) return null;
		audioContext = new Ctx();
	}
	if (audioContext.state === "suspended") {
		audioContext.resume().catch(() => {});
	}
	return audioContext;
}

export function getInitialSoundMuted(): boolean {
	try {
		return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
	} catch {
		return false;
	}
}

export function persistSoundMuted(muted: boolean): void {
	try {
		localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
	} catch {}
}

function playTone(
	frequency: number,
	duration: number,
	gainLevel: number,
	type: OscillatorType = "triangle",
	delay = 0,
): void {
	const ctx = getAudioContext();
	if (!ctx) return;

	const start = ctx.currentTime + delay;
	const osc = ctx.createOscillator();
	const gain = ctx.createGain();

	osc.type = type;
	osc.frequency.setValueAtTime(frequency, start);
	osc.frequency.exponentialRampToValueAtTime(
		Math.max(40, frequency * 0.72),
		start + duration,
	);

	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.linearRampToValueAtTime(gainLevel, start + 0.004);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

	osc.connect(gain);
	gain.connect(ctx.destination);

	osc.start(start);
	osc.stop(start + duration + 0.01);
}

export function playSelectSound(muted: boolean): void {
	if (muted) return;
	playTone(620, 0.045, 0.09, "triangle");
}

export function playBlockedSound(muted: boolean): void {
	if (muted) return;
	playTone(170, 0.06, 0.07, "sine");
}

export function playMatchSound(muted: boolean): void {
	if (muted) return;
	playTone(540, 0.055, 0.1, "triangle", 0);
	playTone(810, 0.09, 0.11, "triangle", 0.045);
}

export function playWinSound(muted: boolean): void {
	if (muted) return;
	playTone(523.25, 0.14, 0.11, "triangle", 0);
	playTone(659.25, 0.14, 0.11, "triangle", 0.1);
	playTone(783.99, 0.22, 0.12, "triangle", 0.2);
}
