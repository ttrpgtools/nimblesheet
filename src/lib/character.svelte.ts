import { allClasses, allSkills } from './nimble';
import { id } from './random';
import {
	type Alteration,
	type CharacterClass,
	type Die,
	type Inventory,
	type MagicSchool,
	type MovementSpeed,
	type Note,
	type Resource,
	type Save,
	type Skill,
	type SpellcastingProfile,
	type Stat,
} from './types';

const SHEET_VERSION = 7;

function snapshotClass(preset: (typeof allClasses)[number]): CharacterClass {
	return { ...structuredClone(preset), presetId: preset.id };
}

function customClass(name = ''): CharacterClass {
	return {
		id: name ? 'custom' : 'unconfigured',
		name,
		key: [],
		saves: {},
		startHp: 0,
		magicSchools: [],
	};
}
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
		classConfig: $state.snapshot(character.classConfig),
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
		movementSpeeds: $state.snapshot(character.movementSpeeds),
		maxActions: $state.snapshot(character.maxActions),
		wounds: $state.snapshot(character.wounds),
		maxWounds: $state.snapshot(character.maxWounds),
		gp: $state.snapshot(character.gp),
		sp: $state.snapshot(character.sp),
		mana: $state.snapshot(character.mana),
		spellcasting: $state.snapshot(character.spellcasting),
		inventory: $state.snapshot(character.inventory),
		resources: $state.snapshot(character.resources),
		languages: $state.snapshot(character.languages),
		notes: $state.snapshot(character.notes),
	};
}

function deserializeCharacter(data: CharacterSave) {
	const legacy = data as CharacterSave & {
		extraSchool?: MagicSchool;
		utilspells?: Record<string, boolean>;
	};
	const newChar = new NimbleCharacter();
	if (data.id) newChar.id = data.id;
	newChar.type = data.type || 'char';
	newChar.created = data.created ?? new Date().toISOString();
	newChar.touched = data.touched ?? new Date().toISOString();
	newChar.version = SHEET_VERSION;
	newChar.shared = data.shared;
	newChar.name = data.name;
	const preset = allClasses.find((candidate) => candidate.name === data.charClass);
	newChar.classConfig = data.classConfig
		? structuredClone(data.classConfig)
		: preset
			? snapshotClass(preset)
			: customClass(data.charClass);
	newChar.classConfig.die ??= data.hitdie;
	newChar.charClass = newChar.classConfig.name;
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
	newChar.skills = (data.skills ?? structuredClone(allSkills)).map((skill) => ({
		...skill,
		bonus: skill.bonus ?? 0,
	}));
	newChar.armor = +data.armor;
	newChar.hp = +data.hp;
	newChar.maxHp = +data.maxHp;
	newChar.tempHp = +data.tempHp;
	newChar.hd = +data.hd;
	newChar.maxHd = +data.maxHd;
	newChar.initiative = +data.initiative;
	newChar.speed = +data.speed;
	newChar.movementSpeeds = data.movementSpeeds ?? [];
	newChar.maxActions = data.maxActions ?? 3;
	newChar.wounds = data.wounds ?? 0;
	newChar.maxWounds = data.maxWounds ?? 6;
	newChar.gp = data.gp ?? 0;
	newChar.sp = data.sp ?? 0;
	newChar.mana = data.mana ?? 0;
	if (data.spellcasting) {
		newChar.spellcasting = {
			schools: data.spellcasting.schools,
			tier: data.spellcasting.tier,
			maxMana: data.spellcasting.maxMana,
			keyStat: data.spellcasting.keyStat,
			customSchools: data.spellcasting.customSchools ?? [],
			utilitySpells: data.spellcasting.utilitySpells ?? [],
			addedSpells: data.spellcasting.addedSpells ?? [],
			excludedSpells: data.spellcasting.excludedSpells ?? [],
			customSpells: (data.spellcasting.customSpells ?? []).map((spell) => ({
				...spell,
				id: spell.id ?? `user:spell:${id()}`,
			})),
		};
	} else {
		const classSchools = allClasses.find((c) => c.name === data.charClass)?.magicSchools ?? [];
		newChar.spellcasting = {
			schools: legacy.extraSchool ? [...new Set([...classSchools, legacy.extraSchool])] : undefined,
			utilitySpells: Object.entries(legacy.utilspells ?? {})
				.filter(([, known]) => known)
				.map(([name]) => name),
			customSchools: [],
			addedSpells: [],
			excludedSpells: [],
			customSpells: [],
		};
	}
	newChar.inventory = data.inventory ?? [];
	newChar.resources = data.resources ?? [];
	newChar.languages = data.languages ?? ['Common'];
	newChar.notes =
		typeof data.notes === 'string'
			? [{ name: 'Notes', content: data.notes ?? '', rolls: [] }]
			: // @ts-expect-error It doesn't know that rolls might be undefined.
				(data.notes?.map((n) => ({ rolls: [], ...n })) ?? []);
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
	classConfig: CharacterClass = $state(customClass());
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
	movementSpeeds: MovementSpeed[] = $state([]);
	maxActions: number = $state(3);
	wounds: number = $state(0);
	maxWounds: number = $state(6);
	gp: number = $state(0);
	sp: number = $state(0);
	mana: number = $state(0);
	spellcasting: SpellcastingProfile = $state({
		customSchools: [],
		utilitySpells: [],
		addedSpells: [],
		excludedSpells: [],
		customSpells: [],
	});
	inventory: Inventory[] = $state([]);
	resources: Resource[] = $state([]);
	languages: string[] = $state(['Common']);
	notes: Note[] = $state([
		{ name: 'Ancestry', content: '', rolls: [] },
		{ name: 'Background', content: '', rolls: [] },
	]);

	constructor() {}

	toJSON() {
		return serializeCharacter(this);
	}

	static load(save: CharacterSave) {
		// Saves can come from deeply reactive collections (for example, the
		// Owlbear shared-sheet list). Unwrap their proxies before migration,
		// since structuredClone cannot clone a Proxy.
		return deserializeCharacter($state.snapshot(save));
	}
}

export type CharacterSave = ReturnType<typeof serializeCharacter>;
