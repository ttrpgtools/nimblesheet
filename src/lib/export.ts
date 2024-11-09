import { toast } from 'svelte-sonner';
import { download } from './download';
import { loadAllFromDb } from './persist';

export async function exportCharacters(selectedIds: string[], type: 'char' | 'npc') {
	const proper = type === 'char' ? 'character' : type;
	const list = await loadAllFromDb(type);
	const selected = selectedIds.length ? list.filter((cs) => selectedIds.includes(cs.id)) : list;
	const payload = JSON.stringify(selected, null, 2);
	download(payload, `${selectedIds.length ? `selected` : `all`}-nimble-${proper}s.json`);
	toast.info(
		`Exported ${selectedIds.length ? selectedIds.length : `all`} ${proper}${selectedIds.length === 1 ? `` : `s`}!`
	);
}
