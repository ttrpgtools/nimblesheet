<script lang="ts">
  import ListManager from './ListManager.svelte';

  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Popover from "$lib/components/ui/popover";
  import * as Select from "$lib/components/ui/select";
  import type { NimbleCharacter } from "./character.svelte";
  import Droplet from "lucide-svelte/icons/droplet";
  import Skull from "lucide-svelte/icons/skull";
  import Bulky from "lucide-svelte/icons/weight";
  import X from "lucide-svelte/icons/x";
  import CirclePlus from "lucide-svelte/icons/circle-plus";
  import CircleMinus from "lucide-svelte/icons/circle-minus";
  import Dice from "lucide-svelte/icons/dices";
  import Die5 from "lucide-svelte/icons/dice-5";
  import Question from "lucide-svelte/icons/circle-help";

  import { allClasses, stats, saves } from "./nimble";
  import { type Alteration, type NimbleClass, type Save } from "./types";
  import SpellSelect from "./SpellSelect.svelte";
  import Textarea from "./components/ui/textarea/textarea.svelte";
  import Owlbear from './Owlbear.svelte';
  import Caret from './Caret.svelte';
  import Coin from './Coin.svelte';
  import { rollDice } from './dice/integration';

  type Props = {
    character: NimbleCharacter;
    onchange: () => void;
    rollModifier: number;
    owlbearRoom?: string;
  };
  let { character = $bindable(), onchange, rollModifier, owlbearRoom } : Props = $props();
  let currentClass: NimbleClass | undefined = $derived(allClasses.find(c => c.name === character.charClass));
  let currentSelected = $derived({value: currentClass, label: currentClass?.name});

  function setClass(ev?: { value: NimbleClass | undefined }) {
    if (ev?.value) {
      character.hitdie = ev.value.die;
      if (+(character.level) === 1 && (!character.hp || +(character.hp) === currentClass?.startHp)) {
        character.hp = ev.value.startHp;
        character.maxHp = ev.value.startHp;
      }
    }
    character.charClass = ev?.value?.name ?? '';
    onchange();
  }

  let invCount = $derived(character.inventory.reduce((p, c) => p + (c.bulky ? 2 : 1), 0) + Math.ceil((character.gp + character.sp) / 500));

  let skillPoints = $derived(character.skills.reduce((p, c) => p + c.extra, 0));
  let maxSkillPoints = $derived(+(character.level ?? '0') + 3)

  async function onroll(roll: string, label?: string, addMod = 0) {
    const context = {
      LVL: +character.level,
      STR: +character.stats.STR,
      DEX: +character.stats.DEX,
      INT: +character.stats.INT,
      WIL: +character.stats.WIL,
      WIT: Math.max(+character.stats.INT, +character.stats.WIL),
      INIT: Math.max(+character.stats.DEX, +character.initiative),
      KEY: (currentClass?.key ?? []).reduce((p, c) => Math.max(+character.stats[c], p), Number.NEGATIVE_INFINITY),
    }
    return await rollDice(roll, { label, context, rollModifier: rollModifier + addMod, characterName: character.name });
  }
  function autoSel(ev: FocusEvent) {
    const el = ev.target as HTMLInputElement;
    el.select();
  }

  function toggleOwlShare() {
    if (isSharedHere) {
      character.shared = '';
      // Unshare... somehow
    } else {
      character.shared = `owlbear::${owlbearRoom}`;
    }
    onchange();
  }

  let hasSaveOverrides = $derived(Array.from(Object.values(character.saveOverride)).some(v => v != null));
  function toggleSave(save: Save, type: Alteration) {
    const current = character.saveOverride[save] ?? currentClass?.saves[save] ?? 0;
    const next = type === current ? 0 : type;
    character.saveOverride[save] = next === (currentClass?.saves[save] ?? 0) ? undefined : next;
    onchange();
  }

  let isSharedHere = $derived(character.shared === `owlbear::${owlbearRoom}`);
  let actions = $state(0);

  async function rollInitiative() {
    const result = await onroll(`d20+[INIT]`, `Initiative`);
    if (result.value < 10) {
      actions = 1;
    } else if (result.value >= 20 || result.dice[0].isMax()) {
      actions = 3;
    } else {
      actions = 2;
    }
  }
</script>
<div class="flex flex-col sm:gap-4 max-w-lg mx-auto" oninput={onchange}>
  <div class="flex gap-2 items-center mb-4 sm:mb-0">
    <Label for="charname" class="sr-only">Name</Label>
    <Input id="charname" class="text-2xl h-auto font-bold" type="text" placeholder="Character Name" required bind:value={character.name} />
    {#if owlbearRoom}
    <button type="button" onclick={toggleOwlShare}><Owlbear size="size-10 {isSharedHere ? `` : `opacity-30`}"/></button>
    {/if}
  </div>
  <Card.Root>
    <Card.Content class="grid gap-x-2 gap-y-4 grid-cols-3">
      <div class="flex gap-2 col-span-2">
        <Label for="ancestry" class="sr-only">Ancestry</Label>
        <Input id="ancestry" type="text" placeholder="Ancestry" bind:value={character.ancestry} />
      </div>
      <div class="flex gap-2">
        <Label for="sizeinfo" class="sr-only">Size</Label>
        <Input id="sizeinfo" type="text" placeholder="Size" bind:value={character.size} />
      </div>
      <div class="flex gap-2 col-span-2">
        <Label for="charclass" class="sr-only">Class</Label>
        <Select.Root onSelectedChange={setClass} selected={currentSelected}>
          <Select.Trigger class="w-full">
            <Select.Value placeholder="Class" class="text-base" />
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
        <Input id="level" placeholder="LVL" type="number" inputmode="numeric" onfocus={autoSel} bind:value={character.level} />
      </div>
    </Card.Content>
  </Card.Root>
  <Card.Root>
    <Card.Content class="grid grid-cols-4 gap-x-2 relative">
      <Popover.Root>
        <Popover.Trigger class="absolute top-1.5 right-1.5">
          <Question class="size-4" />
        </Popover.Trigger>
        <Popover.Content>
          <p>You can start out with one of the following allocations. Typically you would put the higher numbers in your <strong>KEY</strong> stats (starred).</p>
          <ul class="pl-4 list-disc">
            <li>Standard: +2, +2, +0, -1</li>
            <li>Balanced: +2, +1, +1, +0</li>
            <li>Min-Max: +3, +1, +0, -2</li>
          </ul>
        </Popover.Content>
      </Popover.Root>
      {#each saves as save}
      <button type="button" onclick={() => toggleSave(save, 1)} class="flex justify-center {save === 'WIT' ? `col-span-2` : ``}">
        <Caret size="size-6" dir='up' save={character.saveOverride[save] ?? currentClass?.saves[save] ?? 0} />
      </button>
      {/each}
      {#each stats as stat}
        <div class="flex flex-col items-center gap-2">
          <Input class="text-center" type="number" inputmode="url" min={-10} max={20} onfocus={autoSel} bind:value={character.stats[stat]}/>
          <Label class="{currentClass?.key.includes(stat) ? `font-bold` : ``} ">{stat}{#if currentClass?.key.includes(stat)}*{/if}</Label>
        </div>
      {/each}
      {#each saves as save}
      <button type="button" onclick={() => toggleSave(save, -1)} class="flex justify-center {save === 'WIT' ? `col-span-2` : ``}">
        <Caret size="size-6" dir='down' save={character.saveOverride[save] ?? currentClass?.saves[save] ?? 0} />
      </button>
      {/each}
      {#if hasSaveOverrides}
      <Button onclick={() => {character.saveOverride = {}; onchange();}} variant="outline" size="icon" class="absolute right-1.5 bottom-1.5 border-foreground rounded-full size-4"><X /></Button>
      {/if}
    </Card.Content>
  </Card.Root>
  <Card.Root>
    <Card.Content class="grid gap-2 grid-cols-4">
      <div class="flex flex-col items-center gap-2">
        <Input id="sstat-armor" class="text-center" type="number" inputmode="numeric" onfocus={autoSel} bind:value={character.armor}/>
        <Label for="sstat-armor">Armor</Label>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input id="sstat-hp" class="text-center" type="number" inputmode="numeric" onfocus={autoSel} bind:value={character.hp}/>
        <div class="flex gap-3 items-center">
          <Label for="sstat-hp">HP</Label>
          <button type="button" disabled={!character.hitdie} onclick={() => character.hitdie && onroll(`${character.hitdie}+[STR]`, `Hit Point Increase`)}><Dice class="size-4"/></button>
        </div>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input id="sstat-hd" class="text-center" type="number" inputmode="numeric" onfocus={autoSel} bind:value={character.hd}/>
        <div class="flex gap-3 items-center">
          <Label for="sstat-hd">HD</Label>
          <button type="button" disabled={!character.hitdie} onclick={() => character.hitdie && onroll(character.hitdie, `Hit Die`)}><Dice class="size-4"/></button>
        </div>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input id="sstat-init" class="text-center" type="number" inputmode="numeric" onfocus={autoSel} bind:value={character.initiative}/>
        <div class="flex gap-3 items-center">
          <Label for="sstat-init">Init</Label>
          <button type="button" onclick={rollInitiative}><Dice class="size-4"/></button>
        </div>
      </div>

      <div class="flex flex-col items-center gap-2">
        <Input id="sstat-temp" class="text-center" type="number" inputmode="numeric" onfocus={autoSel} bind:value={character.tempHp}/>
        <Label for="sstat-temp">Temp</Label>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input id="sstat-maxhp" class="text-center" type="number" inputmode="numeric" onfocus={autoSel} bind:value={character.maxHp}/>
        <Label for="sstat-maxhp">Max HP</Label>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input id="sstat-maxhd" class="text-center" type="number" inputmode="numeric" onfocus={autoSel} bind:value={character.maxHd}/>
        <Label for="sstat-maxhd">Max HD</Label>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Input id="sstat-speed" class="text-center" type="number" inputmode="numeric" onfocus={autoSel} bind:value={character.speed}/>
        <Label for="sstat-speed">Speed</Label>
      </div>
    </Card.Content>
  </Card.Root>

  
  <Card.Root>
    <Card.Content class="flex gap-3 items-center">
      <h4 class="font-bold text-lg flex-grow">Save</h4>
      {#each saves as save}
      <Button variant="secondary" size="sm" onclick={() => onroll(`d20+[${save}]`, `${save} Save`, character.saveOverride[save] ?? currentClass?.saves[save] ?? 0)}><Dice class="mr-1 size-4" />{save}</Button>
      {/each}
    </Card.Content>
  </Card.Root>
  
  <Card.Root>
    <Card.Content class="flex gap-4 items-center">
      <h4 class=" font-bold text-lg flex-grow">Actions</h4>
      <X class="size-6 {actions === 0 ? `text-gray-500` : ``}" onclick={() => {actions = 0;}}/>
      {#each [1, 2, 3] as action}
      <button type="button" onclick={() => {actions = action; }} class="size-8 {actions >= action ? `bg-primary text-primary-foreground` : ``} border-2 border-primary rounded-full flex items-center justify-center">{action}</button>
      {/each}
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Content class="flex gap-3 items-center">
      <h4 class="font-bold text-lg flex-grow">Wounds</h4>
      <X class="size-5 {character.wounds === 0 ? `text-gray-500` : ``}" onclick={() => {character.wounds = 0; onchange();}}/>
      {#each [1,2,3,4,5] as wnd}
        <Droplet class="size-5 {character.wounds >= wnd ? `text-red-500` : ``}" onclick={() => {character.wounds = wnd; onchange();}}/>
      {/each}
      <Skull class="size-5 {character.wounds >= 6 ? `text-red-500` : ``}" onclick={() => {character.wounds = 6; onchange();}}/>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Content class="grid">
      {#each character.skills as skill}
      {@const score = +(character.stats[skill.type] ?? '0') + skill.extra}
      <div class="flex gap-2 items-center">
        <div class="w-full">
          {skill.name} <span class="text-muted-foreground">({skill.type})</span>
        </div>
        <div class="flex items-center">
          <span class="px-4">{score}</span>
          <Button variant="ghost" size="icon" class="rounded-full" onclick={() => {skill.extra += 1; onchange();}}>
            <CirclePlus class="size-5" />
          </Button>
          <Button variant="ghost" size="icon" class="rounded-full" disabled={skill.extra === 0} onclick={() => {skill.extra = Math.max(0, skill.extra - 1); onchange();}}>
            <CircleMinus class="size-5" />
          </Button>
          <Button size="icon" variant="ghost">
            <Dice class="size-5" onclick={() => onroll(`d20+${score}`, skill.name)} />
          </Button>
        </div>
      </div>
      {/each}
      <div class="border-t pt-3 mt-1 text-sm {skillPoints > maxSkillPoints ? `text-destructive` : `text-muted-foreground`}">
        Skill Points allocated: {skillPoints} / {maxSkillPoints}
      </div>
    </Card.Content>
  </Card.Root>

  <ListManager
    bind:list={character.resources}
    title="Resources"
    emptyLabel="No resources."
    initialRow={{name: 'Resource', current: 0, max: 0}}
    {onchange}>
  {#snippet row(res)}
    <Input bind:value={res.name} class="w-full" />
    <Input class="w-12 md:w-16" type="number" onfocus={autoSel} bind:value={res.current} />
  {/snippet}
  {#snippet deleteAlt(res)}
    <Input class="w-12 md:w-16" type="number" onfocus={autoSel} bind:value={res.max} />
  {/snippet}
  </ListManager>

  <ListManager
    bind:list={character.inventory}
    title="Inventory"
    emptyLabel="No items."
    initialRow={{name: 'Dagger', roll: 'd4!'}}
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
      <Input class="w-20 md:w-24" bind:value={item.roll} />
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
    {#snippet footerExtra()}
    <div class="flex items-center gap-2">
      <label for="coin-gp"><Coin type="gp" size="size-5" /></label>
      <Input id="coin-gp" class="w-20 md:w-24" type="number" onfocus={autoSel} bind:value={character.gp} />
      <label for="coin-sp"><Coin type="sp" size="size-5"/></label>
      <Input id="coin-sp" class="w-20 md:w-24" type="number" onfocus={autoSel} bind:value={character.sp} />
    </div>
    {/snippet}
  </ListManager>

  <SpellSelect
    charClass={character.charClass}
    level={character.level}
    stats={character.stats}
    allowed={currentClass?.magicSchools ?? []}
    bind:utilspells={character.utilspells}
    bind:extraSchool={character.extraSchool}
    bind:mana={character.mana}
    {onroll} {onchange} />

  <Card.Root>
    <Card.Header>
        <Card.Title class="text-lg">Notes</Card.Title>

    </Card.Header>
    <Card.Content>
      <Textarea rows={5} bind:value={character.notes} />
    </Card.Content>
  </Card.Root>
</div>
