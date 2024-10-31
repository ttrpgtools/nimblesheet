<script lang="ts">
	import UserPlus from 'lucide-svelte/icons/user-plus';
	import Menu from 'lucide-svelte/icons/menu';
	import Dice from 'lucide-svelte/icons/dices';
	import SheetLogo from 'lucide-svelte/icons/square-user-round';
	import Loader from 'lucide-svelte/icons/loader-circle';
	import Advantage from 'lucide-svelte/icons/smile';
	import Disadvantage from 'lucide-svelte/icons/frown';
  import Duplicate from 'lucide-svelte/icons/copy';
	import X from 'lucide-svelte/icons/x';
	import Export from 'lucide-svelte/icons/download';
	import Import from 'lucide-svelte/icons/upload';

	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import * as Sheet from '$lib/components/ui/sheet';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import CharacterSheet from '$lib/CharacterSheet.svelte';
	import { NimbleCharacter, type CharacterSave } from '$lib/character.svelte';
	import { Toaster } from '$lib/components/ui/sonner';

	import { Die } from '$lib/dice';
	import { toast } from 'svelte-sonner';
	import {
		deleteCharacters,
		loadAllFromDb,
		loadSingle,
		persistList,
		persistToIndexedDB
	} from '$lib/persist';
	import { download } from '$lib/download';
	import Trash from 'lucide-svelte/icons/trash-2';
	import ConfirmButton from '$lib/ConfirmButton.svelte';

	import OBR from '@owlbear-rodeo/sdk';
	import type { Player } from '@owlbear-rodeo/sdk/lib/types/Player';
	import { rollDice } from '$lib/dice/integration';

	let mycharacter: NimbleCharacter | undefined = $state(); // = new NimbleCharacter();
	let characters: CharacterSave[] = $state([]); //[mycharacter];
	let selectedId = $state('');
	let isReady = $state(false);

	async function loadList() {
		characters = await loadAllFromDb();
	}

	async function loadCharacter() {
		const mostRecent = (await loadAllFromDb()).at(0);
		if (mostRecent) {
			selectedId = mostRecent.id;
			mycharacter = NimbleCharacter.load(mostRecent);
		} else {
			mycharacter = new NimbleCharacter();
			selectedId = mycharacter.id;
		}
		isReady = true;
	}

	async function saveCharacter() {
		if (!isReady || !mycharacter) return;
		if (mycharacter.shared === `owlbear::${owlbearRoom}`) {
			// handle various integrations? Owlbear for now
			OBR.player.setMetadata({
				'tools.ttrpg.nimblesheet/sheets': {
					[mycharacter.id]: mycharacter.toJSON()
				}
			});
		}
		await persistToIndexedDB(mycharacter);
		await loadList();
	}

	let rollModifier = $state(0);
	async function simpleRoll(sides: number) {
		return await rollDice(`d${sides}`, { rollModifier, characterName: mycharacter?.name });
	}

	async function newCharacter() {
		await saveCharacter();
		mycharacter = new NimbleCharacter();
		selectedId = mycharacter.id;
		isReady = true;
	}

	let sheetOpen = $state(false);
	async function switchTo(char: CharacterSave) {
		if (selectedId === char.id) return;
		isReady = false;
		const data = await loadSingle(char.id);
		if (data) {
			selectedId = data.id;
			mycharacter = NimbleCharacter.load(data);
		}
		isReady = true;
		saveCharacter();
	}

	async function switchToRemote(char: CharacterSave) {
		if (selectedId === char.id) return;
		isReady = false;
		if (char) {
			selectedId = char.id;
			mycharacter = NimbleCharacter.load(char);
		}
	}

	const MAX_ROLL_MOD = 9;
	function mod(delta: 1 | -1) {
		rollModifier = Math.min(rollModifier + delta, MAX_ROLL_MOD);
	}

	async function exportCharacters() {
		const list = await loadAllFromDb();
		const selected = selectedCharacterIds.length
			? list.filter((cs) => selectedCharacterIds.includes(cs.id))
			: list;
		const payload = JSON.stringify(selected, null, 2);
		download(payload, `${selectedCharacterIds.length ? `selected` : `all`}-nimble-characters.json`);
		toast.info(
			`Exported ${selectedCharacterIds.length ? selectedCharacterIds.length : `all`} character${selectedCharacterIds.length === 1 ? `` : `s`}!`
		);
	}
  
  async function duplicate() {
    if (!mycharacter) return;
    await saveCharacter();
    const clone = mycharacter.clone();
    selectedId = clone.id;
    mycharacter = clone;
    saveCharacter();
  }

	async function deleteSelected() {
		const reselect = selectedCharacterIds.includes(selectedId);
		await deleteCharacters(selectedCharacterIds);
		selectedCharacterIds = [];
		await loadList();
		if (reselect) {
			if (characters.length) {
				await switchTo(characters[0]);
			} else {
				mycharacter = new NimbleCharacter();
				selectedId = mycharacter.id;
			}
		}
	}

	let toOverwrite: NimbleCharacter[] = $state([]);
	let incomingList: NimbleCharacter[] = $state([]);
	let showAlert = $state(false);
	let files: FileList | undefined = $state();
	let uploader: HTMLInputElement;
	async function handOff(ev: ProgressEvent<FileReader>) {
		const content = ev.target?.result;
		try {
			if (typeof content !== 'string') return;
			const list: unknown = JSON.parse(content);
			if (!Array.isArray(list) || (list.length && typeof list[0] !== 'object')) {
				toast.warning('Invalid file format.');
				return;
			}
			incomingList = list.map((sheet) => NimbleCharacter.load(sheet));
			const currentIds = new Set(characters.map((c) => c.id));
			toOverwrite = incomingList.filter((incoming) => currentIds.has(incoming.id));
			if (toOverwrite.length) {
				showAlert = true;
			} else {
				await doSaveUpload();
			}
			uploader.value = '';
		} catch {
			toast.warning('Could not load characters from file.');
		}
	}
	function gotFiles() {
		if (!files) return;
		for (let fi = 0; fi < files.length; fi += 1) {
			const file = files[fi];
			if (file.type !== 'application/json') {
				continue;
			}
			const reader = new FileReader();
			reader.addEventListener('load', handOff, { once: true });
			reader.readAsText(file);
		}
	}
	async function importFromFile() {
		if (uploader) uploader.click();
	}
	async function doSaveUpload() {
		await persistList(incomingList);
		toast.info(`Imported ${incomingList.length} character${incomingList.length === 1 ? `` : `s`}`);
		incomingList = [];
		toOverwrite = [];
		await loadList();
	}

	let selectedCharacterIds: string[] = $state([]);
	function toggleAll() {
		if (selectedCharacterIds.length === characters.length) {
			selectedCharacterIds = [];
		} else {
			selectedCharacterIds = characters.map((c) => c.id);
		}
	}
	let owlbearRoom = $state('');
	let owlbearRole: '' | 'GM' | 'PLAYER' = $state('');
	let partyCharacters: CharacterSave[] = $state([]);
	let partyPlayers: Record<string, Player> = $state({});
	function extractPlayerSheets(party: Player[]) {
		partyCharacters = [];
		if (owlbearRole === 'GM') {
			for (const player of party) {
				const sheets = player.metadata['tools.ttrpg.nimblesheet/sheets'] as
					| Record<string, CharacterSave>
					| undefined;
				if (sheets) {
					for (const sheet of Object.values(sheets)) {
						partyCharacters.push(sheet);
						partyPlayers[sheet.id] = player;
					}
				}
			}
		}
	}

	async function loadOwlbear() {
		OBR.onReady(async () => {
			owlbearRoom = OBR.room.id;
			owlbearRole = await OBR.player.getRole();
			if (owlbearRole === 'GM') {
				const party = await OBR.party.getPlayers();
				extractPlayerSheets(party);
			}
			OBR.player.onChange(async (player) => {
				owlbearRole = player.role;
			});
			OBR.party.onChange(async (party) => {
				extractPlayerSheets(party);
			});
		});
	}

	$effect(() => {
		if (OBR.isAvailable) loadOwlbear();
	});

	$effect(() => {
		loadCharacter();
		loadList();
	});

	let topPos = $state(0);
	let pageTitle = $derived(mycharacter != null && topPos > 75 ? mycharacter.name : `Nimble CC`);
</script>

<svelte:head>
	<title>{mycharacter?.name || 'Nimble CC'}</title>
</svelte:head>
<svelte:window bind:scrollY={topPos} />
<Toaster richColors duration={10000} closeButton />
<div class="flex min-h-screen w-full flex-col">
	<header
		class="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/30 px-4 backdrop-blur-md md:px-6"
	>
		<nav class="flex w-full flex-grow flex-row items-center gap-5 text-lg font-medium lg:gap-6">
			<h1 class="flex items-center gap-2 text-lg font-semibold md:text-base">
				<SheetLogo class="h-6 w-6" />
				<span class=" whitespace-nowrap">{pageTitle}</span>
			</h1>
		</nav>
		<div class="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<div class="relative">
						<Button variant="secondary" size="icon" class="rounded-full">
							<Dice class="h-5 w-5" />
							<span class="sr-only">Roll dice</span>
						</Button>
						{#if rollModifier !== 0}<Badge
								variant={rollModifier < 0 ? `destructive` : `default`}
								class="absolute -right-2 -top-1">{Math.abs(rollModifier)}</Badge
							>{/if}
					</div>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="center">
					<DropdownMenu.Label class="flex justify-between gap-2">
						<div class="relative">
							<Button variant="outline" size="icon" class="rounded-full" onclick={() => mod(1)}
								><Advantage class="pointer-events-none size-6" /></Button
							>
							{#if rollModifier > 0}<Badge variant="destructive" class="absolute -right-2 -top-1"
									>{rollModifier}</Badge
								>{/if}
						</div>
						<Button
							variant="outline"
							size="icon"
							class="rounded-full"
							onclick={() => (rollModifier = 0)}><X class="pointer-events-none size-6" /></Button
						>
						<div class="relative">
							<Button variant="outline" size="icon" class="rounded-full" onclick={() => mod(-1)}
								><Disadvantage class="pointer-events-none size-6" /></Button
							>
							{#if rollModifier < 0}<Badge variant="destructive" class="absolute -right-2 -top-1"
									>{Math.abs(rollModifier)}</Badge
								>{/if}
						</div>
					</DropdownMenu.Label>
					{#each [4, 6, 8, 10, 12, 20, 100] as d}
						<DropdownMenu.Item onclick={() => simpleRoll(d)}>
							<div class="flex items-center gap-3 text-lg">
								<Die which={d} size="size-6" /> d{d}
							</div>
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
		<Sheet.Root bind:open={sheetOpen}>
			<Sheet.Trigger>
				<Button variant="outline" size="icon" class="shrink-0">
					<Menu class="h-5 w-5" />
					<span class="sr-only">Toggle navigation menu</span>
				</Button>
			</Sheet.Trigger>
			<Sheet.Content side="right" class="flex flex-col gap-4">
				<Sheet.Header class="flex flex-row items-center justify-between space-y-0">
					<Sheet.Title class="flex items-center gap-2 text-lg font-semibold">
						<SheetLogo class="h-6 w-6" />
						<span class="">Characters</span>
					</Sheet.Title>
					<Button
						variant="secondary"
						size="icon"
						class="rounded-full"
						onclick={() => {
							newCharacter();
							sheetOpen = false;
						}}
					>
						<UserPlus class="pointer-events-none h-5 w-5" />
						<span class="sr-only">Add new character</span>
					</Button>
				</Sheet.Header>
				{#if characters.length}
					<nav class="-mx-2 flex-grow">
						<label class="-mt-3 flex items-center gap-4 p-3 text-muted-foreground">
							<input
								type="checkbox"
								class="size-4"
								checked={selectedCharacterIds.length === characters.length}
								indeterminate={selectedCharacterIds.length > 0 &&
									selectedCharacterIds.length < characters.length}
								onchange={toggleAll}
							/>
							<span class="text-sm">Select All</span>
						</label>
						<ul>
							{#each characters as char}
								<li>
									<Button
										variant={selectedId === char.id ? `outline` : `ghost`}
										class="w-full justify-start gap-1 border-gray-500 p-0"
										onclick={() => {
											switchTo(char);
											sheetOpen = false;
										}}
									>
										<label class="flex size-10 items-center justify-center">
											<span class="sr-only">Select {char.name}</span>
											<input
												type="checkbox"
												class="size-4"
												value={char.id}
												bind:group={selectedCharacterIds}
											/>
										</label>
										{char.name || 'Unnamed Character'}
									</Button>
								</li>
							{/each}
						</ul>
						{#if partyCharacters.length}
							<ul class="mt-3 border-t pt-3">
								{#if owlbearRole === 'GM'}
									<li class="px-3 py-1 font-bold">Owlbear Rodeo Characters</li>
								{/if}
								{#each partyCharacters as char}
									<li>
										<Button
											variant={selectedId === char.id ? `outline` : `ghost`}
											class="w-full justify-start gap-1 border-gray-500 px-3"
											onclick={() => {
												switchToRemote(char);
												sheetOpen = false;
											}}
										>
											{char.name || 'Unnamed Character'} ({partyPlayers[char.id].name})
										</Button>
									</li>
								{/each}
							</ul>
						{/if}
					</nav>
				{:else}
					<div class="flex-grow">
						<div
							class="rounded-lg border-4 border-dashed p-8 text-center italic text-muted-foreground"
						>
							No characters created. Close this and start editing, or import from a saved file
							below.
						</div>
					</div>
				{/if}
				<Sheet.Footer class="flex flex-col flex-wrap gap-2 sm:flex-col sm:space-x-0">
					{#if selectedCharacterIds.length > 0}
						<ConfirmButton
							onconfirm={deleteSelected}
							confirmText={`Click again to confirm deleting ${selectedCharacterIds.length} character${selectedCharacterIds.length === 1 ? `` : `s`}.`}
							><Trash class="mr-2 size-4" />Delete Selected</ConfirmButton
						>
          {/if}
          {#if selectedId}
            <Button variant="secondary" onclick={duplicate}>
              <Duplicate class="mr-2 size-4" />
              Duplicate Current
            </Button>
					{/if}
					{#if characters.length > 0}
						<Button variant="secondary" onclick={exportCharacters}
							><Export class="mr-2 size-4" />Export {selectedCharacterIds.length
								? `Selected`
								: `All`}</Button
						>
					{/if}
					<Button variant="secondary" onclick={importFromFile}
						><Import class="mr-2 size-4" />Import from file</Button
					>
					<input
						type="file"
						class="sr-only"
						bind:files
						bind:this={uploader}
						onchange={gotFiles}
						accept=".json"
					/>
				</Sheet.Footer>
			</Sheet.Content>
		</Sheet.Root>
		<AlertDialog.Root bind:open={showAlert}>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Overwriting Characters</AlertDialog.Title>
					<AlertDialog.Description>
						The following {toOverwrite.length} character{toOverwrite.length === 1 ? `` : `s`} will be
						overwritten by the data from the uploaded file.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<ul class="flex flex-col gap-1 pl-8">
					{#each toOverwrite as osheet}
						<li class="list-disc">{osheet.name || 'Unnamed Character'}</li>
					{/each}
				</ul>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action onclick={doSaveUpload}>Overwrite</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</header>
	<main class="flex flex-col gap-4 p-4 md:gap-8 md:p-10">
		{#if mycharacter}
			<CharacterSheet
				bind:character={mycharacter}
				onchange={saveCharacter}
				{rollModifier}
				{owlbearRoom}
			/>
		{:else}
			<div class="flex min-h-[300px] items-center justify-center">
				<Loader class="size-12 animate-spin" />
			</div>
		{/if}
	</main>
</div>
