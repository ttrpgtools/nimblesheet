import { toast } from 'svelte-sonner';
import { download, downloadViaPopup } from './download';
import { loadAllFromDb } from './persist';

export async function exportCharacters(
	selectedIds: string[],
	type: 'char' | 'npc',
	embedded = false
) {
	const proper = type === 'char' ? 'character' : type;
	const list = await loadAllFromDb(type);
	const selected = selectedIds.length ? list.filter((cs) => selectedIds.includes(cs.id)) : list;
	const payload = JSON.stringify(selected, null, 2);
	if (embedded) {
		downloadViaPopup(payload, `${selectedIds.length ? `selected` : `all`}-nimble-${proper}s.json`);
	} else {
		download(payload, `${selectedIds.length ? `selected` : `all`}-nimble-${proper}s.json`);
	}
	toast.info(
		`Exported ${selectedIds.length ? selectedIds.length : `all`} ${proper}${selectedIds.length === 1 ? `` : `s`}!`
	);
}
