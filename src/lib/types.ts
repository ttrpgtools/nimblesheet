import type { Component, ComponentType, SvelteComponent } from 'svelte';

export type Stat = 'STR' | 'DEX' | 'INT' | 'WIL';
export type Save = 'STR' | 'DEX' | 'INT' | 'WIL';
export type Alteration = 1 | -1;
export type Die = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
export type Skill = { name: string; type: Stat; extra: number; bonus: number };
export type Resource = { name: string; max: number; current: number };
export type MovementSpeed = { type: string; speed: number };
export type Inventory = { name: string; roll: string; bulky?: boolean };
export type Ancestry = { name: string; size: string };
export type Note = { name: string; content: string; rolls: { name: string; roll: string }[] };

export type MagicSchool = string;
export type MagicSchoolDefinition = { id: MagicSchool; name: string };
export type Spell = {
	id?: string;
	category?: 'utility' | 'secret';
	name: string;
	school: MagicSchool;
	tier: number;
	desc: string;
	actions?: number;
	castingTime?: string;
	roll: string;
	onlyFor?: string;
};

export type SpellcastingProfile = {
	schools?: MagicSchool[];
	tier?: number;
	maxMana?: number;
	keyStat?: Stat;
	customSchools: MagicSchoolDefinition[];
	utilitySpells: string[];
	addedSpells: string[];
	excludedSpells: string[];
	customSpells: Spell[];
};

export interface NimbleClass {
	id: string;
	name: string;
	key: Stat[];
	saves: Partial<Record<Save, Alteration>>;
	die?: Die;
	startHp: number;
	magicSchools?: MagicSchool[];
	spellTierProgression?: 'standard' | 'oathsworn' | 'shadowmancer';
	manaFormula?: {
		stat: Stat;
		statMultiplier: number;
		addLevel: boolean;
		minimumLevel: number;
	};
}

export type CharacterClass = NimbleClass & {
	presetId?: string;
	templateId?: string;
	templatePackId?: string;
};

export type ContentSpell = Spell & { id: string };
export type ClassSpellcastingTemplate = {
	schools?: MagicSchool[];
	keyStat?: Stat;
	utilitySpellIds: string[];
	addedSpellIds: string[];
	excludedSpellIds: string[];
	customSchoolIds: string[];
	customSpellIds: string[];
};
export type ClassTemplate = {
	id: string;
	name: string;
	classConfig: CharacterClass;
	spellcasting: ClassSpellcastingTemplate;
};
export type ContentPack = {
	format: 'nimblesheet-content-pack';
	version: 1;
	id: string;
	metadata: {
		name: string;
		author?: string;
		description?: string;
		created: string;
	};
	classes: ClassTemplate[];
	schools: MagicSchoolDefinition[];
	spells: ContentSpell[];
};

export type Identifiable = { id: string };
export type Named = { name: string };
export type Touchable = { touched: string };
export type Typed = { type: string };
export type Serializable<TOut = unknown> = { toJSON: () => TOut };
export type Persistable = Identifiable & Typed & Touchable;

export type NavItem = {
	label: string;
	icon: Component | ComponentType<SvelteComponent>;
	id: string;
};
