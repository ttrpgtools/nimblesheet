<script lang="ts">
	import Dice from 'lucide-svelte/icons/dices';
	import Indicator from 'lucide-svelte/icons/chevron-right';
	import X from 'lucide-svelte/icons/x';
	import Mana from 'lucide-svelte/icons/wand-sparkles';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card';
	import * as Select from '$lib/components/ui/select';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Popover from '$lib/components/ui/popover';
	import {
		fireSpells,
		iceSpells,
		necroticSpells,
		radiantSpells,
		lightningSpells,
		windSpells,
		utilitySpells
	} from './magic';
	import SpellSchool from './SpellSchool.svelte';
	import type { MagicSchool, Spell, Stat } from './types';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { Input } from '$lib/components/ui/input';

	type Props = {
		allowed: MagicSchool[];
		level: number;
		stats: Record<Stat, number>;
		utilspells?: Record<string, boolean>;
		extraSchool?: MagicSchool;
		mana: number;
		onroll?: (roll: string, label?: string) => void;
		onchange: () => void;
		charClass?: string;
	};
	let {
		allowed = ['Fire', 'Ice', 'Lightning', 'Necrotic', 'Radiant', 'Wind'],
		level = 1,
		stats,
		utilspells = $bindable({}),
		extraSchool = $bindable(),
		mana = $bindable(),
		charClass = '',
		onroll = () => {},
		onchange
	}: Props = $props();

	let tierCap = $derived(
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
				: Math.floor(level / 2)
	);

	type SchoolGroup = { name: MagicSchool | 'Utility'; spells: Spell[] };
	const allSchools: SchoolGroup[] = [
		{ name: 'Fire', spells: fireSpells },
		{ name: 'Ice', spells: iceSpells },
		{ name: 'Lightning', spells: lightningSpells },
		{ name: 'Necrotic', spells: necroticSpells },
		{ name: 'Radiant', spells: radiantSpells },
		{ name: 'Wind', spells: windSpells },
		{ name: 'Utility', spells: utilitySpells }
	] as const;

	let additionalSchools: MagicSchool[] = $derived(
		charClass === 'Songweaver'
			? ['Fire', 'Ice', 'Lightning', 'Necrotic', 'Radiant']
			: charClass === 'Shadowmancer' && level >= 3
				? ['Fire', 'Ice']
				: charClass === 'Stormshifter' && level >= 3
					? ['Ice', 'Radiant']
					: []
	);
	let allAllowed = $derived(
		additionalSchools.length > 0 && extraSchool ? [...allowed, extraSchool] : allowed
	);
	const available = $derived(
		allSchools.reduce<SchoolGroup[]>((p, c) => {
			if (c.name === 'Utility') {
				const av = c.spells.filter((s) => s.tier <= tierCap && allAllowed.includes(s.school));
				if (av.length) {
					p.push({ name: 'Utility', spells: av });
				}
			} else if (allAllowed.includes(c.name)) {
				const av = c.spells.filter(
					(s) => s.tier <= tierCap && (!s.onlyFor || s.onlyFor === charClass)
				);
				if (av.length) {
					p.push({ name: c.name, spells: av });
				}
			}
			return p;
		}, [])
	);

	function handleDropout(ev: Event) {
		ev.stopPropagation();
		extraSchool = undefined;
		onchange();
	}
	function dropOut(el: HTMLButtonElement) {
		el.addEventListener('click', handleDropout);
		() => el.removeEventListener('click', handleDropout);
	}

	type Recipe = { stat: 'INT' | 'WIL'; level: boolean; double: boolean };
	const manaRecipe: Record<string, Recipe> = {
		Mage: { stat: 'INT', level: true, double: true },
		Oathsworn: { stat: 'WIL', level: true, double: false },
		Shadowmancer: { stat: 'INT', level: false, double: false },
		Shepherd: { stat: 'WIL', level: true, double: true },
		Songweaver: { stat: 'WIL', level: true, double: true },
		Stormshifter: { stat: 'WIL', level: true, double: true }
	};
	function getMaxMana(recipe: Recipe) {
		if (!recipe) return 0;
		return (stats[recipe.stat] + (recipe.level ? level : 0)) * (recipe.double ? 2 : 1);
	}
	let maxMana = $derived(getMaxMana(manaRecipe[charClass]));
</script>

<Card.Root>
	<Card.Header>
		<div class="flex items-center gap-2">
			<Card.Title class="w-full flex-grow text-lg">Spells</Card.Title>
			{#if available.length}
				<Mana />
				<Input
					class="w-16 text-center"
					type="number"
					inputmode="numeric"
					onfocus={(ev) => ev.currentTarget.select()}
					bind:value={mana}
				/>
				<div class="">/&nbsp;{maxMana}</div>
			{/if}
		</div>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2">
		{#if additionalSchools.length && extraSchool == null}
			<Select.Root type="single" bind:value={extraSchool} onValueChange={onchange}>
				<Select.Trigger>
					{extraSchool || `Additional school`}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="">(None)</Select.Item>
					{#each additionalSchools as asch}
						<Select.Item value={asch}>{asch}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		{/if}
		{#each available as school}
			<Collapsible.Root>
				<Collapsible.Trigger
					class="group flex w-full items-center gap-4 {extraSchool === school.name &&
					additionalSchools.length &&
					!additionalSchools.includes(extraSchool)
						? `text-destructive`
						: ``}"
				>
					<SpellSchool school={school.name} class="size-6" />
					<div class="flex-grow text-left text-lg">{school.name}</div>
					{#if extraSchool === school.name}<button type="button" class="" use:dropOut
							><X class="size-5" /></button
						>{/if}
					<Indicator class="size-5 transition-transform group-data-[state=open]:rotate-90" />
				</Collapsible.Trigger>
				<Collapsible.Content class="py-2 pl-10">
					{#each school.spells as spell}
						<div class="flex items-center gap-2">
							{#if school.name === 'Utility'}
								<Checkbox
									checked={utilspells[spell.name] ?? false}
									onCheckedChange={(x) => {
										utilspells[spell.name] = !!x;
										onchange();
									}}
								/>
								<SpellSchool school={spell.school} />
							{/if}
							<div class="flex w-full flex-grow items-center gap-2 py-2">
								<Popover.Root>
									<Popover.Trigger>
										<div
											class:text-muted-foreground={school.name === 'Utility' &&
												!utilspells[spell.name]}
										>
											{spell.name}
										</div>
									</Popover.Trigger>
									<Popover.Content>
										<div>
											{spell.desc}
										</div>
									</Popover.Content>
								</Popover.Root>
								{#if school.name !== 'Utility'}<span class=" text-sm text-muted-foreground"
										>({spell.tier <= 0 ? `Cantrip` : `Tier ${spell.tier}`})</span
									>{/if}
							</div>
							{#if spell.roll}
								<Button variant="ghost" size="icon" onclick={() => onroll(spell.roll, spell.name)}
									><Dice class="size-5" /></Button
								>
							{/if}
						</div>
					{/each}
				</Collapsible.Content>
			</Collapsible.Root>
		{:else}
			<div class="text-sm text-muted-foreground flex items-center justify-center p-4">
				{#if charClass}This class doesn't get any spells (at this level){:else}Set class and level
					to access spells.{/if}
			</div>
		{/each}
	</Card.Content>
</Card.Root>
