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
	import { secretSpells, utilitySpells } from './magic';
	import { magicSchools } from './nimble';
	import { id } from './random';
	import { addableSpells, standardSpells } from './spell-catalog';
	import SpellSchool from './SpellSchool.svelte';
	import type {
		CharacterClass,
		MagicSchool,
		MagicSchoolDefinition,
		Spell,
		SpellcastingProfile,
		Stat,
	} from './types';

	type Props = {
		classConfig: CharacterClass;
		level: number;
		stats: Record<Stat, number>;
		spellcasting: SpellcastingProfile;
		mana: number;
		onroll?: (roll: string, label?: string) => void;
		onchange: () => void;
	};
	let {
		classConfig,
		level = 1,
		stats,
		spellcasting = $bindable(),
		mana = $bindable(),
		onroll = () => {},
		onchange,
	}: Props = $props();

	let classTier = $derived(
		classConfig.spellTierProgression === 'oathsworn'
			? level === 1
				? -1
				: level < 13
					? Math.floor(Math.min(level, 10) / 2)
					: Math.floor((level - 13) / 4) + 6
			: classConfig.spellTierProgression === 'shadowmancer'
				? level === 1
					? -1
					: level < 7
						? Math.floor((level + 1) / 3)
						: Math.floor((level + 2) / 3)
				: classConfig.spellTierProgression === 'standard'
					? Math.floor(level / 2)
					: 0
	);
	let hasAutomaticTier = $derived(classConfig.spellTierProgression !== undefined);
	let tierCap = $derived(spellcasting.tier ?? classTier);
	let effectiveSchools = $derived(spellcasting.schools ?? classConfig.magicSchools ?? []);
	let schoolDefinitions = $derived([...magicSchools, ...(spellcasting.customSchools ?? [])]);
	let displaySchools = $derived.by(() => {
		const definitions = new Map(schoolDefinitions.map((school) => [school.id, school]));
		for (const spell of spellcasting.customSpells) {
			if (!definitions.has(spell.school)) {
				definitions.set(spell.school, { id: spell.school, name: spell.school });
			}
		}
		return [...definitions.values()];
	});
	function classMaxMana() {
		const formula = classConfig.manaFormula;
		if (!formula || level < formula.minimumLevel) return 0;
		return Math.max(
			stats[formula.stat] * formula.statMultiplier + (formula.addLevel ? level : 0),
			0
		);
	}
	function tierDescription(tier: number) {
		if (tier < 0) return 'class-specific starting spells';
		if (tier === 0) return 'cantrips';
		return `spells through tier ${tier}`;
	}
	let maxMana = $derived(spellcasting.maxMana ?? classMaxMana());
	let expandedCustomSpells: number[] = $state([]);

	type DisplaySpell = Spell & { labels?: ('Secret' | 'Custom')[] };
	type SchoolGroup = { id: MagicSchool | 'Utility'; name: string; spells: DisplaySpell[] };
	let automaticSpells = $derived(
		standardSpells.filter(
			(spell) =>
				effectiveSchools.includes(spell.school) &&
				(!spell.onlyFor || spell.onlyFor === classConfig.id)
		)
	);
	let additionalSpellGroups = $derived(
		magicSchools
			.map((school) => ({
				id: school.id,
				name: school.name,
				spells: addableSpells.filter(
					(spell) =>
						spell.school === school.id &&
						!automaticSpells.some((automatic) => automatic.name === spell.name) &&
						!spellcasting.addedSpells.includes(spell.name)
				),
			}))
			.filter((group) => group.spells.length)
	);
	let hideableSpellGroups = $derived(
		magicSchools
			.map((school) => ({
				id: school.id,
				name: school.name,
				spells: addableSpells.filter(
					(spell) =>
						spell.school === school.id &&
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
				labels: secretSpells.some((secret) => secret.name === spell.name) ? ['Secret'] : undefined,
			}));
		const custom: DisplaySpell[] = spellcasting.customSpells
			.filter((spell) => spell.category !== 'utility')
			.map((spell) => ({
				...spell,
				labels: spell.category === 'secret' ? ['Secret', 'Custom'] : ['Custom'],
			}));
		const unique = new Map<string, DisplaySpell>();
		for (const spell of [...automaticSpells, ...additions, ...custom])
			unique.set(spell.name, spell);
		return [...unique.values()].filter(
			(spell) => spell.tier <= tierCap && !spellcasting.excludedSpells.includes(spell.name)
		);
	});
	let available = $derived.by(() => {
		const groups: SchoolGroup[] = displaySchools
			.map((school) => ({
				id: school.id,
				name: school.name,
				spells: knownSpells.filter((spell) => spell.school === school.id),
			}))
			.filter((group) => group.spells.length);
		const utilities = [
			...utilitySpells.filter((spell) => spellcasting.utilitySpells.includes(spell.name)),
			...spellcasting.customSpells.filter((spell) => spell.category === 'utility'),
		];
		if (utilities.length) groups.push({ id: 'Utility', name: 'Utility', spells: utilities });
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
	function addCustomSchool() {
		const school: MagicSchoolDefinition = { id: `user:school:${id()}`, name: 'New school' };
		updateProfile({
			customSchools: [...spellcasting.customSchools, school],
			schools: [...new Set([...effectiveSchools, school.id])],
		});
	}
	function renameCustomSchool(index: number, name: string) {
		updateProfile({
			customSchools: spellcasting.customSchools.map((school, schoolIndex) =>
				schoolIndex === index ? { ...school, name } : school
			),
		});
	}
	function removeCustomSchool(index: number) {
		const school = spellcasting.customSchools[index];
		if (!school || spellcasting.customSpells.some((spell) => spell.school === school.id)) return;
		updateProfile({
			customSchools: spellcasting.customSchools.filter((_, schoolIndex) => schoolIndex !== index),
			schools: effectiveSchools.filter((schoolId) => schoolId !== school.id),
		});
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
		const newIndex = spellcasting.customSpells.length;
		updateProfile({
			customSpells: [
				...spellcasting.customSpells,
				{
					id: `user:spell:${id()}`,
					name: 'New spell',
					school: effectiveSchools[0] ?? 'Fire',
					tier: 0,
					desc: '',
					actions: 1,
					roll: '',
				},
			],
		});
		expandedCustomSpells = [...expandedCustomSpells, newIndex];
	}
	function setCustomSpellOpen(index: number, open: boolean) {
		expandedCustomSpells = open
			? [...new Set([...expandedCustomSpells, index])]
			: expandedCustomSpells.filter((candidate) => candidate !== index);
	}
	function updateCustomSpell(index: number, patch: Partial<Spell>) {
		updateProfile({
			customSpells: spellcasting.customSpells.map((spell, i) =>
				i === index ? { ...spell, ...patch } : spell
			),
		});
	}
	function setCustomSpellCategory(index: number, value: string) {
		updateCustomSpell(index, {
			category: value === 'standard' ? undefined : (value as 'utility' | 'secret'),
			...(value === 'utility' ? { tier: 0 } : {}),
		});
	}
	function removeCustomSpell(index: number) {
		updateProfile({ customSpells: spellcasting.customSpells.filter((_, i) => i !== index) });
		expandedCustomSpells = expandedCustomSpells
			.filter((candidate) => candidate !== index)
			.map((candidate) => (candidate > index ? candidate - 1 : candidate));
	}
	function schoolName(schoolId: MagicSchool) {
		return schoolDefinitions.find((school) => school.id === schoolId)?.name ?? schoolId;
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
							Customize this character's spellcasting, schools, and spell list.
						</Sheet.Description>
					</Sheet.Header>

					<div class="flex flex-col gap-6 px-4 pb-8">
						<section class="flex flex-col gap-3">
							<div class="flex items-center justify-between gap-2">
								<div>
									<h3 class="font-semibold">Spell schools</h3>
									<p class="text-muted-foreground text-xs">
										Choose which schools this character knows.
									</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									disabled={spellcasting.schools === undefined}
									onclick={() => updateProfile({ schools: undefined })}>Use class default</Button
								>
							</div>
							<div class="grid grid-cols-2 gap-3">
								{#each schoolDefinitions as school}
									<label class="flex items-center gap-2">
										<Checkbox
											checked={effectiveSchools.includes(school.id)}
											onCheckedChange={(checked) => setSchool(school.id, !!checked)}
										/>
										<SpellSchool school={school.id} class="size-4" />
										<span>{school.name}</span>
									</label>
								{/each}
							</div>
							<div class="flex items-center justify-between gap-2 pt-2">
								<div>
									<h4 class="text-sm font-medium">Create custom schools</h4>
									<p class="text-muted-foreground text-xs">
										Custom spells can be assigned to these schools below.
									</p>
								</div>
								<Button variant="outline" size="sm" onclick={addCustomSchool}>
									<Icons.Add class="size-4" /> Add school
								</Button>
							</div>
							{#each spellcasting.customSchools as school, index}
								<div class="flex items-center gap-2">
									<SpellSchool school={school.id} class="size-4" />
									<Input
										aria-label="School name"
										value={school.name}
										oninput={(event) => renameCustomSchool(index, event.currentTarget.value)}
									/>
									<Button
										variant="ghost"
										size="icon"
										disabled={spellcasting.customSpells.some((spell) => spell.school === school.id)}
										title={spellcasting.customSpells.some((spell) => spell.school === school.id)
											? 'Move or remove this school’s custom spells first'
											: 'Remove school'}
										onclick={() => removeCustomSchool(index)}
									>
										<Icons.Trash class="size-4" />
									</Button>
								</div>
							{/each}
						</section>

						<section class="grid grid-cols-2 gap-3 border-t pt-5">
							<div class="col-span-2">
								<h3 class="font-semibold">Character-wide spellcasting</h3>
								<p class="text-muted-foreground text-xs">
									These settings apply across every spell school.
								</p>
							</div>
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
								<Label for="spell-tier">Current spell tier</Label>
								<Input
									id="spell-tier"
									type="number"
									min="-1"
									placeholder={hasAutomaticTier ? `Automatic: ${classTier}` : 'Set current tier'}
									value={spellcasting.tier ?? ''}
									onchange={(event) => setOptionalNumber('tier', event)}
								/>
								<p class="text-muted-foreground text-xs">
									{#if hasAutomaticTier}
										Highest tier currently available. The class and level currently allow
										{tierDescription(tierCap)}.
									{:else}
										This class has no automatic tier progression. Enter the tier currently allowed.
									{/if}
								</p>
							</div>
							<div class="flex flex-col gap-2">
								<Label for="max-mana">Maximum mana</Label>
								<Input
									id="max-mana"
									type="number"
									min="0"
									placeholder={`Automatic: ${classMaxMana()}`}
									value={spellcasting.maxMana ?? ''}
									onchange={(event) => setOptionalNumber('maxMana', event)}
								/>
								<p class="text-muted-foreground text-xs">
									{#if classConfig.manaFormula}
										Calculated from class, stats, and level when left blank.
									{:else}
										This class has no automatic mana formula. Enter a maximum if it uses mana.
									{/if}
								</p>
							</div>
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
								<Collapsible.Root
									open={expandedCustomSpells.includes(index)}
									onOpenChange={(open) => setCustomSpellOpen(index, open)}
									class="rounded-lg border"
								>
									<div class="flex items-center gap-1 p-2">
										<Collapsible.Trigger
											class="group flex min-w-0 grow items-center gap-2 rounded-md p-1 text-left"
										>
											<Icons.ChevronRight
												class="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-90"
											/>
											<SpellSchool school={spell.school} class="size-5 shrink-0" />
											<span class="min-w-0 grow">
												<span class="block truncate font-medium"
													>{spell.name || 'Unnamed spell'}</span
												>
												<span class="text-muted-foreground block truncate text-xs">
													{schoolName(spell.school)} · {spell.category === 'utility'
														? 'Utility'
														: spell.tier <= 0
															? 'Cantrip'
															: `Tier ${spell.tier}`}{spell.category === 'secret'
														? ' · Secret'
														: ''}
												</span>
											</span>
										</Collapsible.Trigger>
										<Button
											variant="ghost"
											size="icon"
											aria-label={`Delete ${spell.name || 'custom spell'}`}
											onclick={() => removeCustomSpell(index)}
										>
											<Icons.Trash class="size-4" />
										</Button>
									</div>
									<Collapsible.Content class="flex flex-col gap-3 border-t p-3">
										<Input
											aria-label="Spell name"
											value={spell.name}
											oninput={(event) =>
												updateCustomSpell(index, { name: event.currentTarget.value })}
										/>
										<div class="grid grid-cols-2 gap-2">
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
													{#each schoolDefinitions as school}
														<option value={school.id}>{school.name}</option>
													{/each}
												</select>
											</label>
											<label class="flex min-w-0 flex-col gap-1 text-xs">
												Spell type
												<select
													class="border-input bg-background h-10 min-w-0 rounded-md border px-2 text-sm"
													value={spell.category ?? 'standard'}
													onchange={(event) =>
														setCustomSpellCategory(index, event.currentTarget.value)}
												>
													<option value="standard">Standard</option>
													<option value="utility">Utility</option>
													<option value="secret">Secret</option>
												</select>
											</label>
											<label class="flex min-w-0 flex-col gap-1 text-xs">
												Tier
												<Input
													type="number"
													min="0"
													disabled={spell.category === 'utility'}
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
									</Collapsible.Content>
								</Collapsible.Root>
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
					<SpellSchool school={school.id} class="size-6" />
					<div class="grow text-left text-lg">{school.name}</div>
					<Icons.ChevronRight
						class="size-5 transition-transform group-data-[state=open]:rotate-90"
					/>
				</Collapsible.Trigger>
				<Collapsible.Content class="py-2 pl-10">
					{#each school.spells as spell}
						<div class="flex items-center gap-2">
							{#if school.id === 'Utility'}<SpellSchool school={spell.school} />{/if}
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
								{#if school.id !== 'Utility'}
									<span class="text-muted-foreground text-sm">
										({spell.tier <= 0 ? 'Cantrip' : `Tier ${spell.tier}`}{spell.labels?.length
											? `, ${spell.labels.join(', ')}`
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
