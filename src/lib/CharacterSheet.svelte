<script lang="ts">
  import ListManager from './ListManager.svelte';

  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Select from "$lib/components/ui/select";
  import type { NimbleCharacter } from "./character.svelte";
  import Droplet from "lucide-svelte/icons/droplet";
  import Skull from "lucide-svelte/icons/skull";
  import Bulky from "lucide-svelte/icons/weight";
  import X from "lucide-svelte/icons/x";
  import CirclePlus from "lucide-svelte/icons/circle-plus";
  import CircleMinus from "lucide-svelte/icons/circle-minus";
  import Dice from "lucide-svelte/icons/dices";

  import { allClasses, stats } from "./nimble";
  import { type NimbleClass } from "./types";
  import { toast } from "svelte-sonner";
  import SpellSelect from "./SpellSelect.svelte";
  import Textarea from "./components/ui/textarea/textarea.svelte";
  import DiceRoll from './DiceRoll.svelte';

  type Props = {
    character: NimbleCharacter;
    onchange: () => void;
    rollModifier: number;
  };
  let { character = $bindable(), onchange, rollModifier } : Props = $props();
  let currentClass: NimbleClass | undefined = $derived(allClasses.find(c => c.name === character.charClass));
  let currentSelected = $derived({value: currentClass, label: currentClass?.name});

  function setClass(ev?: { value: NimbleClass | undefined }) {
    if (ev?.value) {
      if (!character.hitdie || character.hitdie === currentClass?.die) {
        character.hitdie = ev.value.die;
      }
      if (+(character.level) === 1 && (!character.hp || character.hp === '0' || +(character.hp) === currentClass?.startHp)) {
        character.hp = ev.value.startHp.toString();
      }
    }
    character.charClass = ev?.value?.name ?? '';
    onchange();
  }

  let invCount = $derived(character.inventory.reduce((p, c) => p + (c.bulky ? 2 : 1), 0));

  let skillPoints = $derived(character.skills.reduce((p, c) => p + c.extra, 0));

  function onroll(roll: string, label?: string) {
    const context = {
      LVL: +character.level,
      STR: +character.stats.STR,
      DEX: +character.stats.DEX,
      INT: +character.stats.INT,
      WIS: +character.stats.WIS,
      CHA: +character.stats.CHA,
    }
    //toast(`Rolling ${roll}${label ? ` (${label})` : ``} = ${result}`);
    //@ts-ignore
    toast(DiceRoll, {componentProps: { formula: roll, label, context, rollModifier }, class: '![--initial-height:7rem] bg-background'})
  }

</script>
<div class="flex flex-col gap-4 max-w-lg mx-auto" oninput={onchange}>
  <div class="flex gap-2">
    <Label for="charname" class="sr-only">Name</Label>
    <Input id="charname" class="text-2xl h-auto font-bold" type="text" placeholder="Character Name" required bind:value={character.name} />
  </div>
  <Card.Root class="w-full">
    <Card.Content class="grid gap-4">
      
      <div class="flex gap-2">
        <Label for="ancestry" class="sr-only">Ancestry</Label>
        <Input id="ancestry" type="text" placeholder="Ancestry" bind:value={character.ancestry} />
      </div>
      <div class="flex gap-2">
        <div class="flex gap-2 w-full">
          <Label for="charclass" class="sr-only">Class</Label>
          <Select.Root onSelectedChange={setClass} selected={currentSelected}>
            <Select.Trigger class="w-full">
              <Select.Value placeholder="Class" />
            </Select.Trigger>
            <Select.Content>
              {#each allClasses as nc}
              <Select.Item value={nc}>{nc.name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
        <div class="flex gap-2">
          <Label for="level" class="sr-only">Level</Label>
          <Input id="level" placeholder="LVL" type="number" inputmode="numeric" bind:value={character.level} />
        </div>
      </div>
      <div class="flex gap-2">
        <Label for="sizeinfo" class="sr-only">Size</Label>
        <Input id="sizeinfo" type="text" placeholder="Height + Weight" bind:value={character.size} />
      </div>
      <div class="flex gap-2">
        <Label for="hitdie" class="sr-only">Hit Die</Label>
        <Input id="hitdie" type="text" placeholder="Hit Die" bind:value={character.hitdie}/>
      </div>
    </Card.Content>
  </Card.Root>
  <Card.Root>
    <Card.Content class="flex gap-2">
      {#each stats as stat}
        <div class="flex flex-col items-center gap-2">
          <Input class="text-center" type="number" inputmode="numeric" bind:value={character.stats[stat]}/>
          <Label>{stat}</Label>
        </div>
      {/each}
    </Card.Content>
  </Card.Root>
  <Card.Root>
    <Card.Content class="grid gap-2 grid-cols-4">
      <div class="flex flex-col items-center gap-2">
        <Input class="text-center" type="number" inputmode="numeric" bind:value={character.armor}/>
        <Label>Armor</Label>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input class="text-center" type="number" inputmode="numeric" bind:value={character.hp}/>
        <Label>HP</Label>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input class="text-center" type="number" inputmode="numeric" bind:value={character.hd}/>
        <Label>HD</Label>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input class="text-center" type="number" inputmode="numeric" bind:value={character.initiative}/>
        <Label>Init</Label>
      </div>

      <div class="flex flex-col items-center gap-2">
        <Input class="text-center" type="number" inputmode="numeric" bind:value={character.tempHp}/>
        <Label>Temp</Label>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input class="text-center" type="number" inputmode="numeric" bind:value={character.maxHp}/>
        <Label>Max HP</Label>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input class="text-center" type="number" inputmode="numeric" bind:value={character.maxHd}/>
        <Label>Max HD</Label>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input class="text-center" type="number" inputmode="numeric" bind:value={character.speed}/>
        <Label>Speed</Label>
      </div>
    </Card.Content>
  </Card.Root>
  <div class="flex gap-4">
    <Card.Root class="w-full">
      <Card.Content class="grid gap-2">
        {#each character.skills as skill, ind}
        <div class="flex gap-2 items-center">
          <div class="w-full">
            {skill.name} <span class="text-muted-foreground">({skill.type})</span>
          </div>
          <div class="flex gap-2 items-center">
            {+(character.stats[skill.type] ?? '0') + skill.extra}
            <CirclePlus class="size-5" onclick={() => {character.skills[ind].extra += 1; onchange();}} />
            <CircleMinus class="size-5" onclick={() => {character.skills[ind].extra -= 1; onchange();}} />
          </div>
        </div>
        {/each}
        <div class=" border-t pt-3 mt-1 text-sm text-muted-foreground">
          Skill Points allocated: {skillPoints}
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Content class="flex flex-col gap-3">
        <X class="size-5 {character.wounds === 0 ? `text-gray-500` : ``}" onclick={() => {character.wounds = 0; onchange();}}/>
        {#each [1,2,3,4,5] as wnd}
          <Droplet class="size-5 {character.wounds >= wnd ? `text-red-500` : ``}" onclick={() => {character.wounds = wnd; onchange();}}/>
        {/each}
        <Skull class="size-5 {character.wounds >= 6 ? `text-red-500` : ``}" onclick={() => {character.wounds = 6; onchange();}}/>
      </Card.Content>
    </Card.Root>
  </div>

  <Card.Root>
    <Card.Content class="flex gap-4 items-center">
      <Button variant="secondary" disabled={!character.hitdie} onclick={() => character.hitdie && onroll(character.hitdie, `Hit Die`)}>Roll HD</Button>
      <Button variant="secondary" onclick={() => onroll(`d20+[WIS]`, `Initiative`)}>Roll Initiative</Button>
    </Card.Content>
  </Card.Root>

  <ListManager
    bind:list={character.resources}
    title="Resources"
    buttonLabel="Add Resource"
    emptyLabel="No resources."
    initialRow={{name: 'Resource', current: 0, max: 0}}
    {onchange}>
  {#snippet row(res)}
    <Input bind:value={res.name} class="w-full" />
    <Input class="w-12" bind:value={res.current} />
  {/snippet}
  {#snippet deleteAlt(res)}
    <Input class="w-12" bind:value={res.max} />
  {/snippet}
  </ListManager>

  <ListManager
    bind:list={character.inventory}
    title="Inventory"
    buttonLabel="Add Inventory Item"
    emptyLabel="No items."
    initialRow={{name: 'Dagger', roll: 'd4'}}
    {onchange}>
    {#snippet headerExtra()}
    <div class:text-destructive={invCount > (+character.stats.STR + 10)}>({invCount} / {+character.stats.STR + 10})</div>
    {/snippet}
    {#snippet row(item)}
      <div class="relative">
        <Button size="icon" variant="ghost" class="absolute right-0 top-1/2 -translate-y-1/2">
          <Bulky onclick={() => item.bulky = !item.bulky} class=" size-5 {item.bulky ? `` : `text-muted-foreground`}" />
        </Button>
        <Input bind:value={item.name} class="w-full pr-10 {item.bulky ? `font-black underline` : ``}" />
      </div>
      <Input class="w-20 mx-auto" bind:value={item.roll} />
    {/snippet}
    {#snippet deleteAlt(item)}
      {#if item.roll}
        <Button size="icon" variant="ghost">
          <Dice class="size-5" onclick={() => onroll(item.roll, item.name)} />
        </Button>
      {:else}
        <div class="size-10"></div>
      {/if}
    {/snippet}
  </ListManager>

  <SpellSelect charClass={character.charClass} level={+character.level} allowed={currentClass?.magicSchools ?? []} bind:utilspells={character.utilspells} {onroll} />

  <Card.Root>
    <Card.Header>
        <Card.Title class="text-lg">Notes</Card.Title>

    </Card.Header>
    <Card.Content>
      <Textarea rows={5} bind:value={character.notes} />
    </Card.Content>
  </Card.Root>
</div>
