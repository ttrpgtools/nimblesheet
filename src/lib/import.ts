import { toast } from 'svelte-sonner';
import type { Action } from 'svelte/action';
import { on } from 'svelte/events';

class JsonArrayImporter<T> {
	onComplete: (incoming: T[]) => void = () => {};
	#uploader: HTMLInputElement | undefined;

	#handOff = async (ev: ProgressEvent<FileReader>) => {
		const content = ev.target?.result;
		try {
			if (typeof content !== 'string') return;
			const list: unknown = JSON.parse(content);
			if (!Array.isArray(list) || (list.length && typeof list[0] !== 'object')) {
				toast.warning('Invalid file format.');
				return;
			}
			const incomingList: T[] = list;
			if (incomingList.length === 0) {
				toast.warning(`There were no characters to import.`);
			}
			if (this.#uploader) {
				this.#uploader.value = '';
			}
			this.onComplete(incomingList);
		} catch {
			toast.warning('Could not load characters from file.');
		}
	};
	gotFiles = () => {
		const files = this.#uploader?.files;
		if (!files) return;
		for (let fi = 0; fi < files.length; fi += 1) {
			const file = files[fi];
			if (file.type !== 'application/json') {
				continue;
			}
			const reader = new FileReader();
			reader.addEventListener('load', this.#handOff, { once: true });
			reader.readAsText(file);
		}
	};
	startImport = () => {
		if (this.#uploader) this.#uploader.click();
	};
	input: Action<HTMLInputElement> = (el) => {
		this.#uploader = el;
		el.accept = '.json';
		el.classList.add('sr-only');
		const destroy = on(el, 'change', this.gotFiles);
		return {
			destroy,
		};
	};
}

export function createImporter<T>(onComplete: JsonArrayImporter<T>['onComplete']) {
	const importer = new JsonArrayImporter<T>();
	if (onComplete) importer.onComplete = onComplete;
	return importer;
}

/*
<input
	type="file"
	class="sr-only"
	bind:files
	bind:this={#uploader}
	onchange={gotFiles}
	accept=".json"
/>
*/
