import {
	fireSpells,
	iceSpells,
	lightningSpells,
	necroticSpells,
	radiantSpells,
	secretSpells,
	utilitySpells,
	windSpells,
} from './magic';
import type { Spell } from './types';

export { utilitySpells };

export const standardSpells = [
	...fireSpells,
	...iceSpells,
	...lightningSpells,
	...necroticSpells,
	...radiantSpells,
	...windSpells,
];

export const addableSpells = [...standardSpells, ...secretSpells];
export const builtInSpells = [...addableSpells, ...utilitySpells];

export function contentSlug(value: string) {
	return (
		value
			.normalize('NFKD')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '') || 'untitled'
	);
}

export function builtInSpellId(spell: Spell | string) {
	const name = typeof spell === 'string' ? spell : spell.name;
	return `nimble:spell:${contentSlug(name)}`;
}

export function findBuiltInSpell(reference: string, catalog: Spell[] = builtInSpells) {
	return catalog.find((spell) => spell.name === reference || builtInSpellId(spell) === reference);
}

export function spellReference(spell: Spell) {
	return spell.id ?? builtInSpellId(spell);
}
