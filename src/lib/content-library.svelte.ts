import { entries, set } from 'idb-keyval';
import { toast } from 'svelte-sonner';
import { isContentPack } from './content-pack';
import type { ClassTemplate, ContentPack } from './types';

const KEY_PREFIX = 'content-pack:';

export type InstalledClassTemplate = {
	pack: ContentPack;
	template: ClassTemplate;
	selectionId: string;
};

function selectionId(packId: string, templateId: string) {
	return `template-${packId.replaceAll(':', '-')}-${templateId.replaceAll(':', '-')}`;
}

class ContentLibrary {
	packs: ContentPack[] = $state([]);
	#initializing: Promise<void> | undefined;

	get classTemplates(): InstalledClassTemplate[] {
		return this.packs.flatMap((pack) =>
			pack.classes.map((template) => ({
				pack,
				template,
				selectionId: selectionId(pack.id, template.id),
			}))
		);
	}

	initialize = async () => {
		if (this.#initializing) return this.#initializing;
		this.#initializing = (async () => {
			const saved = await entries<string, unknown>();
			this.packs = saved
				.filter(([key, value]) => key.startsWith(KEY_PREFIX) && isContentPack(value))
				.map(([, value]) => structuredClone(value as ContentPack));
		})();
		return this.#initializing;
	};

	savePack = async (pack: ContentPack, notify = true) => {
		await this.initialize();
		const snapshot = structuredClone(pack);
		await set(`${KEY_PREFIX}${pack.id}`, snapshot);
		this.packs = [...this.packs.filter((candidate) => candidate.id !== pack.id), snapshot];
		if (notify) toast.success(`Saved ${pack.metadata.name}.`);
	};

	importPayload = async (payload: unknown) => {
		const candidates = Array.isArray(payload) ? payload : [payload];
		const packs = candidates.filter(isContentPack);
		if (!packs.length || packs.length !== candidates.length) {
			throw new Error('This file is not a supported NimbleSheet content pack.');
		}
		for (const pack of packs) await this.savePack(pack, false);
		const classCount = packs.reduce((total, pack) => total + pack.classes.length, 0);
		toast.success(
			`Imported ${classCount} class template${classCount === 1 ? '' : 's'} from ${packs.length} content pack${packs.length === 1 ? '' : 's'}.`
		);
	};

	importFile = async (file: File) => {
		try {
			await this.importPayload(JSON.parse(await file.text()));
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not import this content pack.');
		}
	};

	findTemplate = (value: string) =>
		this.classTemplates.find((candidate) => candidate.selectionId === value);
}

export const contentLibrary = new ContentLibrary();
