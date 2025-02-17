<script lang="ts">
	import { Button, buttonVariants } from './components/ui/button';
	import Warning from '$lib/WarningOverwrite.svelte';

	import SheetLogo from 'lucide-svelte/icons/square-user-round';
	import NpcLogo from 'lucide-svelte/icons/squirrel';
	import Duplicate from 'lucide-svelte/icons/copy';
	import Send from 'lucide-svelte/icons/send';
	import Export from 'lucide-svelte/icons/download';
	import Import from 'lucide-svelte/icons/upload';
	import Trash from 'lucide-svelte/icons/trash-2';
	import Popout from 'lucide-svelte/icons/picture-in-picture-2';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';

	import ConfirmButton from './ConfirmButton.svelte';
	import { exportCharacters } from './export';

	import { charManager, npcManager } from '$lib/character-manager.svelte';
	import Sidebar from './Sidebar.svelte';
	import { owlbear } from './owlbear.svelte';

	type Props = {
		type: 'char' | 'npc';
	};
	let { type }: Props = $props();
	let manager = $derived(type === 'char' ? charManager : npcManager);
	let selectedIds: string[] = $state([]);

	let warning: ReturnType<typeof Warning> | undefined;

	let { input, startImport } = (function () {
		return manager.createImporter(warning?.show);
	})();

	async function handleDelete() {
		await manager.delete(selectedIds);
		selectedIds = [];
	}

	function toggleAll() {
		if (selectedIds.length === manager.list.length) {
			selectedIds = [];
		} else {
			selectedIds = manager.list.map((c) => c.id);
		}
	}

	function popout() {
		owlbear.popout();
	}

	function sendToPlayer(id: string) {
		if (type !== 'char') return;
		const sheet = charManager.list.find((c) => c.id === selectedIds[0]);
		if (!sheet) return;
		console.log(`Send to player`, id, $state.snapshot(sheet));
		owlbear.sendSheetToPlayer($state.snapshot(sheet), id);
	}

	$effect(() => (type === 'char' ? owlbear.onSentSheet(charManager.receive) : () => {}));
</script>

<Sidebar
	title={type === 'char' ? 'Characters' : 'NPCs'}
	onnew={manager.create}
	icon={type === 'char' ? SheetLogo : NpcLogo}
>
	{#snippet children(done)}
		{#if manager.list.length}
			<nav class="-mx-2 grow">
				<label class="-mt-3 flex items-center gap-4 p-3 text-muted-foreground">
					<input
						type="checkbox"
						class="size-4"
						checked={selectedIds.length === manager.list.length}
						indeterminate={selectedIds.length > 0 && selectedIds.length < manager.list.length}
						onchange={toggleAll}
					/>
					<span class="text-sm">Select All</span>
				</label>
				<ul>
					{#each manager.list as char}
						<li>
							<Button
								variant={manager.activeId === char.id ? `outline` : `ghost`}
								class="w-full justify-start gap-1 border-gray-500 p-0"
								onclick={(ev) => {
									if (ev.target instanceof Element && ev.target.nodeName === 'INPUT') {
										return;
									}
									manager.activate(char.id);
									done();
								}}
							>
								<label class="flex size-10 items-center justify-center">
									<span class="sr-only">Select {char.name}</span>
									<input type="checkbox" class="size-4" value={char.id} bind:group={selectedIds} />
								</label>
								{char.name || 'Unnamed Character'}
							</Button>
						</li>
					{/each}
				</ul>
			</nav>
		{:else}
			<div class="grow">
				<div class="rounded-lg border-4 border-dashed p-8 text-center italic text-muted-foreground">
					No characters created. Close this and start editing, or import from a saved file below.
				</div>
			</div>
		{/if}
	{/snippet}
	{#snippet footer()}
		{#if selectedIds.length > 0}
			<ConfirmButton
				onconfirm={handleDelete}
				confirmText={`Click again to confirm deleting ${selectedIds.length} character${selectedIds.length === 1 ? `` : `s`}.`}
				><Trash class="mr-2 size-4" />Delete Selected</ConfirmButton
			>
		{/if}
		{#if manager.activeId}
			<Button variant="secondary" onclick={manager.duplicate}>
				<Duplicate class="mr-2 size-4" />
				Duplicate Current
			</Button>
		{/if}
		{#if manager.list.length > 0}
			<div class="flex items-center gap-2">
				<Button
					variant="secondary"
					class="grow"
					onclick={() => exportCharacters(selectedIds, type)}
					><Export class="mr-2 size-4" />Export {selectedIds.length ? `Selected` : `All`}</Button
				>
				{#if selectedIds.length === 1 && owlbear.role === 'GM'}
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}
							><Send class="size-4" /></DropdownMenu.Trigger
						>
						<DropdownMenu.Content>
							{#each owlbear.party as player}
								<DropdownMenu.Item onclick={() => sendToPlayer(player.id)}
									>{player.name}</DropdownMenu.Item
								>
							{:else}
								<DropdownMenu.Item>No players available</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				{/if}
			</div>
		{/if}
		<Button variant="secondary" onclick={startImport}
			><Import class="mr-2 size-4" />Import from file</Button
		>
		<input type="file" use:input />
		{#if owlbear.embedded}
			<Button variant="secondary" onclick={popout}><Popout class="mr-2 size-4" />Pop out</Button>
		{/if}
	{/snippet}
</Sidebar>

<Warning bind:this={warning} />
