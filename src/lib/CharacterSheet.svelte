<script lang="ts">
	import ListManager from './ListManager.svelte';

	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import * as Sheet from '$lib/components/ui/sheet';
	import type { NimbleCharacter } from './character.svelte';
	import { Icons } from '$lib/icons';

	import {
		allClasses,
		stats,
		saves,
		ancestries,
		meleeWeapons,
		rangedWeapons,
		hitDice,
	} from './nimble';
	import {
		type Alteration,
		type Ancestry,
		type CharacterClass,
		type Inventory,
		type Save,
		type Stat,
	} from './types';
	import SpellSelect from './SpellSelect.svelte';
	import Owlbear from '$lib/icons/OwlbearIcon.svelte';
	import Caret from '$lib/icons/Caret.svelte';
	import Coin from '$lib/icons/Coin.svelte';
	import { rollDice } from './dice/integration';
	import { owlbear } from './owlbear.svelte';
	import Note from './Note.svelte';
	import Languages from './Languages.svelte';
	import MovementEditor from './MovementEditor.svelte';
	import { contentLibrary } from './content-library.svelte';
	import { applyClassTemplate, contentPackFilename, createClassContentPack } from './content-pack';
	import { download, downloadViaPopup } from './download';
	import { toast } from 'svelte-sonner';

	type Props = {
		character: NimbleCharacter;
		onchange: () => void;
	};
	let { character = $bindable(), onchange }: Props = $props();
	let currentClass = $derived(character.classConfig);
	let templateFileInput: HTMLInputElement;
	let installedClassTemplates = $derived(contentLibrary.classTemplates);
	let classSelectionValue = $derived(
		character.classConfig.presetId ??
			(character.classConfig.templateId && character.classConfig.templatePackId
				? (installedClassTemplates.find(
						(candidate) =>
							candidate.pack.id === character.classConfig.templatePackId &&
							candidate.template.id === character.classConfig.templateId
					)?.selectionId ?? 'custom')
				: character.classConfig.id === 'unconfigured'
					? undefined
					: 'custom')
	);
	const magicProgressionPresets = [
		{
			id: 'mage',
			label: 'Mage / Songweaver',
			description: 'Standard spell tiers; maximum mana is 3 × INT + level from level 2.',
		},
		{
			id: 'shepherd',
			label: 'Shepherd / Stormshifter',
			description: 'Standard spell tiers; maximum mana is 3 × WIL + level from level 2.',
		},
		{
			id: 'oathsworn',
			label: 'Oathsworn',
			description: 'Oathsworn spell tiers; maximum mana is WIL + level from level 2.',
		},
		{
			id: 'shadowmancer',
			label: 'Shadowmancer',
			description: 'Shadowmancer spell tiers with no automatic mana formula.',
		},
	] as const;

	function sameManaFormula(
		left: CharacterClass['manaFormula'],
		right: CharacterClass['manaFormula']
	) {
		if (!left || !right) return left === right;
		return (
			left.stat === right.stat &&
			left.statMultiplier === right.statMultiplier &&
			left.addLevel === right.addLevel &&
			left.minimumLevel === right.minimumLevel
		);
	}

	let magicProgressionPreset = $derived.by(() => {
		if (!character.classConfig.spellTierProgression && !character.classConfig.manaFormula) {
			return 'none';
		}
		return (
			magicProgressionPresets.find((preset) => {
				const source = allClasses.find((candidate) => candidate.id === preset.id);
				return (
					source?.spellTierProgression === character.classConfig.spellTierProgression &&
					sameManaFormula(source?.manaFormula, character.classConfig.manaFormula)
				);
			})?.id ?? 'custom'
		);
	});
	let magicProgressionDescription = $derived(
		magicProgressionPresets.find((preset) => preset.id === magicProgressionPreset)?.description ??
			(magicProgressionPreset === 'custom'
				? 'This class uses progression rules supplied by an imported template.'
				: 'No automatic tier progression or mana formula. Set current values on the character.')
	);

	$effect(() => {
		void contentLibrary.initialize();
	});

	function setClass(selection: string) {
		if (selection === 'import-template') {
			templateFileInput?.click();
			return;
		}
		const installed = contentLibrary.findTemplate(selection);
		if (installed) {
			const applied = applyClassTemplate(
				$state.snapshot(installed.pack),
				$state.snapshot(installed.template)
			);
			character.classConfig = applied.classConfig;
			character.spellcasting = applied.spellcasting;
			character.charClass = applied.classConfig.name;
			character.hitdie = applied.classConfig.die;
			character.saveOverride = {};
			if (+character.level === 1 && !character.hp) {
				character.hp = applied.classConfig.startHp;
				character.maxHp = applied.classConfig.startHp;
			}
			onchange();
			return;
		}
		if (selection === 'custom') {
			character.classConfig = {
				...structuredClone($state.snapshot(character.classConfig)),
				id: character.classConfig.id === 'unconfigured' ? 'custom' : character.classConfig.id,
				presetId: undefined,
				templateId: undefined,
				templatePackId: undefined,
				die: character.hitdie ?? character.classConfig.die ?? 'd8',
			};
			character.hitdie = character.classConfig.die;
			character.charClass = character.classConfig.name;
		} else {
			const preset = allClasses.find((candidate) => candidate.id === selection);
			if (!preset) return;
			character.classConfig = { ...structuredClone(preset), presetId: preset.id };
			character.charClass = preset.name;
			character.hitdie = preset.die;
			if (+character.level === 1 && !character.hp) {
				character.hp = preset.startHp;
				character.maxHp = preset.startHp;
			}
		}
		onchange();
	}

	function saveClassTemplate() {
		if (!character.classConfig.name.trim()) {
			toast.error('Give this custom class a name before saving it as a template.');
			return;
		}
		const prepared = createClassContentPack(
			$state.snapshot(character.classConfig),
			$state.snapshot(character.spellcasting)
		);
		character.classConfig = prepared.classConfig;
		character.spellcasting = prepared.spellcasting;
		character.charClass = prepared.classConfig.name;
		onchange();
		const payload = JSON.stringify(prepared.pack, null, 2);
		if (owlbear.embedded) downloadViaPopup(payload, contentPackFilename(prepared.pack));
		else download(payload, contentPackFilename(prepared.pack));
		void contentLibrary.savePack(prepared.pack);
	}

	async function importClassTemplates(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		for (const file of Array.from(input.files ?? [])) await contentLibrary.importFile(file);
		input.value = '';
	}

	function setCustomClassName(name: string) {
		character.classConfig.name = name;
		character.charClass = name;
		onchange();
	}

	function setClassKey(stat: Stat, selected: boolean) {
		character.classConfig.key = selected
			? [...new Set([...character.classConfig.key, stat])]
			: character.classConfig.key.filter((candidate) => candidate !== stat);
		onchange();
	}

	function setClassSave(save: Save, value: Alteration | 0) {
		if (value === 1 || value === -1) character.classConfig.saves[save] = value;
		else delete character.classConfig.saves[save];
		delete character.saveOverride[save];
		onchange();
	}

	function setHitDie(die: string) {
		character.hitdie = die as typeof character.hitdie;
		character.classConfig.die = character.hitdie;
		onchange();
	}

	function setStartingHp(raw: string) {
		const startingHp = Math.max(0, +raw || 0);
		character.classConfig.startHp = startingHp;
		if (+character.level === 1 && !character.hp && !character.maxHp) {
			character.hp = startingHp;
			character.maxHp = startingHp;
		}
		onchange();
	}

	function setMagicProgression(presetId: string) {
		if (presetId === 'custom') return;
		const nextClass = structuredClone($state.snapshot(character.classConfig));
		const preset = allClasses.find((candidate) => candidate.id === presetId);
		if (preset) {
			nextClass.spellTierProgression = preset.spellTierProgression;
			nextClass.manaFormula = preset.manaFormula ? structuredClone(preset.manaFormula) : undefined;
			character.spellcasting = {
				...$state.snapshot(character.spellcasting),
				tier: undefined,
				maxMana: undefined,
			};
		} else {
			delete nextClass.spellTierProgression;
			delete nextClass.manaFormula;
		}
		character.classConfig = nextClass;
		onchange();
	}

	let invCount = $derived(
		character.inventory.reduce((p, c) => p + (c.bulky ? 2 : c.name.startsWith('-') ? 0 : 1), 0) +
			Math.ceil((character.gp + character.sp) / 500)
	);

	let skillPoints = $derived(character.skills.reduce((p, c) => p + c.extra, 0));
	let maxSkillPoints = $derived(+(character.level ?? '0') + 3);
	let maxActions = $derived(Math.max(1, Math.floor(+character.maxActions || 1)));
	let maxWounds = $derived(Math.max(1, Math.floor(+character.maxWounds || 1)));

	async function onroll(roll: string, label?: string, addMod = 0) {
		const context = {
			LVL: +character.level,
			STR: +character.stats.STR,
			DEX: +character.stats.DEX,
			INT: +character.stats.INT,
			WIL: +character.stats.WIL,
			WIT: Math.max(+character.stats.INT, +character.stats.WIL),
			INIT: Math.max(+character.stats.DEX, +character.initiative),
			CANTRIP: Math.floor(+character.level / 5),
			CANTRIP_DIE: [4, 6, 8, 10, 12][Math.min(Math.floor(+character.level / 5), 4)],
			SHADOW_DICE: 1 + Math.floor(+character.level / 5),
			KEY: character.spellcasting.keyStat
				? +character.stats[character.spellcasting.keyStat]
				: (currentClass?.key ?? []).reduce(
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

	function addNote() {
		character.notes.push({ name: `Note ${character.notes.length + 1}`, content: '', rolls: [] });
	}

	function deleteNote(index: number) {
		character.notes.splice(index, 1);
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
						<Icons.Question class="size-4" />
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
				{#key classSelectionValue}
					<Select.Root type="single" value={classSelectionValue} onValueChange={setClass}>
						<Select.Trigger class="w-full">
							{character.classConfig.id === 'unconfigured'
								? `Class`
								: character.classConfig.presetId
									? character.classConfig.name
									: character.classConfig.name
										? `${character.classConfig.name}*`
										: `Custom class*`}
						</Select.Trigger>
						<Select.Content>
							{#each allClasses as nc}
								<Select.Item value={nc.id}>{nc.name}</Select.Item>
							{/each}
							<Select.Item value="custom">Custom…</Select.Item>
							{#if installedClassTemplates.length}
								<Select.Separator />
								<Select.Group>
									<Select.GroupHeading>Class templates</Select.GroupHeading>
									{#each installedClassTemplates as installed}
										<Select.Item value={installed.selectionId}>
											{installed.template.name}
										</Select.Item>
									{/each}
								</Select.Group>
							{/if}
							<Select.Separator />
							<Select.Item value="import-template">Import class template…</Select.Item>
						</Select.Content>
					</Select.Root>
				{/key}
				<input
					bind:this={templateFileInput}
					type="file"
					accept=".json,application/json"
					class="sr-only"
					onchange={importClassTemplates}
				/>
				{#if !character.classConfig.presetId && character.classConfig.id !== 'unconfigured'}
					<Sheet.Root>
						<Sheet.Trigger
							class={buttonVariants({ variant: 'ghost', size: 'icon' })}
							aria-label="Edit custom class"
						>
							<Icons.Pencil class="size-4" />
						</Sheet.Trigger>
						<Sheet.Content side="right" class="w-full overflow-y-auto sm:max-w-sm">
							<Sheet.Header>
								<Sheet.Title>Custom class</Sheet.Title>
								<Sheet.Description>
									These class defaults are saved with this character. Configure magic in the Spells
									section.
								</Sheet.Description>
							</Sheet.Header>
							<div class="flex flex-col gap-6 px-4 pb-8">
								<div class="flex flex-col gap-2">
									<Label for="custom-class-name">Class name</Label>
									<Input
										id="custom-class-name"
										value={character.classConfig.name}
										oninput={(event) => setCustomClassName(event.currentTarget.value)}
										placeholder="Class name"
									/>
								</div>
								<section class="flex flex-col gap-2">
									<h3 class="font-semibold">KEY stats</h3>
									<div class="grid grid-cols-2 gap-2">
										{#each stats as stat}
											<label class="flex items-center gap-2">
												<input
													type="checkbox"
													checked={character.classConfig.key.includes(stat)}
													onchange={(event) => setClassKey(stat, event.currentTarget.checked)}
												/>
												<span>{stat}</span>
											</label>
										{/each}
									</div>
								</section>
								<section class="flex flex-col gap-2">
									<h3 class="font-semibold">Saving throws</h3>
									{#each saves as save}
										<div class="flex items-center gap-3">
											<span class="w-10 font-medium">{save}</span>
											<div
												class="border-input grid grow grid-cols-[2.5rem_1fr_2.5rem] overflow-hidden rounded-md border"
												role="group"
												aria-label={`${save} save`}
											>
												<button
													type="button"
													class="hover:bg-muted flex h-9 items-center justify-center {character
														.classConfig.saves[save] === -1
														? 'bg-secondary'
														: ''}"
													aria-label={`${save} disadvantage`}
													aria-pressed={character.classConfig.saves[save] === -1}
													onclick={() => setClassSave(save, -1)}
												>
													<Caret
														dir="down"
														size="size-4"
														save={character.classConfig.saves[save] ?? 0}
													/>
												</button>
												<button
													type="button"
													class="hover:bg-muted border-input h-9 border-x px-2 text-sm {character
														.classConfig.saves[save] === undefined
														? 'bg-secondary'
														: ''}"
													aria-pressed={character.classConfig.saves[save] === undefined}
													onclick={() => setClassSave(save, 0)}
												>
													Normal
												</button>
												<button
													type="button"
													class="hover:bg-muted flex h-9 items-center justify-center {character
														.classConfig.saves[save] === 1
														? 'bg-secondary'
														: ''}"
													aria-label={`${save} advantage`}
													aria-pressed={character.classConfig.saves[save] === 1}
													onclick={() => setClassSave(save, 1)}
												>
													<Caret
														dir="up"
														size="size-4"
														save={character.classConfig.saves[save] ?? 0}
													/>
												</button>
											</div>
										</div>
									{/each}
								</section>
								<div class="grid grid-cols-2 gap-3">
									<div class="flex flex-col gap-2">
										<Label for="custom-hit-die">Hit Die</Label>
										<select
											id="custom-hit-die"
											class="border-input bg-background h-10 rounded-md border px-3 text-sm"
											value={character.classConfig.die ?? ''}
											onchange={(event) => setHitDie(event.currentTarget.value)}
										>
											{#each hitDice as hd}<option value={hd}>{hd}</option>{/each}
										</select>
									</div>
									<div class="flex flex-col gap-2">
										<Label for="custom-start-hp">Starting HP</Label>
										<Input
											id="custom-start-hp"
											type="number"
											min="0"
											value={character.classConfig.startHp}
											onchange={(event) => setStartingHp(event.currentTarget.value)}
										/>
									</div>
								</div>
								<section class="flex flex-col gap-2 border-t pt-5">
									<div>
										<h3 class="font-semibold">Magic progression</h3>
										<p class="text-muted-foreground text-xs">
											Copy only the tier progression and mana formula from a built-in class.
										</p>
									</div>
									<Label for="custom-magic-progression">Progression preset</Label>
									<select
										id="custom-magic-progression"
										class="border-input bg-background h-10 rounded-md border px-3 text-sm"
										value={magicProgressionPreset}
										onchange={(event) => setMagicProgression(event.currentTarget.value)}
									>
										<option value="none">None</option>
										{#each magicProgressionPresets as preset}
											<option value={preset.id}>{preset.label}</option>
										{/each}
										{#if magicProgressionPreset === 'custom'}
											<option value="custom">Custom imported progression</option>
										{/if}
									</select>
									<p class="text-muted-foreground text-xs">{magicProgressionDescription}</p>
								</section>
								<section class="flex flex-col gap-3 border-t pt-5">
									<div>
										<h3 class="font-semibold">Class template</h3>
										<p class="text-muted-foreground text-xs">
											Saves and exports this class configuration together with its spellcasting
											schools, custom spell schools, and custom spells. Current tier, maximum mana,
											character stats, inventory, and other character-specific details are not
											included.
										</p>
									</div>
									<Button variant="outline" onclick={saveClassTemplate}>
										<Icons.Export class="size-4" /> Save & export class template
									</Button>
								</section>
							</div>
						</Sheet.Content>
					</Sheet.Root>
				{/if}
				<Select.Root type="single" value={character.hitdie} onValueChange={setHitDie}>
					<Select.Trigger class="w-16">
						{character.hitdie || `Hit Die`}
					</Select.Trigger>
					<Select.Content>
						{#each hitDice as hd}
							<Select.Item value={hd}>{hd}</Select.Item>
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
					<Icons.Question class="size-4" />
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
					class="border-foreground absolute right-1.5 bottom-1.5 size-4 rounded-full"
					><Icons.X /></Button
				>
			{/if}
		</Card.Content>
	</Card.Root>
	<Card.Root>
		<Card.Content class="relative grid grid-cols-4 gap-2">
			<Popover.Root>
				<Popover.Trigger class="absolute top-1.5 right-1.5">
					<Icons.Question class="size-4" />
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
						onclick={() => character.hitdie && onroll(character.hitdie, `Hit Point Increase`, 1)}
						><Icons.Dice class="size-4" /></button
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
						onclick={() => character.hitdie && onroll(`${character.hitdie}+[STR]`, `Hit Die`)}
						><Icons.Dice class="size-4" /></button
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
					<button type="button" onclick={rollInitiative}><Icons.Dice class="size-4" /></button>
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
				<div class="flex items-center gap-1">
					<Label for="sstat-speed">Speed</Label>
					<MovementEditor
						bind:movements={character.movementSpeeds}
						baseSpeed={character.speed}
						{onchange}
					/>
				</div>
			</div>
			{#if character.movementSpeeds.length}
				<div
					class="text-muted-foreground col-span-4 -mt-1 truncate text-right text-xs"
					title={character.movementSpeeds
						.map((movement) => `${movement.type} ${movement.speed}`)
						.join(' · ')}
				>
					{character.movementSpeeds
						.map((movement) => `${movement.type} ${movement.speed}`)
						.join(' · ')}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="flex items-center gap-2">
			<h4 class="grow text-lg font-bold">Save</h4>
			<div class="flex flex-wrap items-center justify-end gap-2">
				{#each saves as save}
					<Button
						variant="secondary"
						size="sm"
						class="w-18 gap-1 px-2"
						onclick={() =>
							onroll(
								`d20+[${save}]`,
								`${save} Save`,
								character.saveOverride[save] ?? currentClass?.saves[save] ?? 0
							)}><Icons.Dice class="mr-1 size-4" />{save}</Button
					>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="flex flex-wrap items-center gap-4">
			<h4 class=" grow text-lg font-bold">Actions</h4>
			<button
				onclick={() => {
					actions = 0;
				}}
			>
				<Icons.X class="size-6 {actions === 0 ? `text-gray-500` : ``}" />
			</button>
			{#each Array.from({ length: maxActions }, (_, index) => index + 1) as action}
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
			<Sheet.Root>
				<Sheet.Trigger
					class={buttonVariants({ variant: 'ghost', size: 'icon' })}
					aria-label="Edit maximum actions"
				>
					<Icons.Pencil class="size-4" />
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-full overflow-y-auto sm:max-w-sm">
					<Sheet.Header>
						<Sheet.Title>Actions</Sheet.Title>
						<Sheet.Description>Set the maximum number of actions for this hero.</Sheet.Description>
					</Sheet.Header>
					<div class="grid gap-2 px-4">
						<Label for="max-actions">Maximum actions</Label>
						<Input
							id="max-actions"
							type="number"
							inputmode="numeric"
							min={1}
							bind:value={character.maxActions}
							oninput={onchange}
						/>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="flex flex-wrap items-center gap-3">
			<h4 class="grow text-lg font-bold">Wounds</h4>
			<button
				type="button"
				onclick={() => {
					character.wounds = 0;
					onchange();
				}}
			>
				<Icons.X class="size-5 {character.wounds === 0 ? `text-gray-500` : ``}" />
			</button>
			{#each Array.from({ length: Math.max(maxWounds - 1, 0) }, (_, index) => index + 1) as wnd}
				<button
					type="button"
					onclick={() => {
						character.wounds = wnd;
						onchange();
					}}
				>
					<Icons.Droplet class="size-5 {character.wounds >= wnd ? `text-red-500` : ``}" />
				</button>
			{/each}
			<button
				type="button"
				onclick={() => {
					character.wounds = maxWounds;
					onchange();
				}}
			>
				<Icons.Skull class="size-5 {character.wounds >= maxWounds ? `text-red-500` : ``}" />
			</button>
			<Sheet.Root>
				<Sheet.Trigger
					class={buttonVariants({ variant: 'ghost', size: 'icon' })}
					aria-label="Edit maximum wounds"
				>
					<Icons.Pencil class="size-4" />
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-full overflow-y-auto sm:max-w-sm">
					<Sheet.Header>
						<Sheet.Title>Wounds</Sheet.Title>
						<Sheet.Description>Set the number of Wounds at which this hero dies.</Sheet.Description>
					</Sheet.Header>
					<div class="grid gap-2 px-4">
						<Label for="max-wounds">Maximum wounds</Label>
						<Input
							id="max-wounds"
							type="number"
							inputmode="numeric"
							min={1}
							bind:value={character.maxWounds}
							oninput={onchange}
						/>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="grid">
			{#each character.skills as skill}
				{@const score = +(character.stats[skill.type] ?? '0') + skill.extra + (skill.bonus ?? 0)}
				<div class="flex items-center gap-2">
					<div class="w-full">
						{skill.name} <span class="text-muted-foreground">({skill.type})</span>
						{#if skill.bonus}
							<span class="text-muted-foreground text-xs"
								>({skill.bonus > 0 ? '+' : ''}{skill.bonus} bonus)</span
							>
						{/if}
					</div>
					<div class="flex items-center">
						<span class="px-4">{score}</span>
						<Button
							variant="ghost"
							size="icon"
							class="rounded-full"
							disabled={score >= 12}
							onclick={() => {
								skill.extra += 1;
								onchange();
							}}
						>
							<Icons.CirclePlus class="size-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							class="rounded-full"
							disabled={skill.extra <= 0}
							onclick={() => {
								skill.extra = skill.extra - 1;
								onchange();
							}}
						>
							<Icons.CircleMinus class="size-4" />
						</Button>
						<Button size="icon" variant="ghost" onclick={() => onroll(`d20+${score}`, skill.name)}>
							<Icons.Dice class="size-5" />
						</Button>
					</div>
				</div>
			{/each}
			<div
				class="mt-1 flex items-center gap-1 border-t pt-3 text-sm {skillPoints > maxSkillPoints
					? `text-destructive`
					: `text-muted-foreground`}"
			>
				<span class="grow">Skill Points allocated: {skillPoints} / {maxSkillPoints}</span>
				<Sheet.Root>
					<Sheet.Trigger
						class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-7' })}
						aria-label="Edit skill bonuses"
					>
						<Icons.Pencil class="size-4" />
					</Sheet.Trigger>
					<Sheet.Content side="right" class="w-full overflow-y-auto sm:max-w-sm">
						<Sheet.Header>
							<Sheet.Title>Skill bonuses</Sheet.Title>
							<Sheet.Description>
								Bonuses from ancestries, backgrounds, boons, and equipment do not count as allocated
								skill points.
							</Sheet.Description>
						</Sheet.Header>
						<div class="grid gap-3 px-4 pb-4">
							{#each character.skills as skill}
								<div class="grid grid-cols-[minmax(0,1fr)_5rem] items-center gap-3">
									<Label for="skill-bonus-{skill.name}">{skill.name}</Label>
									<Input
										id="skill-bonus-{skill.name}"
										class="text-center"
										type="number"
										inputmode="numeric"
										bind:value={skill.bonus}
										oninput={onchange}
									/>
								</div>
							{/each}
						</div>
					</Sheet.Content>
				</Sheet.Root>
				<Popover.Root>
					<Popover.Trigger class="flex size-7 items-center justify-center">
						<Icons.Question class="size-4" />
					</Popover.Trigger>
					<Popover.Content>
						<p>
							You can assign extra skill points, spreading your initial 4 points over 3 skills. At
							each level you get one more, and can move one. Use the pencil to record additional
							bonuses from ancestries, backgrounds, boons, or equipment; those bonuses do not count
							against this allocation.
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
				Track the things you are carrying. Up to 500 coins count as one item. Toggling the weight
				icon makes the item bulky. If you prefix the name of the item with a <code>-</code> sign, the
				item will not add to your inventory count.
			</p>
			<p class="mt-2">
				If you want to be able to roll damage (or whatever else) for an item, you can add a roll
				formula to the second box. The formula works like this: <code>XdYM+Z</code> where
				<code>X</code>
				is the number of dice,
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
					<Icons.Bulky class=" size-5 {item.bulky ? `` : `text-muted-foreground`}" />
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
							<Icons.Weapon class="mr-2 size-4" />
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
					<Icons.Dice class="size-5" />
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
		classConfig={character.classConfig}
		level={character.level}
		stats={character.stats}
		bind:spellcasting={character.spellcasting}
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

	<Languages bind:languages={character.languages} {onchange} />

	{#each character.notes as _, index}
		<Note bind:note={character.notes[index]} ondelete={() => deleteNote(index)} {onroll} />
	{/each}
	<Card.Root>
		<Card.Content class="flex justify-center">
			<Button
				variant="secondary"
				class="border-primary/50 rounded-full pr-5 hover:border"
				size="sm"
				onclick={addNote}><Icons.Add class="size-5" /> Note Section</Button
			>
		</Card.Content>
	</Card.Root>
</div>
