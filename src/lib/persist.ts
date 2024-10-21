import { set, entries, get, setMany } from "idb-keyval";
import type { CharacterSave, NimbleCharacter } from "./character.svelte";

const DEBOUNCE_DELAY = 300; // Adjust the delay as needed

export async function persistToIndexedDB(char: NimbleCharacter) {
  const key = `char:${char.id}`;
  char.touch();
  const value = char.toJSON();
  await set(key, value);
}

/**
 * A generic debounce function that delays the execution of the provided function.
 * @param func The function to debounce.
 * @param wait The delay in milliseconds.
 * @returns A debounced version of the provided function.
 */
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeoutId: number | undefined;
  return function (...args: Parameters<T>) {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Create a debounced version of the persistence function
export const debouncedPersist = debounce(persistToIndexedDB, DEBOUNCE_DELAY);

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
