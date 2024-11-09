import type { Npc } from './npc';
import { clone, loadAllFromDb } from './persist';

/* SAMPLE
{
			id: 'rando',
			type: 'npc',
			name: 'Spiny Fiend',
			created: new Date().toISOString(),
			touched: new Date().toISOString(),
			version: 1,
			level: 4,
			armor: 'medium',
			speed: '30',
			hp: 49,
			maxHp: 49,
			saves: {},
			special: { name: 'Spines', desc: 'Melee attackers take 3 damage.', roll: '' },
			actions: [
				{ name: 'Claws (2x)', desc: '1d6+6 damage', roll: 'd6+6' },
				{ name: 'Shoot Spine', desc: '(Range 60ft) 1d6+6', roll: 'd6+6' },
			],
			actionOptions: 'Choose twice:',
		},
*/
class EncounterManager {
	npcs: Npc[] = $state([]);
	encounter: Npc[] = $state([]);
	#instanceCounts = new Map<string, number>();

	addToEncounter = (npc: Npc) => {
		// Create numbered instance of this npc
		const instance = clone($state.snapshot(npc));
		const nextNum = (this.#instanceCounts.get(npc.name) ?? 0) + 1;
		instance.name = npc.name;
		if (nextNum > 1) {
			instance.name += ` (${nextNum})`;
		}
		instance.hp = instance.maxHp;
		this.#instanceCounts.set(npc.name, nextNum);
		this.encounter.push(instance);
	};

	clear = () => {
		this.encounter = [];
	};

	clearDead = () => {
		this.encounter = this.encounter.filter((x) => x.hp !== 0);
	};

	load = async () => {
		this.npcs = await loadAllFromDb<Npc>('npc');
	};

	initialize = async () => await this.load();
}

export const encounterManager = new EncounterManager();
