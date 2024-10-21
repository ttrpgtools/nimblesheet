<script lang="ts">
  import UserPlus from "lucide-svelte/icons/user-plus";
  import Menu from "lucide-svelte/icons/menu";
  import Dice from "lucide-svelte/icons/dices";
  import SheetLogo from "lucide-svelte/icons/square-user-round";
  import Loader from "lucide-svelte/icons/loader-circle";
  import Advantage from "lucide-svelte/icons/smile";
  import Disadvantage from "lucide-svelte/icons/frown";
  import X from "lucide-svelte/icons/x";

  import { Badge } from "./lib/components/ui/badge";
  import { Button } from "./lib/components/ui/button";
  import * as Sheet from "$lib/components/ui/sheet";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import CharacterSheet from "$lib/CharacterSheet.svelte";
  import { NimbleCharacter, type CharacterSave } from "$lib/character.svelte";
  import { Toaster } from "$lib/components/ui/sonner";

  import { Die } from "$lib/dice";
  import { toast } from "svelte-sonner";
  import { loadAllFromDb, loadSingle, persistToIndexedDB } from "$lib/persist";
  import DiceRoll from "$lib/DiceRoll.svelte";

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
    await persistToIndexedDB(mycharacter);
    await loadList();
  }

  let rollModifier = $state(0);
  function simpleRoll(sides: number) {
    //@ts-ignore
    toast(DiceRoll, {componentProps: { formula: `d${sides}`, rollModifier }, class: '![--initial-height:7rem] !bg-gray-200 dark:!bg-gray-800'});
  }

  async function newCharacter() {
    await saveCharacter();
    mycharacter = new NimbleCharacter();
    selectedId = mycharacter.id;
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
    sheetOpen = false;
    isReady = true;
    saveCharacter();
  }

  const MAX_ROLL_MOD = 9;
  function mod(delta: 1 | -1) {
    rollModifier = Math.min(rollModifier + delta, MAX_ROLL_MOD);
  }

  $effect(() => {
    loadCharacter();
    loadList();
  });
</script>
<Toaster richColors duration={10000} closeButton/>
<div class="flex min-h-screen w-full flex-col">
  <header class="bg-background/30 backdrop-blur-md sticky top-0 flex h-16 items-center gap-4 border-b px-4 md:px-6 z-50">
    <nav class="flex-grow gap-5 text-lg font-medium flex flex-row items-center lg:gap-6 w-full">
      <h1 class="flex items-center gap-2 text-lg font-semibold md:text-base">
        <SheetLogo class="h-6 w-6" />
        <span class=" whitespace-nowrap">Nimble CC</span>
			</h1>
    </nav>
		<div class="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild let:builder>
          <div class="relative">
            <Button
              builders={[builder]}
              variant="secondary"
              size="icon"
              class="rounded-full"
            >
              <Dice class="h-5 w-5" />
              <span class="sr-only">Roll dice</span>
            </Button>
            {#if rollModifier !== 0}<Badge variant={rollModifier < 0 ? `destructive` : `default`} class="absolute -right-2 -top-1">{Math.abs(rollModifier)}</Badge>{/if}
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="center">
          <DropdownMenu.Label class="flex justify-between gap-2">
            <div class="relative">
              <Button variant="outline" size="icon" class="rounded-full" onclick={() => mod(1)}><Advantage class="size-6 pointer-events-none"/></Button>
              {#if rollModifier > 0}<Badge variant="destructive" class="absolute -right-2 -top-1">{rollModifier}</Badge>{/if}
            </div>
            <Button variant="outline" size="icon" class="rounded-full" onclick={() => rollModifier = 0}><X class="size-6 pointer-events-none"/></Button>
            <div class="relative">
              <Button variant="outline" size="icon" class="rounded-full" onclick={() => mod(-1)}><Disadvantage class="size-6 pointer-events-none"/></Button>
              {#if rollModifier < 0}<Badge variant="destructive" class="absolute -right-2 -top-1">{Math.abs(rollModifier)}</Badge>{/if}
            </div>
          </DropdownMenu.Label>
          {#each [4, 6, 8, 10, 12, 20, 100] as d}
          <DropdownMenu.Item onclick={() => simpleRoll(d)}>
            <div class="flex gap-3 items-center text-lg">
              <Die which={d} size="size-6" /> d{d}
            </div>
          </DropdownMenu.Item>
          {/each}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
			<Button
				variant="secondary"
				size="icon"
				class="rounded-full"
        onclick={newCharacter}
			>
				<UserPlus class="h-5 w-5" />
				<span class="sr-only">Add new character</span>
			</Button>
    </div>
    <Sheet.Root bind:open={sheetOpen}>
      <Sheet.Trigger asChild let:builder>
        <Button
          variant="outline"
          size="icon"
          class="shrink-0"
          builders={[builder]}
        >
          <Menu class="h-5 w-5" />
          <span class="sr-only">Toggle navigation menu</span>
        </Button>
      </Sheet.Trigger>
      <Sheet.Content side="right">
        <nav class="grid gap-6 text-lg font-medium">
          <h2 class="flex items-center gap-2 text-lg font-semibold">
            <SheetLogo class="h-6 w-6" />
            <span class="">Available Characters</span>
					</h2>
          <ul>
            {#each characters as char}
						<li>
              <Button variant={selectedId === char.id ? `default` : `ghost`} class="w-full" onclick={() => switchTo(char)}>{char.name || 'Unnamed Character'}</Button>
            </li>
            {/each}
          </ul>
        </nav>
      </Sheet.Content>
    </Sheet.Root>
  </header>
  <main class="flex flex-col gap-4 p-4 md:gap-8 md:p-10">
    {#if mycharacter}
    <CharacterSheet bind:character={mycharacter} onchange={saveCharacter} {rollModifier} />
    {:else}
    <div class="min-h-[300px] flex items-center justify-center">
      <Loader class="size-12 animate-spin" />
    </div>
    {/if}
  </main>
</div>

