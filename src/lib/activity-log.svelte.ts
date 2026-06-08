import { set, entries as idbEntries, delMany } from 'idb-keyval';
import { id } from './random';
import type { LogEntry, LogRollEntry, LogChangeEntry } from './types';

const LOG_TYPE = 'log';
const MAX_ENTRIES = 500;

class ActivityLog {
	entries: LogEntry[] = $state([]);
	loaded = $state(false);

	async load() {
		if (this.loaded) return;
		const all = await idbEntries<string, LogEntry>();
		const prefix = `${LOG_TYPE}:`;
		const sorted = all
			.filter(([k]) => k.startsWith(prefix))
			.map(([, v]) => v)
			.sort((a, b) => b.touched.localeCompare(a.touched));
		if (sorted.length > MAX_ENTRIES) {
			const removed = sorted.splice(MAX_ENTRIES);
			void delMany(removed.map((e) => `${LOG_TYPE}:${e.id}`));
		}
		this.entries = sorted;
		this.loaded = true;
	}

	logRoll(data: Omit<LogRollEntry, 'id' | 'type' | 'touched' | 'kind'>) {
		const entry: LogRollEntry = {
			id: id(),
			type: LOG_TYPE,
			touched: new Date().toISOString(),
			kind: 'roll',
			...data,
		};
		this.entries.unshift(entry);
		void set(`${LOG_TYPE}:${entry.id}`, entry);
	}

	logChange(data: Omit<LogChangeEntry, 'id' | 'type' | 'touched' | 'kind'>) {
		const entry: LogChangeEntry = {
			id: id(),
			type: LOG_TYPE,
			touched: new Date().toISOString(),
			kind: 'change',
			...data,
		};
		this.entries.unshift(entry);
		void set(`${LOG_TYPE}:${entry.id}`, entry);
	}

	async clear() {
		const keys = this.entries.map((e) => `${LOG_TYPE}:${e.id}`);
		this.entries = [];
		if (keys.length) await delMany(keys);
	}
}

export const activityLog = new ActivityLog();
