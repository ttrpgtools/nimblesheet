import type { Component, ComponentType, SvelteComponent } from 'svelte';

export type Stat = 'STR' | 'DEX' | 'INT' | 'WIL';
export type Save = 'STR' | 'DEX' | 'INT' | 'WIL';
export type Alteration = 1 | -1;
export type Die = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
export type Skill = { name: string; type: Stat; extra: number };
export type Resource = { name: string; max: number; current: number };
export type Inventory = { name: string; roll: string; bulky?: boolean };
export type Ancestry = { name: string; size: string };
export type Note = { name: string; content: string };

export type MagicSchool = 'Fire' | 'Ice' | 'Lightning' | 'Wind' | 'Necrotic' | 'Radiant';
export type Spell = {
	name: string;
	school: MagicSchool;
	tier: number;
	desc: string;
	actions: number;
	roll: string;
	onlyFor?: string;
};

export interface NimbleClass {
	name: string;
	key: Stat[];
	saves: Partial<Record<Save, Alteration>>;
	die: Die;
	startHp: number;
	magicSchools?: MagicSchool[];
}

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
