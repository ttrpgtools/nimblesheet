<script lang="ts">
	import ListManager from './ListManager.svelte';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import type { NimbleCharacter } from './character.svelte';
	import Droplet from 'lucide-svelte/icons/droplet';
	import Skull from 'lucide-svelte/icons/skull';
	import Bulky from 'lucide-svelte/icons/weight';
	import X from 'lucide-svelte/icons/x';
	import CirclePlus from 'lucide-svelte/icons/circle-plus';
	import CircleMinus from 'lucide-svelte/icons/circle-minus';
	import Dice from 'lucide-svelte/icons/dices';
	import Question from 'lucide-svelte/icons/circle-help';

	import { allClasses, stats, saves, ancestries, meleeWeapons, rangedWeapons } from './nimble';
	import {
		type Alteration,
		type Ancestry,
		type Inventory,
		type NimbleClass,
		type Save,
	} from './types';
	import SpellSelect from './SpellSelect.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Owlbear from '$lib/icons/OwlbearIcon.svelte';
	import Caret from '$lib/icons/Caret.svelte';
	import Coin from '$lib/icons/Coin.svelte';
	import { rollDice } from './dice/integration';
	import { owlbear } from './owlbear.svelte';

	type Props = {
		character: NimbleCharacter;
		onchange: () => void;
	};
	let { character = $bindable(), onchange }: Props = $props();
	let currentClass: NimbleClass | undefined = $derived(
		allClasses.find((c) => c.name === character.charClass)
	);

	function setClass() {
		if (currentClass) {
			character.hitdie = currentClass.die;
			if (+character.level === 1 && !character.hp) {
				character.hp = currentClass.startHp;
				character.maxHp = currentClass.startHp;
			}
		}
		onchange();
	}

	let invCount = $derived(
		character.inventory.reduce((p, c) => p + (c.bulky ? 2 : c.name.startsWith('-') ? 0 : 1), 0) +
			Math.ceil((character.gp + character.sp) / 500)
	);

	let skillPoints = $derived(character.skills.reduce((p, c) => p + c.extra, 0));
	let maxSkillPoints = $derived(+(character.level ?? '0') + 3);

	async function onroll(roll: string, label?: string, addMod = 0) {
		const context = {
			LVL: +character.level,
			STR: +character.stats.STR,
			DEX: +character.stats.DEX,
			INT: +character.stats.INT,
			WIL: +character.stats.WIL,
			WIT: Math.max(+character.stats.INT, +character.stats.WIL),
			INIT: Math.max(+character.stats.DEX, +character.initiative),
			KEY: (currentClass?.key ?? []).reduce(
				(p, c) => Math.max(+character.stats[c], p),
				Number.NEGATIVE_INFINITY
			),
		};
		return await rollDice(roll, {
			label,
			context,
			rollModifier: addMod,
			characterName: character.name,
		});
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
			character.shared = `owlbear::${owlbear.room}`;
		}
		onchange();
	}

	let hasSaveOverrides = $derived(
		Array.from(Object.values(character.saveOverride)).some((v) => v != null)
	);
	function toggleSave(save: Save, type: Alteration) {
		const current = character.saveOverride[save] ?? currentClass?.saves[save] ?? 0;
		const next = type === current ? 0 : type;
		character.saveOverride[save] = next === (currentClass?.saves[save] ?? 0) ? undefined : next;
		onchange();
	}

	let isSharedHere = $derived(character.shared === `owlbear::${owlbear.room}`);
	let actions = $state(0);

	async function rollInitiative() {
		const result = await onroll(`d20+[INIT]`, `Initiative`);
		if (result.value < 10) {
			actions = 1;
		} else if (result.value >= 20 || result.isCrit) {
			actions = 3;
		} else {
			actions = 2;
		}
	}

	async function setRace(race: Ancestry) {
		character.ancestry = race.name;
		character.size = race.size;
	}

	const itemPop: [string, Inventory[]][] = [
		['Melee Weapons', meleeWeapons],
		['Ranged Weapons', rangedWeapons],
	];

	async function setItem(orig: Inventory, item: Inventory) {
		orig.name = item.name;
		orig.roll = item.roll;
		orig.bulky = item.bulky;
	}
</script>

<div class="mx-auto flex max-w-lg flex-col sm:gap-4" oninput={onchange}>
	<div class="mb-4 flex items-center gap-2 sm:mb-0">
		<Label for="charname" class="sr-only">Name</Label>
		<Input
			id="charname"
			class="h-auto text-2xl font-bold"
			type="text"
			placeholder="Character Name"
			required
			bind:value={character.name}
		/>
		{#if owlbear.room}
			<button type="button" onclick={toggleOwlShare}
				><Owlbear size="size-10 {isSharedHere ? `` : `opacity-30`}" /></button
			>
		{/if}
	</div>
	<Card.Root>
		<Card.Content class="grid grid-cols-3 gap-x-2 gap-y-4">
			<div class="relative col-span-2 flex gap-2">
				<Label for="ancestry" class="sr-only">Ancestry</Label>
				<Input
					id="ancestry"
					type="text"
					placeholder="Ancestry"
					class="pr-7"
					bind:value={character.ancestry}
				/>
				<Popover.Root>
					<Popover.Trigger class="absolute top-1/2 right-2 -translate-y-1/2">
						<Question class="size-4" />
					</Popover.Trigger>
					<Popover.Content>
						<div class="">
							{#each ancestries as race}
								<button
									type="button"
									onclick={() => setRace(race)}
									class="hover:bg-secondary block w-full text-left text-sm"
									>{race.name} ({race.size})</button
								>
							{/each}
							<a
								href="https://nimblecc.ttrpg.tools/#ancestries"
								target="_blank"
								class="text-blue-500 underline">Click for more details</a
							>
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>
			<div class="flex gap-2">
				<Label for="sizeinfo" class="sr-only">Size</Label>
				<Input id="sizeinfo" type="text" placeholder="Size" bind:value={character.size} />
			</div>
			<div class="col-span-2 flex gap-2">
				<Label for="charclass" class="sr-only">Class</Label>
				<Select.Root type="single" bind:value={character.charClass} onValueChange={setClass}>
					<Select.Trigger class="w-full">
						{character.charClass || `Class`}
					</Select.Trigger>
					<Select.Content>
						{#each allClasses as nc}
							<Select.Item value={nc.name}>{nc.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex gap-2">
				<Label for="level" class="sr-only">Level</Label>
				<Input
					id="level"
					placeholder="LVL"
					type="number"
					inputmode="numeric"
					onfocus={autoSel}
					bind:value={character.level}
				/>
			</div>
		</Card.Content>
	</Card.Root>
	<Card.Root>
		<Card.Content class="relative grid grid-cols-4 gap-x-2">
			<Popover.Root>
				<Popover.Trigger class="absolute top-1.5 right-1.5">
					<Question class="size-4" />
				</Popover.Trigger>
				<Popover.Content>
					<p>
						You can start out with one of the following allocations. Typically you would put the
						higher numbers in your <strong>KEY</strong> stats (starred).
					</p>
					<ul class="list-disc pl-4">
						<li>Standard: +2, +2, +0, -1</li>
						<li>Balanced: +2, +1, +1, +0</li>
						<li>Min-Max: +3, +1, -1, -1</li>
					</ul>
				</Popover.Content>
			</Popover.Root>
			{#each saves as save}
				<button type="button" onclick={() => toggleSave(save, 1)} class="flex justify-center">
					<Caret
						size="size-6"
						dir="up"
						save={character.saveOverride[save] ?? currentClass?.saves[save] ?? 0}
					/>
				</button>
			{/each}
			{#each stats as stat}
				<div class="flex flex-col items-center gap-2">
					<Input
						class="text-center"
						type="number"
						inputmode="url"
						min={-10}
						max={20}
						onfocus={autoSel}
						bind:value={character.stats[stat]}
					/>
					<Label class="{currentClass?.key.includes(stat) ? `font-bold` : ``} "
						>{stat}{#if currentClass?.key.includes(stat)}*{/if}</Label
					>
				</div>
			{/each}
			{#each saves as save}
				<button type="button" onclick={() => toggleSave(save, -1)} class="flex justify-center">
					<Caret
						size="size-6"
						dir="down"
						save={character.saveOverride[save] ?? currentClass?.saves[save] ?? 0}
					/>
				</button>
			{/each}
			{#if hasSaveOverrides}
				<Button
					onclick={() => {
						character.saveOverride = {};
						onchange();
					}}
					variant="outline"
					size="icon"
					class="border-foreground absolute right-1.5 bottom-1.5 size-4 rounded-full"><X /></Button
				>
			{/if}
		</Card.Content>
	</Card.Root>
	<Card.Root>
		<Card.Content class="relative grid grid-cols-4 gap-2">
			<Popover.Root>
				<Popover.Trigger class="absolute top-1.5 right-1.5">
					<Question class="size-4" />
				</Popover.Trigger>
				<Popover.Content>
					<p>You can set these as defaults, but your ancestry may affect values.</p>
					<ul class="list-disc pl-4">
						<li>Armor = DEX</li>
						<li>Init = DEX</li>
						<li>Max HP at Lvl 1 is based on class</li>
						<li>Max HD is your level</li>
						<li>Speed is 6</li>
					</ul>
				</Popover.Content>
			</Popover.Root>
			<div class="flex flex-col items-center gap-2">
				<Input
					id="sstat-armor"
					class="text-center"
					type="number"
					inputmode="numeric"
					onfocus={autoSel}
					bind:value={character.armor}
				/>
				<Label for="sstat-armor">Armor</Label>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Input
					id="sstat-hp"
					class="text-center"
					type="number"
					inputmode="numeric"
					onfocus={autoSel}
					bind:value={character.hp}
				/>
				<div class="flex items-center gap-3">
					<Label for="sstat-hp">HP</Label>
					<button
						type="button"
						disabled={!character.hitdie}
						onclick={() =>
							character.hitdie && onroll(`${character.hitdie}+[STR]`, `Hit Point Increase`)}
						><Dice class="size-4" /></button
					>
				</div>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Input
					id="sstat-hd"
					class="text-center"
					type="number"
					inputmode="numeric"
					onfocus={autoSel}
					bind:value={character.hd}
				/>
				<div class="flex items-center gap-3">
					<Label for="sstat-hd">HD</Label>
					<button
						type="button"
						disabled={!character.hitdie}
						onclick={() => character.hitdie && onroll(character.hitdie, `Hit Die`)}
						><Dice class="size-4" /></button
					>
				</div>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Input
					id="sstat-init"
					class="text-center"
					type="number"
					inputmode="numeric"
					onfocus={autoSel}
					bind:value={character.initiative}
				/>
				<div class="flex items-center gap-3">
					<Label for="sstat-init">Init</Label>
					<button type="button" onclick={rollInitiative}><Dice class="size-4" /></button>
				</div>
			</div>

			<div class="flex flex-col items-center gap-2">
				<Input
					id="sstat-temp"
					class="text-center"
					type="number"
					inputmode="numeric"
					onfocus={autoSel}
					bind:value={character.tempHp}
				/>
				<Label for="sstat-temp">Temp</Label>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Input
					id="sstat-maxhp"
					class="text-center"
					type="number"
					inputmode="numeric"
					onfocus={autoSel}
					bind:value={character.maxHp}
				/>
				<Label for="sstat-maxhp">Max HP</Label>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Input
					id="sstat-maxhd"
					class="text-center"
					type="number"
					inputmode="numeric"
					onfocus={autoSel}
					bind:value={character.maxHd}
				/>
				<Label for="sstat-maxhd">Max HD</Label>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Input
					id="sstat-speed"
					class="text-center"
					type="number"
					inputmode="numeric"
					onfocus={autoSel}
					bind:value={character.speed}
				/>
				<Label for="sstat-speed">Speed</Label>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="flex items-center gap-3">
			<h4 class="grow text-lg font-bold">Save</h4>
			{#each saves as save}
				<Button
					variant="secondary"
					size="sm"
					onclick={() =>
						onroll(
							`d20+[${save}]`,
							`${save} Save`,
							character.saveOverride[save] ?? currentClass?.saves[save] ?? 0
						)}><Dice class="mr-1 size-4" />{save}</Button
				>
			{/each}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="flex items-center gap-4">
			<h4 class=" grow text-lg font-bold">Actions</h4>
			<button
				onclick={() => {
					actions = 0;
				}}
			>
				<X class="size-6 {actions === 0 ? `text-gray-500` : ``}" />
			</button>
			{#each [1, 2, 3] as action}
				<button
					type="button"
					onclick={() => {
						actions = action;
					}}
					class="size-8 {actions >= action
						? `bg-primary text-primary-foreground`
						: ``} border-primary flex items-center justify-center rounded-full border-2"
					>{action}</button
				>
			{/each}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="flex items-center gap-3">
			<h4 class="grow text-lg font-bold">Wounds</h4>
			<button
				type="button"
				onclick={() => {
					character.wounds = 0;
					onchange();
				}}
			>
				<X class="size-5 {character.wounds === 0 ? `text-gray-500` : ``}" />
			</button>
			{#each [1, 2, 3, 4, 5] as wnd}
				<button
					type="button"
					onclick={() => {
						character.wounds = wnd;
						onchange();
					}}
				>
					<Droplet class="size-5 {character.wounds >= wnd ? `text-red-500` : ``}" />
				</button>
			{/each}
			<button
				type="button"
				onclick={() => {
					character.wounds = 6;
					onchange();
				}}
			>
				<Skull class="size-5 {character.wounds >= 6 ? `text-red-500` : ``}" />
			</button>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="grid">
			{#each character.skills as skill}
				{@const score = +(character.stats[skill.type] ?? '0') + skill.extra}
				<div class="flex items-center gap-2">
					<div class="w-full">
						{skill.name} <span class="text-muted-foreground">({skill.type})</span>
					</div>
					<div class="flex items-center">
						<span class="px-4">{score}</span>
						<Button
							variant="ghost"
							size="icon"
							class="rounded-full"
							disabled={score === 12}
							onclick={() => {
								skill.extra += 1;
								onchange();
							}}
						>
							<CirclePlus class="size-5" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							class="rounded-full"
							disabled={skill.extra === 0}
							onclick={() => {
								skill.extra = Math.max(0, skill.extra - 1);
								onchange();
							}}
						>
							<CircleMinus class="size-5" />
						</Button>
						<Button size="icon" variant="ghost" onclick={() => onroll(`d20+${score}`, skill.name)}>
							<Dice class="size-5" />
						</Button>
					</div>
				</div>
			{/each}
			<div
				class="relative mt-1 border-t pt-3 text-sm {skillPoints > maxSkillPoints
					? `text-destructive`
					: `text-muted-foreground`}"
			>
				Skill Points allocated: {skillPoints} / {maxSkillPoints}
				<Popover.Root>
					<Popover.Trigger class="absolute right-1.5 bottom-1">
						<Question class="size-4" />
					</Popover.Trigger>
					<Popover.Content>
						<p>
							You can assign extra skill points, spreading your initial 4 points over 3 skills. At
							each level you get one more, and can move one.
						</p>
					</Popover.Content>
				</Popover.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<ListManager
		bind:list={character.inventory}
		title="Inventory"
		emptyLabel="No items."
		initialRow={{ name: 'Dagger', roll: 'd4!' }}
		{onchange}
	>
		{#snippet helpText()}
			<p>
				Track the things you are carrying. Up to 500 coins count as one item. If you want to be able
				to roll damage (or whatever else) for an item, you can add a roll formula to the second box.
				The formula works like this: <code>XdYM+Z</code> where <code>X</code> is the number of dice,
				<code>Y</code>
				is the number of sides, <code>M</code> is <code>!</code> (exploding) and/or <code>v</code>
				(vicious) and
				<code>Z</code>
				is a constant. If you want to reference a stat, you can add it in square brackets (like
				<code>[STR]</code>). Most damage rolls are exploding, so don't forget to add the
				<code>!</code>
				symbol.
			</p>
			<p class="mt-2">
				So <code>1d4!v+[DEX]</code> rolls a d4 with exploding crits and vicious damage, adding your Dexterity
				modifier.
			</p>
		{/snippet}
		{#snippet headerExtra()}
			<div class:text-destructive={invCount > +character.stats.STR + 10}>
				({invCount} / {+character.stats.STR + 10})
			</div>
		{/snippet}
		{#snippet row(item, delBtn)}
			<div class="relative">
				<Button
					size="icon"
					variant="ghost"
					onclick={() => (item.bulky = !item.bulky)}
					class="absolute top-1/2 right-0 -translate-y-1/2"
				>
					<Bulky class=" size-5 {item.bulky ? `` : `text-muted-foreground`}" />
				</Button>
				<Input
					bind:value={item.name}
					class="w-full pr-10 {item.name.length === 0 ? 'pl-8' : ''} {item.bulky
						? `font-black underline`
						: ``}"
				/>
				{#if item.name.length === 0}
					<Popover.Root>
						<Popover.Trigger class="absolute top-1/2 left-2 -translate-y-1/2">
							<Question class="size-4" />
						</Popover.Trigger>
						<Popover.Content>
							<div class="">
								{#each itemPop as [name, items]}
									<div class="">
										<div class="border-b">{name}</div>
										{#each items as inv}
											<button
												type="button"
												onclick={() => setItem(item, inv)}
												class="hover:bg-secondary block w-full px-1 text-left text-sm"
												>{inv.name}</button
											>
										{/each}
									</div>
								{/each}
								<a
									href="https://nimblecc.ttrpg.tools/#melee-weapons"
									target="_blank"
									class="text-blue-500 underline">Click for more details</a
								>
							</div>
						</Popover.Content>
					</Popover.Root>
				{/if}
			</div>
			<Input class="w-20 md:w-24" bind:value={item.roll} />
			{@render delBtn()}
		{/snippet}
		{#snippet deleteAlt(item)}
			{#if item.roll}
				<Button
					size="icon"
					variant="ghost"
					onclick={() => onroll(item.roll, item.name.replace(/^-/, ''))}
				>
					<Dice class="size-5" />
				</Button>
			{:else}
				<div class="size-10"></div>
			{/if}
		{/snippet}
		{#snippet footerExtra()}
			<div class="flex items-center gap-2">
				<label for="coin-gp"><Coin type="gp" size="size-5" /></label>
				<Input
					id="coin-gp"
					class="w-20 md:w-24"
					type="number"
					onfocus={autoSel}
					bind:value={character.gp}
				/>
				<label for="coin-sp"><Coin type="sp" size="size-5" /></label>
				<Input
					id="coin-sp"
					class="w-20 md:w-24"
					type="number"
					onfocus={autoSel}
					bind:value={character.sp}
				/>
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
		{onroll}
		{onchange}
	/>

	<ListManager
		bind:list={character.resources}
		title="Resources"
		emptyLabel="No resources."
		initialRow={{ name: 'Resource', current: 0, max: 0 }}
		{onchange}
	>
		{#snippet helpText()}
			<p>
				This is for anything you want to track a quantity of with a current and maximum value. It
				could be class feature uses or anything like that.
			</p>
		{/snippet}
		{#snippet row(res, delBtn)}
			<Input bind:value={res.name} class="w-full" />
			<Input class="w-12 md:w-16" type="number" onfocus={autoSel} bind:value={res.current} />
			{@render delBtn()}
		{/snippet}
		{#snippet deleteAlt(res)}
			<Input class="w-12 md:w-16" type="number" onfocus={autoSel} bind:value={res.max} />
		{/snippet}
	</ListManager>

	<Card.Root>
		<Card.Header>
			<Card.Title class="text-lg">Notes</Card.Title>
		</Card.Header>
		<Card.Content>
			<Textarea rows={5} bind:value={character.notes} />
		</Card.Content>
	</Card.Root>
</div>
