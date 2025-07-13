import { allSkills } from './nimble';
import { id } from './random';
import {
	type Alteration,
	type Die,
	type Inventory,
	type MagicSchool,
	type Note,
	type Resource,
	type Save,
	type Skill,
	type Stat,
} from './types';

const SHEET_VERSION = 2;
function serializeCharacter(character: NimbleCharacter) {
	return {
		id: $state.snapshot(character.id),
		type: character.type,
		created: $state.snapshot(character.created),
		touched: $state.snapshot(character.touched),
		version: $state.snapshot(character.version),
		shared: $state.snapshot(character.shared),
		name: $state.snapshot(character.name),
		charClass: $state.snapshot(character.charClass),
		ancestry: $state.snapshot(character.ancestry),
		size: $state.snapshot(character.size),
		level: $state.snapshot(character.level),
		hitdie: $state.snapshot(character.hitdie),
		stats: $state.snapshot(character.stats),
		saveOverride: $state.snapshot(character.saveOverride),
		skills: $state.snapshot(character.skills),
		armor: $state.snapshot(character.armor),
		hp: $state.snapshot(character.hp),
		maxHp: $state.snapshot(character.maxHp),
		tempHp: $state.snapshot(character.tempHp),
		hd: $state.snapshot(character.hd),
		maxHd: $state.snapshot(character.maxHd),
		initiative: $state.snapshot(character.initiative),
		speed: $state.snapshot(character.speed),
		wounds: $state.snapshot(character.wounds),
		gp: $state.snapshot(character.gp),
		sp: $state.snapshot(character.sp),
		mana: $state.snapshot(character.mana),
		extraSchool: $state.snapshot(character.extraSchool),
		inventory: $state.snapshot(character.inventory),
		utilspells: $state.snapshot(character.utilspells),
		resources: $state.snapshot(character.resources),
		notes: $state.snapshot(character.notes),
	};
}

function deserializeCharacter(data: CharacterSave) {
	const newChar = new NimbleCharacter();
	if (data.id) newChar.id = data.id;
	newChar.type = data.type || 'char';
	newChar.created = data.created ?? new Date().toISOString();
	newChar.touched = data.touched ?? new Date().toISOString();
	newChar.version = SHEET_VERSION;
	newChar.shared = data.shared;
	newChar.name = data.name;
	newChar.charClass = data.charClass;
	newChar.ancestry = data.ancestry;
	newChar.size = data.size;
	newChar.level = data.level;
	newChar.hitdie = data.hitdie;
	if (!data.version || data.version < 1.8) {
		newChar.stats = {
			STR: +data.stats.STR,
			DEX: +data.stats.DEX,
			INT: +data.stats.INT,
			//@ts-expect-error Migrate from old structure to new one.
			WIL: Math.max(+data.stats['WIS'], +data.stats['CHA']) || 0,
		};
	} else {
		newChar.stats = data.stats ?? {
			STR: 0,
			DEX: 0,
			INT: 0,
			WIL: 0,
		};
	}
	newChar.saveOverride = data.saveOverride ?? {};
	newChar.skills = data.skills ?? structuredClone(allSkills);
	newChar.armor = +data.armor;
	newChar.hp = +data.hp;
	newChar.maxHp = +data.maxHp;
	newChar.tempHp = +data.tempHp;
	newChar.hd = +data.hd;
	newChar.maxHd = +data.maxHd;
	newChar.initiative = +data.initiative;
	newChar.speed = +data.speed;
	newChar.wounds = data.wounds ?? 0;
	newChar.gp = data.gp ?? 0;
	newChar.sp = data.sp ?? 0;
	newChar.mana = data.mana ?? 0;
	newChar.extraSchool = data.extraSchool;
	newChar.inventory = data.inventory ?? [];
	newChar.utilspells = data.utilspells ?? {};
	newChar.resources = data.resources ?? [];
	newChar.notes =
		typeof data.notes === 'string'
			? [{ name: 'Notes', content: data.notes ?? '' }]
			: (data.notes ?? []);
	return newChar;
}

export class NimbleCharacter {
	id = id();
	type = 'char';
	created = new Date().toISOString();
	touched = new Date().toISOString();
	version = SHEET_VERSION;
	shared: string | undefined = $state();
	name: string = $state('');
	charClass: string = $state('');
	ancestry: string = $state('');
	size: string = $state('');
	level: number = $state(1);
	hitdie: Die | undefined = $state();
	stats: Record<Stat, number> = $state({
		STR: 0,
		DEX: 0,
		INT: 0,
		WIL: 0,
	});
	saveOverride: Partial<Record<Save, Alteration | 0>> = $state({});
	skills: Skill[] = $state(structuredClone(allSkills));
	armor: number = $state(0);
	hp: number = $state(0);
	maxHp: number = $state(0);
	tempHp: number = $state(0);
	hd: number = $state(1);
	maxHd: number = $state(1);
	initiative: number = $state(0);
	speed: number = $state(6);
	wounds: number = $state(0);
	gp: number = $state(0);
	sp: number = $state(0);
	mana: number = $state(0);
	extraSchool: MagicSchool | undefined = $state();
	inventory: Inventory[] = $state([]);
	utilspells: Record<string, boolean> = $state({});
	resources: Resource[] = $state([]);
	notes: Note[] = $state([
		{ name: 'Ancestry', content: '' },
		{ name: 'Background', content: '' },
	]);

	constructor() {}

	toJSON() {
		return serializeCharacter(this);
	}

	static load(save: CharacterSave) {
		return deserializeCharacter(save);
	}
}

export type CharacterSave = ReturnType<typeof serializeCharacter>;
