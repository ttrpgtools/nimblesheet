import { get as getFromIndexedDB, set as setInIndexedDB } from 'idb-keyval';
import { writable } from 'svelte/store';
import type { NimbleRoll } from './rolling';

const STORAGE_KEY = 'dice-roll-history:v1';
export const MAX_ROLL_HISTORY = 200;

export type RollHistoryEntry = {
	id: string;
	rolledAt: string;
	formula: string;
	label?: string;
	characterName?: string;
	result: NimbleRoll;
};

function isHistoryEntry(value: unknown): value is RollHistoryEntry {
	if (!value || typeof value !== 'object') return false;
	const entry = value as Partial<RollHistoryEntry>;
	return (
		typeof entry.id === 'string' &&
		typeof entry.rolledAt === 'string' &&
		typeof entry.formula === 'string' &&
		!!entry.result &&
		typeof entry.result.value === 'number' &&
		Array.isArray(entry.result.dice)
	);
}

function createRollHistory() {
	const { subscribe, set, update } = writable<RollHistoryEntry[]>([]);
	let loadPromise: Promise<void> | undefined;
	let writeQueue = Promise.resolve();

	async function initialize() {
		if (loadPromise) return loadPromise;
		loadPromise = (async () => {
			try {
				const saved = await getFromIndexedDB<unknown>(STORAGE_KEY);
				if (Array.isArray(saved)) {
					set(saved.filter(isHistoryEntry).slice(0, MAX_ROLL_HISTORY));
				}
			} catch (error) {
				console.error('Unable to load dice roll history', error);
			}
		})();
		return loadPromise;
	}

	async function add(entry: RollHistoryEntry) {
		await initialize();
		let snapshot: RollHistoryEntry[] = [];
		update((entries) => {
			snapshot = [entry, ...entries].slice(0, MAX_ROLL_HISTORY);
			return snapshot;
		});

		writeQueue = writeQueue
			.then(() => setInIndexedDB(STORAGE_KEY, snapshot))
			.catch((error) => console.error('Unable to save dice roll history', error));
		await writeQueue;
	}

	return { subscribe, initialize, add };
}

export const rollHistory = createRollHistory();
