import { set, entries, get, setMany, delMany } from 'idb-keyval';
import type { Named, Persistable, Touchable } from './types';
import { id } from './random';

function touch(item: Touchable) {
	item.touched = new Date().toISOString();
}

export function clone<T extends Persistable & Named>(item: T) {
	const copy = structuredClone(item);
	copy.id = id();
	copy.name += ' Copy';
	touch(copy);
	return copy;
}

export async function persistToIndexedDB<T extends Persistable>(item: T) {
	const key = `${item.type}:${item.id}`;
	touch(item);
	const value = 'toJSON' in item && typeof item.toJSON === 'function' ? item.toJSON() : item;
	await set(key, value);
}

export async function loadAllFromDb<T extends Persistable>(type: string = 'char') {
	const all = await entries<string, T>();
	if (!all) return [];
	const prefix = `${type}:`;
	const desired = all.filter((x) => x[0].startsWith(prefix)).map(([, saved]) => saved);
	return desired.sort((a, b) => b.touched.localeCompare(a.touched));
}

export async function loadSingle<T extends Persistable>(id: string, type: string = 'char') {
	const key = `${type}:${id}`;
	return await get<T>(key);
}

export async function persistList<T extends Persistable>(list: T[]) {
	const entries = list.map<[string, T]>((item) => {
		touch(item);
		return [
			`${item.type}:${item.id}`,
			'toJSON' in item && typeof item.toJSON === 'function' ? item.toJSON() : item,
		];
	});
	await setMany(entries);
}

export async function deleteIds(ids: string[], type: string = 'char') {
	const keys = ids.map((id) => `${type}:${id}`);
	await delMany(keys);
}
