import { id } from './random';
import type { Save, Alteration } from './types';

type NpcEffect = { name: string; desc: string; roll: string };
export type Npc = {
	id: string;
	type: 'npc';
	name: string;
	created: string;
	touched: string;
	version: 1;
	level: number;
	armor: string;
	speed: string;
	hp: number;
	maxHp: number;
	special: NpcEffect;
	actionOptions?: string;
	actions: NpcEffect[];
	saves: Partial<Record<Save, Alteration | 0>>;
	bloodied?: NpcEffect;
	lastStand?: NpcEffect;
	subtitle?: string;
};

export function createBlankNpc() {
	return {
		id: id(),
		type: 'npc',
		name: '',
		created: new Date().toISOString(),
		touched: new Date().toISOString(),
		version: 1,
		level: 1,
		armor: 'none',
		speed: '6',
		hp: 10,
		maxHp: 10,
		actions: [],
		saves: {},
		special: { name: '', desc: '', roll: '' },
	} satisfies Npc;
}
