import { type CharacterSave, NimbleCharacter } from './character.svelte';
import { createBlankNpc, type Npc } from './npc';
import {
	clone,
	deleteIds,
	loadAllFromDb,
	loadSingle,
	persistList,
	persistToIndexedDB,
} from './persist';
import type { Named, Persistable } from './types';
import { createImporter } from './import';

class CharacterManager<
	TList extends Persistable & Named,
	TActive extends Persistable & Named = TList,
> {
	list: TList[] = $state([]);
	activeId: string | undefined = $state();
	active: TActive | undefined = $state();
	#activeRemote = false;
	#type: 'char' | 'npc' = 'char';
	#promoter: (base: TList) => TActive = (x) => x as unknown as TActive;
	#factory: () => TActive;

	constructor(type: 'char' | 'npc', factory: () => TActive, promoter?: (base: TList) => TActive) {
		this.#type = type;
		this.#factory = factory;
		if (promoter) this.#promoter = promoter;
	}

	load = async () => {
		this.list = await loadAllFromDb<TList>(this.#type);
	};

	activate = async (id: string) => {
		if (this.activeId === id) return;
		const item = await loadSingle<TList>(id, this.#type);
		if (item) {
			this.activeId = id;
			this.active = this.#promoter(item);
			this.#activeRemote = false;
			await this.saveActive();
		}
	};

	remote = async (data: TList) => {
		if (!data || this.activeId === data.id) return;
		this.activeId = data.id;
		this.active = this.#promoter(data);
		this.#activeRemote = true;
	};

	create = async () => {
		this.saveActive();
		const empty = this.#factory();
		this.active = empty;
		this.activeId = empty.id;
	};

	saveActive = async () => {
		if (!this.active || this.#activeRemote) return;
		await persistToIndexedDB($state.snapshot(this.active));
		await this.load();
	};

	duplicate = async () => {
		if (!this.active) return;
		await this.saveActive();
		const copy = clone(this.active);
		this.activeId = copy.id;
		this.active = copy;
		await this.saveActive();
	};

	delete = async (selectedIds: string[]) => {
		const reselect = !!this.activeId && selectedIds.includes(this.activeId);
		await deleteIds(selectedIds, this.#type);
		await this.load();
		if (reselect) {
			if (this.list.length) {
				await this.activate(this.list[0].id);
			} else {
				this.active = this.#factory();
				this.activeId = this.active.id;
			}
		}
	};

	import = async (
		incoming: TList[],
		confirm?: (list: TList[]) => boolean | PromiseLike<boolean>
	) => {
		const currentIds = new Set(this.list.map((x) => x.id));
		const toOverwrite = incoming.filter((inc) => currentIds.has(inc.id));
		if (toOverwrite.length > 0) {
			console.log(`Check if overwrite ok...`);
			if (confirm && !(await confirm(toOverwrite))) return;
		}
		console.log(`Proceed with import`);
		await persistList(incoming.map(this.#promoter));
		await this.load();
	};

	createImporter = (confirm?: (list: TList[]) => boolean | PromiseLike<boolean>) => {
		return createImporter<TList>((x) => this.import(x, confirm));
	};

	initialize = async () => {
		await this.load();
		const mostRecent = this.list.at(0);
		if (mostRecent) {
			this.activate(mostRecent.id);
		} else {
			this.active = this.#factory();
			this.activeId = this.active.id;
		}
	};
}

export const charManager = new CharacterManager<CharacterSave, NimbleCharacter>(
	'char',
	() => new NimbleCharacter(),
	NimbleCharacter.load
);
export const npcManager = new CharacterManager<Npc>('npc', createBlankNpc);
