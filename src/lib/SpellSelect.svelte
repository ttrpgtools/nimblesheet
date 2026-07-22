<script lang="ts">
	import { Icons } from '$lib/icons';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Popover from '$lib/components/ui/popover';
	import * as Sheet from '$lib/components/ui/sheet';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		fireSpells,
		iceSpells,
		lightningSpells,
		necroticSpells,
		radiantSpells,
		secretSpells,
		utilitySpells,
		windSpells,
	} from './magic';
	import SpellSchool from './SpellSchool.svelte';
	import type { MagicSchool, Spell, SpellcastingProfile, Stat } from './types';

	type Props = {
		classSchools: MagicSchool[];
		level: number;
		stats: Record<Stat, number>;
		spellcasting: SpellcastingProfile;
		mana: number;
		onroll?: (roll: string, label?: string) => void;
		onchange: () => void;
		charClass?: string;
	};
	let {
		classSchools = [],
		level = 1,
		stats,
		spellcasting = $bindable(),
		mana = $bindable(),
		charClass = '',
		onroll = () => {},
		onchange,
	}: Props = $props();

	const schools: MagicSchool[] = ['Fire', 'Ice', 'Lightning', 'Necrotic', 'Radiant', 'Wind'];
	const standardSpells = [
		...fireSpells,
		...iceSpells,
		...lightningSpells,
		...necroticSpells,
		...radiantSpells,
		...windSpells,
	];
	const addableSpells = [...standardSpells, ...secretSpells];
	const standardCasterClasses = ['Mage', 'Shepherd', 'Songweaver', 'Stormshifter'];

	let classTier = $derived(
		charClass === 'Oathsworn'
			? level === 1
				? -1
				: level < 13
					? Math.floor(Math.min(level, 10) / 2)
					: Math.floor((level - 13) / 4) + 6
			: charClass === 'Shadowmancer'
				? level === 1
					? -1
					: level < 7
						? Math.floor((level + 1) / 3)
						: Math.floor((level + 2) / 3)
				: standardCasterClasses.includes(charClass)
					? Math.floor(level / 2)
					: 0
	);
	let tierCap = $derived(spellcasting.tier ?? classTier);
	let effectiveSchools = $derived(spellcasting.schools ?? classSchools);

	function classMaxMana() {
		if (level < 2) return 0;
		switch (charClass) {
			case 'Mage':
			case 'Songweaver':
				return Math.max(stats.INT * 3 + level, 0);
			case 'Shepherd':
			case 'Stormshifter':
				return Math.max(stats.WIL * 3 + level, 0);
			case 'Oathsworn':
				return Math.max(stats.WIL + level, 0);
			default:
				return 0;
		}
	}
	let maxMana = $derived(spellcasting.maxMana ?? classMaxMana());

	type DisplaySpell = Spell & { source?: 'secret' | 'custom' };
	type SchoolGroup = { name: MagicSchool | 'Utility'; spells: DisplaySpell[] };
	let automaticSpells = $derived(
		standardSpells.filter(
			(spell) =>
				effectiveSchools.includes(spell.school) && (!spell.onlyFor || spell.onlyFor === charClass)
		)
	);
	let additionalSpellGroups = $derived(
		schools
			.map((name) => ({
				name,
				spells: addableSpells.filter(
					(spell) =>
						spell.school === name &&
						!automaticSpells.some((automatic) => automatic.name === spell.name) &&
						!spellcasting.addedSpells.includes(spell.name)
				),
			}))
			.filter((group) => group.spells.length)
	);
	let hideableSpellGroups = $derived(
		schools
			.map((name) => ({
				name,
				spells: addableSpells.filter(
					(spell) =>
						spell.school === name &&
						(automaticSpells.some((automatic) => automatic.name === spell.name) ||
							spellcasting.addedSpells.includes(spell.name)) &&
						!spellcasting.excludedSpells.includes(spell.name)
				),
			}))
			.filter((group) => group.spells.length)
	);
	let knownSpells = $derived.by(() => {
		const additions: DisplaySpell[] = addableSpells
			.filter((spell) => spellcasting.addedSpells.includes(spell.name))
			.map((spell) => ({
				...spell,
				source: secretSpells.some((secret) => secret.name === spell.name) ? 'secret' : undefined,
			}));
		const custom: DisplaySpell[] = spellcasting.customSpells.map((spell) => ({
			...spell,
			source: 'custom',
		}));
		const unique = new Map<string, DisplaySpell>();
		for (const spell of [...automaticSpells, ...additions, ...custom])
			unique.set(spell.name, spell);
		return [...unique.values()].filter(
			(spell) => spell.tier <= tierCap && !spellcasting.excludedSpells.includes(spell.name)
		);
	});
	let available = $derived.by(() => {
		const groups: SchoolGroup[] = schools
			.map((name) => ({ name, spells: knownSpells.filter((spell) => spell.school === name) }))
			.filter((group) => group.spells.length);
		const utilities = utilitySpells.filter((spell) =>
			spellcasting.utilitySpells.includes(spell.name)
		);
		if (utilities.length) groups.push({ name: 'Utility', spells: utilities });
		return groups;
	});

	function updateProfile(patch: Partial<SpellcastingProfile>) {
		spellcasting = { ...spellcasting, ...patch };
		onchange();
	}
	function setSchool(school: MagicSchool, checked: boolean) {
		const selected = [...effectiveSchools];
		const next = checked
			? [...new Set([...selected, school])]
			: selected.filter((item) => item !== school);
		updateProfile({ schools: next });
	}
	function setUtility(name: string, checked: boolean) {
		updateProfile({
			utilitySpells: checked
				? [...new Set([...spellcasting.utilitySpells, name])]
				: spellcasting.utilitySpells.filter((item) => item !== name),
		});
	}
	function addOverride(kind: 'addedSpells' | 'excludedSpells', name: string) {
		if (!name) return;
		const opposite = kind === 'addedSpells' ? 'excludedSpells' : 'addedSpells';
		updateProfile({
			[kind]: [...new Set([...spellcasting[kind], name])],
			[opposite]: spellcasting[opposite].filter((item) => item !== name),
		});
	}
	function removeOverride(kind: 'addedSpells' | 'excludedSpells', name: string) {
		updateProfile({ [kind]: spellcasting[kind].filter((item) => item !== name) });
	}
	function setOptionalNumber(kind: 'tier' | 'maxMana', event: Event) {
		const raw = (event.currentTarget as HTMLInputElement).value;
		updateProfile({ [kind]: raw === '' ? undefined : Math.max(kind === 'tier' ? -1 : 0, +raw) });
	}
	function addCustomSpell() {
		updateProfile({
			customSpells: [
				...spellcasting.customSpells,
				{ name: 'New spell', school: 'Fire', tier: 0, desc: '', actions: 1, roll: '' },
			],
		});
	}
	function updateCustomSpell(index: number, patch: Partial<Spell>) {
		updateProfile({
			customSpells: spellcasting.customSpells.map((spell, i) =>
				i === index ? { ...spell, ...patch } : spell
			),
		});
	}
	function removeCustomSpell(index: number) {
		updateProfile({ customSpells: spellcasting.customSpells.filter((_, i) => i !== index) });
	}
	function spellTime(spell: Spell) {
		if (spell.castingTime) return spell.castingTime;
		if (spell.actions && spell.actions !== 1) return `${spell.actions} Actions`;
		return '';
	}
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center gap-2">
			<Card.Title class="flex grow flex-row items-center gap-2 text-lg">
				<span>Spells</span>
				<Popover.Root>
					<Popover.Trigger><Icons.Question class="size-4" /></Popover.Trigger>
					<Popover.Content>
						Class and level supply defaults. Use the pencil to choose schools and utility spells,
						add or hide built-in spells, create custom spells, or override tier and mana limits.
					</Popover.Content>
				</Popover.Root>
			</Card.Title>
			{#if maxMana > 0 || mana > 0}
				<Icons.Mana />
				<Input
					class="w-16 text-center"
					type="number"
					inputmode="numeric"
					onfocus={(event) => event.currentTarget.select()}
					bind:value={mana}
				/>
				<div>/&nbsp;{maxMana}</div>
			{/if}
			<Sheet.Root>
				<Sheet.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
					<Icons.Pencil class="size-4" />
					<span class="sr-only">Edit spellcasting</span>
				</Sheet.Trigger>
				<Sheet.Content side="right" class="w-full overflow-y-auto sm:max-w-md">
					<Sheet.Header>
						<Sheet.Title>Spellcasting</Sheet.Title>
						<Sheet.Description>
							Customize this character's magic without changing the class rules.
						</Sheet.Description>
					</Sheet.Header>

					<div class="flex flex-col gap-6 px-4 pb-8">
						<section class="flex flex-col gap-3">
							<div class="flex items-center justify-between gap-2">
								<h3 class="font-semibold">Spell schools</h3>
								<Button
									variant="ghost"
									size="sm"
									disabled={spellcasting.schools === undefined}
									onclick={() => updateProfile({ schools: undefined })}>Use class default</Button
								>
							</div>
							<div class="grid grid-cols-2 gap-3">
								{#each schools as school}
									<label class="flex items-center gap-2">
										<Checkbox
											checked={effectiveSchools.includes(school)}
											onCheckedChange={(checked) => setSchool(school, !!checked)}
										/>
										<SpellSchool {school} class="size-4" />
										<span>{school}</span>
									</label>
								{/each}
							</div>
						</section>

						<section class="grid grid-cols-2 gap-3">
							<div class="col-span-2 flex flex-col gap-2">
								<Label for="spell-key">Spellcasting KEY</Label>
								<select
									id="spell-key"
									class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
									value={spellcasting.keyStat ?? ''}
									onchange={(event) =>
										updateProfile({
											keyStat: (event.currentTarget.value || undefined) as Stat | undefined,
										})}
								>
									<option value="">Use highest class KEY stat</option>
									<option value="STR">STR</option>
									<option value="DEX">DEX</option>
									<option value="INT">INT</option>
									<option value="WIL">WIL</option>
								</select>
							</div>
							<div class="flex flex-col gap-2">
								<Label for="spell-tier">Maximum tier</Label>
								<Input
									id="spell-tier"
									type="number"
									min="-1"
									placeholder={`Class: ${classTier}`}
									value={spellcasting.tier ?? ''}
									onchange={(event) => setOptionalNumber('tier', event)}
								/>
							</div>
							<div class="flex flex-col gap-2">
								<Label for="max-mana">Maximum mana</Label>
								<Input
									id="max-mana"
									type="number"
									min="0"
									placeholder={`Class: ${classMaxMana()}`}
									value={spellcasting.maxMana ?? ''}
									onchange={(event) => setOptionalNumber('maxMana', event)}
								/>
							</div>
							<p class="text-muted-foreground col-span-2 text-xs">
								Leave either field blank to follow class and level automatically.
							</p>
						</section>

						<section class="flex flex-col gap-3">
							<h3 class="font-semibold">Utility spells</h3>
							<div class="flex flex-col gap-2">
								{#each utilitySpells as spell}
									<label class="flex items-center gap-2">
										<Checkbox
											checked={spellcasting.utilitySpells.includes(spell.name)}
											onCheckedChange={(checked) => setUtility(spell.name, !!checked)}
										/>
										<SpellSchool school={spell.school} class="size-4" />
										<span>{spell.name}</span>
									</label>
								{/each}
							</div>
						</section>

						<section class="flex flex-col gap-3">
							<h3 class="font-semibold">Additional built-in spells</h3>
							<select
								class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
								onchange={(event) => {
									addOverride('addedSpells', event.currentTarget.value);
									event.currentTarget.value = '';
								}}
							>
								<option value="">Add a spell…</option>
								{#each additionalSpellGroups as group}
									<optgroup label={group.name}>
										{#each group.spells as spell}
											<option value={spell.name}>
												{spell.name} ({spell.tier <= 0
													? 'Cantrip'
													: `Tier ${spell.tier}`}{secretSpells.includes(spell) ? ', Secret' : ''})
											</option>
										{/each}
									</optgroup>
								{/each}
							</select>
							{#each spellcasting.addedSpells as name}
								<div class="bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm">
									<span class="grow">{name}</span>
									<Button
										variant="ghost"
										size="icon"
										onclick={() => removeOverride('addedSpells', name)}
									>
										<Icons.X class="size-4" />
									</Button>
								</div>
							{/each}
						</section>

						<section class="flex flex-col gap-3">
							<h3 class="font-semibold">Hidden built-in spells</h3>
							<select
								class="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
								onchange={(event) => {
									addOverride('excludedSpells', event.currentTarget.value);
									event.currentTarget.value = '';
								}}
							>
								<option value="">Hide a spell…</option>
								{#each hideableSpellGroups as group}
									<optgroup label={group.name}>
										{#each group.spells as spell}
											<option value={spell.name}>
												{spell.name} ({spell.tier <= 0 ? 'Cantrip' : `Tier ${spell.tier}`})
											</option>
										{/each}
									</optgroup>
								{/each}
							</select>
							{#each spellcasting.excludedSpells as name}
								<div class="bg-muted flex items-center gap-2 rounded-md px-3 py-2 text-sm">
									<span class="grow">{name}</span>
									<Button
										variant="ghost"
										size="icon"
										onclick={() => removeOverride('excludedSpells', name)}
									>
										<Icons.X class="size-4" />
									</Button>
								</div>
							{/each}
						</section>

						<section class="flex flex-col gap-3">
							<div class="flex items-center justify-between gap-2">
								<h3 class="font-semibold">Custom spells</h3>
								<Button variant="outline" size="sm" onclick={addCustomSpell}>
									<Icons.Add class="size-4" /> Add spell
								</Button>
							</div>
							{#each spellcasting.customSpells as spell, index}
								<div class="flex flex-col gap-3 rounded-lg border p-3">
									<div class="flex gap-2">
										<Input
											aria-label="Spell name"
											value={spell.name}
											onchange={(event) =>
												updateCustomSpell(index, { name: event.currentTarget.value })}
										/>
										<Button variant="ghost" size="icon" onclick={() => removeCustomSpell(index)}>
											<Icons.Trash class="size-4" />
										</Button>
									</div>
									<div class="grid grid-cols-3 gap-2">
										<label class="flex min-w-0 flex-col gap-1 text-xs">
											School
											<select
												class="border-input bg-background h-10 min-w-0 rounded-md border px-2 text-sm"
												value={spell.school}
												onchange={(event) =>
													updateCustomSpell(index, {
														school: event.currentTarget.value as MagicSchool,
													})}
											>
												{#each schools as school}<option value={school}>{school}</option>{/each}
											</select>
										</label>
										<label class="flex min-w-0 flex-col gap-1 text-xs">
											Tier
											<Input
												type="number"
												min="0"
												value={spell.tier}
												onchange={(event) =>
													updateCustomSpell(index, { tier: +event.currentTarget.value })}
											/>
										</label>
										<label class="flex min-w-0 flex-col gap-1 text-xs">
											Actions
											<Input
												type="number"
												min="1"
												value={spell.actions ?? ''}
												onchange={(event) =>
													updateCustomSpell(index, {
														actions: +event.currentTarget.value || undefined,
													})}
											/>
										</label>
									</div>
									<Input
										aria-label="Casting time"
										placeholder="Casting time (optional, e.g. 10 minutes)"
										value={spell.castingTime ?? ''}
										onchange={(event) =>
											updateCustomSpell(index, {
												castingTime: event.currentTarget.value || undefined,
											})}
									/>
									<Input
										aria-label="Dice roll"
										placeholder="Dice roll, e.g. 2d8!+[KEY]"
										value={spell.roll}
										onchange={(event) =>
											updateCustomSpell(index, { roll: event.currentTarget.value })}
									/>
									<Textarea
										aria-label="Spell description"
										placeholder="Spell description"
										value={spell.desc}
										onchange={(event) =>
											updateCustomSpell(index, { desc: event.currentTarget.value })}
									/>
								</div>
							{/each}
						</section>
					</div>
				</Sheet.Content>
			</Sheet.Root>
		</div>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2">
		{#each available as school}
			<Collapsible.Root>
				<Collapsible.Trigger class="group flex w-full items-center gap-4">
					<SpellSchool school={school.name} class="size-6" />
					<div class="grow text-left text-lg">{school.name}</div>
					<Icons.ChevronRight
						class="size-5 transition-transform group-data-[state=open]:rotate-90"
					/>
				</Collapsible.Trigger>
				<Collapsible.Content class="py-2 pl-10">
					{#each school.spells as spell}
						<div class="flex items-center gap-2">
							{#if school.name === 'Utility'}<SpellSchool school={spell.school} />{/if}
							<div class="flex w-full grow items-center gap-2 py-2">
								<Popover.Root>
									<Popover.Trigger><div>{spell.name}</div></Popover.Trigger>
									<Popover.Content>
										<div>
											{#if spellTime(spell)}<span class="font-bold">[{spellTime(spell)}]</span>{/if}
											{spell.desc}
										</div>
									</Popover.Content>
								</Popover.Root>
								{#if school.name !== 'Utility'}
									<span class="text-muted-foreground text-sm">
										({spell.tier <= 0 ? 'Cantrip' : `Tier ${spell.tier}`}{spell.source
											? `, ${spell.source}`
											: ''})
									</span>
								{/if}
							</div>
							{#if spell.roll}
								<Button variant="ghost" size="icon" onclick={() => onroll(spell.roll, spell.name)}>
									<Icons.Dice class="size-5" />
								</Button>
							{/if}
						</div>
					{/each}
				</Collapsible.Content>
			</Collapsible.Root>
		{:else}
			<div class="text-muted-foreground flex items-center justify-center p-4 text-center text-sm">
				No known spells at this tier. Use the pencil to configure this character's magic.
			</div>
		{/each}
	</Card.Content>
</Card.Root>
