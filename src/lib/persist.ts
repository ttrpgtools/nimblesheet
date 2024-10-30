import { set, entries, get, setMany, delMany } from 'idb-keyval';
import type { CharacterSave, NimbleCharacter } from './character.svelte';

export async function persistToIndexedDB(char: NimbleCharacter) {
	const key = `char:${char.id}`;
	char.touch();
	const value = char.toJSON();
	await set(key, value);
}

export async function loadAllFromDb() {
	const allChars = await entries<string, CharacterSave>();
	if (!allChars) return [];
	allChars.sort((a, b) => b[1].touched.localeCompare(a[1].touched));
	return allChars.map(([, save]) => save);
}

export async function loadSingle(id: string) {
	const key = `char:${id}`;
	return await get<CharacterSave>(key);
}

export async function persistList(list: NimbleCharacter[]) {
	const entries = list.map<[string, CharacterSave]>((sheet) => {
		sheet.touch();
		return [`char:${sheet.id}`, sheet.toJSON()];
	});
	await setMany(entries);
}

export async function deleteCharacters(ids: string[]) {
	const keys = ids.map((id) => `char:${id}`);
	await delMany(keys);
}
