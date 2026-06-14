<script lang="ts">
	import { Icons } from '$lib/icons';
	import * as Card from '$lib/components/ui/card';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import * as Popover from '$lib/components/ui/popover';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { classAbilities } from './class-abilities';
	import {
		fireSpells,
		iceSpells,
		lightningSpells,
		necroticSpells,
		radiantSpells,
		windSpells,
		utilitySpells,
	} from './magic';

	type Props = {
		charClass: string;
		level: number;
		subclass?: string;
		selectedAbilities?: Record<string, boolean>;
		onchange: () => void;
		locked?: boolean;
	};
	let {
		charClass = '',
		level = 1,
		subclass = '',
		selectedAbilities = $bindable({}),
		onchange,
		locked = false,
	}: Props = $props();

	const spellNames = new Set([
		...fireSpells,
		...iceSpells,
		...lightningSpells,
		...necroticSpells,
		...radiantSpells,
		...windSpells,
		...utilitySpells,
	].map((s) => s.name));

	// Abilities that duplicate content already shown in the Spells panel.
	function isSpellPanelAbility(name: string): boolean {
		return (
			spellNames.has(name) ||
			/^Tier \d+ Spells$/i.test(name) ||
			name === 'Upgraded Cantrips' ||
			name.startsWith('Mana and ') ||
			name.endsWith('Spellcasting')
		);
	}

	let data = $derived(classAbilities[charClass]);

	let unlockedAbilities = $derived(
		data
			? data.levels
					.filter((l) => l.level <= level)
					.flatMap((l) =>
						l.abilities
							.filter((a) => !isSpellPanelAbility(a.name))
							.map((a) => ({ ...a, level: l.level })),
					)
			: [],
	);

	let activeSubclass = $derived(
		data && subclass ? data.subclasses.find((sc) => sc.name === subclass) : undefined,
	);

	let unlockedSubclassAbilities = $derived(
		activeSubclass
			? activeSubclass.levels
					.filter((l) => l.level <= level)
					.flatMap((l) => l.abilities.map((a) => ({ ...a, level: l.level })))
			: [],
	);

	// How many picks the player is allowed for each ability list at current level.
	function allowedPicks(listName: string): number {
		if (!data) return 0;
		let count = 0;
		for (const lvl of data.levels.filter((l) => l.level <= level)) {
			for (const ab of lvl.abilities) {
				if (ab.name === listName || ab.name.startsWith(listName + ' (')) {
					count++;
				}
			}
		}
		return count;
	}

	function pickedCount(listName: string, items: { name: string }[]): number {
		return items.filter((i) => selectedAbilities[i.name]).length;
	}

	function classSlugUrl(name: string): string {
		const slug = name
			.trim()
			.replace(/'/g, ' ')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
		return `https://nimblenomicon.pages.dev/classes/${slug}/`;
	}

	let docUrl = $derived(classSlugUrl(charClass));
</script>

{#if data}
	<Card.Root>
		<Card.Header>
			<div class="flex items-center gap-2">
				<Card.Title class="flex grow flex-row items-center gap-2 text-lg">
					<span>Class Abilities</span>
					<Popover.Root>
						<Popover.Trigger>
							<Icons.Question class="size-4" />
						</Popover.Trigger>
						<Popover.Content>
							Abilities you have unlocked based on your class and level. Pool abilities (like Savage
							Arsenal) show checkboxes — check the ones you have chosen as you level up.
						</Popover.Content>
					</Popover.Root>
				</Card.Title>
				<a
					href={docUrl}
					target="nimble-docs"
					rel="noopener noreferrer"
					class="text-muted-foreground hover:text-foreground"
					title="Open class reference"
				>
					<Icons.BookOpenText class="size-4" />
				</a>
			</div>
		</Card.Header>
		<Card.Content class="flex flex-col gap-2">
			<!-- Level-up abilities (flat list, no class name accordion) -->
			{#each unlockedAbilities as ability}
				<div class="flex items-center gap-2 py-0.5">
					<Popover.Root>
						<Popover.Trigger class="text-left font-medium hover:underline">
							{ability.name}
						</Popover.Trigger>
						<Popover.Content>
							<p class="text-sm">{ability.desc}</p>
							<a
								class="mt-2 block text-xs text-muted-foreground underline"
								href={docUrl}
								target="nimble-docs"
								rel="noopener noreferrer"
							><Icons.BookOpenText class="size-4" /></a>
						</Popover.Content>
					</Popover.Root>
					<span class="text-muted-foreground ml-1 text-xs">Lv{ability.level}</span>
				</div>
			{/each}

			<!-- Ability-choice pools (Savage Arsenal, Underhanded Abilities, etc.) -->
			{#each data.abilityLists as list}
				{@const allowed = allowedPicks(list.name)}
				{@const picked = pickedCount(list.name, list.items)}
				{#if allowed > 0}
					{#if locked}
						{@const chosenItems = list.items.filter((i) => selectedAbilities[i.name])}
						{#if chosenItems.length}
							{#each chosenItems as item}
								<div class="flex items-center gap-2 py-0.5">
									<Popover.Root>
										<Popover.Trigger class="text-left font-medium hover:underline">
											{item.name}
										</Popover.Trigger>
										<Popover.Content>
											<p class="text-sm">{item.desc}</p>
											<a
												class="mt-2 block text-xs text-muted-foreground underline"
												href={docUrl}
												target="nimble-docs"
												rel="noopener noreferrer"
											><Icons.BookOpenText class="size-4" /></a>
										</Popover.Content>
									</Popover.Root>
								</div>
							{/each}
						{/if}
					{:else}
						<Collapsible.Root>
							<Collapsible.Trigger class="group flex w-full items-center gap-4">
								<div class="grow text-left text-lg">{list.name}</div>
								<span class="text-muted-foreground text-sm">{picked}/{allowed}</span>
								<Icons.ChevronRight
									class="size-5 transition-transform group-data-[state=open]:rotate-90"
								/>
							</Collapsible.Trigger>
							<Collapsible.Content class="py-2 pl-4">
								{#each list.items as item}
									<div class="flex items-start gap-2 py-1">
										<Checkbox
											checked={selectedAbilities[item.name] ?? false}
											onCheckedChange={(x) => {
												selectedAbilities[item.name] = !!x;
												onchange();
											}}
										/>
										<div class="flex grow flex-col">
											<Popover.Root>
												<Popover.Trigger
													class="text-left font-medium hover:underline {!selectedAbilities[item.name] ? 'text-muted-foreground' : ''}"
												>
													{item.name}
												</Popover.Trigger>
												<Popover.Content>
													<p class="text-sm">{item.desc}</p>
													<a
														class="mt-2 block text-xs text-muted-foreground underline"
														href={docUrl}
														target="nimble-docs"
														rel="noopener noreferrer"
													><Icons.BookOpenText class="size-4" /></a>
												</Popover.Content>
											</Popover.Root>
										</div>
									</div>
								{/each}
							</Collapsible.Content>
						</Collapsible.Root>
					{/if}
				{/if}
			{/each}

			<!-- Subclass abilities -->
			{#if activeSubclass && unlockedSubclassAbilities.length}
				<Collapsible.Root open>
					<Collapsible.Trigger class="group flex w-full items-center gap-4">
						<div class="grow text-left text-lg">{activeSubclass.name}</div>
						<Icons.ChevronRight
							class="size-5 transition-transform group-data-[state=open]:rotate-90"
						/>
					</Collapsible.Trigger>
					<Collapsible.Content class="py-2 pl-4">
						{#each unlockedSubclassAbilities as ability}
							<div class="flex items-center gap-2 py-0.5">
								<Popover.Root>
									<Popover.Trigger class="text-left font-medium hover:underline">
										{ability.name}
									</Popover.Trigger>
									<Popover.Content>
										<p class="text-sm">{ability.desc}</p>
										<a
											class="mt-2 block text-xs text-muted-foreground underline"
											href={docUrl}
											target="nimble-docs"
											rel="noopener noreferrer"
										><Icons.BookOpenText class="size-4" /></a>
									</Popover.Content>
								</Popover.Root>
								<span class="text-muted-foreground ml-1 text-xs">Lv{ability.level}</span>
							</div>
						{/each}
					</Collapsible.Content>
				</Collapsible.Root>
			{/if}
		</Card.Content>
	</Card.Root>
{/if}
