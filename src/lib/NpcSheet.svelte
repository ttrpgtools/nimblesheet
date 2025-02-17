<script lang="ts">
	import ListManager from './ListManager.svelte';

	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Dice from 'lucide-svelte/icons/dices';

	import { saves } from './nimble';
	import { type Alteration, type Save } from './types';
	import { rollDice } from './dice/integration';
	import type { Npc } from './npc';
	import Caret from '$lib/icons/Caret.svelte';
	import * as Select from './components/ui/select';

	type Props = {
		character: Npc;
		onchange: () => void;
	};
	let { character = $bindable(), onchange }: Props = $props();

	async function onroll(roll: string, label?: string, addMod = 0) {
		const context = {
			LVL: +character.level,
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
	function toggleSave(save: Save, type: Alteration) {
		const current = character.saves[save] ?? 0;
		const next = type === current ? 0 : type;
		character.saves[save] = next === 0 ? undefined : next;
		onchange();
	}
</script>

<div class="mx-auto flex max-w-lg flex-col sm:gap-4" oninput={onchange}>
	<div class="mb-4 flex items-center gap-2 sm:mb-0">
		<Label for="charname" class="sr-only">Name</Label>
		<Input
			id="charname"
			class="h-auto text-2xl font-bold"
			type="text"
			placeholder="Name "
			required
			bind:value={character.name}
		/>
	</div>
	<Card.Root>
		<Card.Content class="grid grid-cols-3 gap-x-2 gap-y-4">
			<div class="relative col-span-2 flex gap-2">
				<Label for="ancestry" class="sr-only">Subtitle</Label>
				<Input id="ancestry" type="text" placeholder="Subtitle" bind:value={character.subtitle} />
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
		<Card.Content class="relative grid grid-cols-4 gap-2">
			<div class="flex flex-col items-center gap-2">
				<Input
					id="sstat-maxhp"
					class="text-center"
					type="number"
					inputmode="numeric"
					onfocus={autoSel}
					bind:value={character.maxHp}
				/>
				<Label for="sstat-maxhp">HP</Label>
			</div>
			<div class="col-span-2 flex flex-col items-center gap-2">
				<Select.Root type="single" bind:value={character.armor}>
					<Select.Trigger>
						{character.armor}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="none">none</Select.Item>
						<Select.Item value="medium">medium</Select.Item>
						<Select.Item value="heavy">heavy</Select.Item>
					</Select.Content>
				</Select.Root>
				<Label for="sstat-armor">Armor</Label>
			</div>
			<div class="flex flex-col items-center gap-2">
				<Input
					id="sstat-speed"
					class="text-center"
					type="text"
					onfocus={autoSel}
					bind:value={character.speed}
				/>
				<Label for="sstat-speed">Speed</Label>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="grid grid-cols-3 gap-2">
			<div class="relative col-span-2 flex gap-2">
				<Label for="special" class="sr-only">Special Effect</Label>
				<Input
					id="special"
					type="text"
					placeholder="Special Effect"
					bind:value={character.special.name}
				/>
			</div>
			<Input bind:value={character.special.roll} />
			<div class="relative col-span-3 flex gap-2">
				<Label for="special" class="sr-only">Special Effect Desc</Label>
				<Input
					id="special"
					type="text"
					placeholder="Description"
					bind:value={character.special.desc}
				/>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Content class="grid grid-cols-3 gap-x-2">
			{#each saves as save}
				<div class="flex flex-col items-center">
					<button type="button" onclick={() => toggleSave(save, 1)} class="flex justify-center">
						<Caret size="size-6" dir="up" save={character.saves[save] ?? 0} />
					</button>
					<span>{save}</span>
					<button type="button" onclick={() => toggleSave(save, -1)} class="flex justify-center">
						<Caret size="size-6" dir="down" save={character.saves[save] ?? 0} />
					</button>
				</div>
			{/each}
		</Card.Content>
	</Card.Root>

	<ListManager
		bind:list={character.actions}
		title="Actions"
		emptyLabel="No actions."
		initialRow={{ name: 'Bite', desc: '', roll: 'd4!' }}
		{onchange}
	>
		{#snippet row(item, delBtn)}
			<div class="relative">
				<Input bind:value={item.name} class="w-full" />
			</div>
			<Input class="w-20 md:w-24" bind:value={item.roll} />
			{@render delBtn()}
			<Input class="col-span-3 mb-3" bind:value={item.desc} />
		{/snippet}
		{#snippet deleteAlt(item)}
			{#if item.roll}
				<Button size="icon" variant="ghost" onclick={() => onroll(item.roll, item.name)}>
					<Dice class="size-5" />
				</Button>
			{:else}
				<div class="size-10"></div>
			{/if}
		{/snippet}
		{#snippet footerExtra()}
			<Input
				bind:value={character.actionOptions}
				placeholder="Action Options"
				class="w-auto grow"
			/>
		{/snippet}
	</ListManager>
</div>
