<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Icons } from '$lib/icons';
	import { rollInfluence } from './influence.svelte';
	import Die from './Die.svelte';
	import { rollDice } from './integration';
	import { SvelteMap } from 'svelte/reactivity';
	import Vicious from './Vicious.svelte';
	import Explode from './Explode.svelte';
	import { Input } from '$lib/components/ui/input';

	let { characterName }: { characterName?: string | undefined } = $props();

	let mode: 'single' | 'multi' = $state('single');
	let modifier: number = $state('' as unknown as number);
	let dieStack = new SvelteMap<number, number>();
	let exploding = $state(false);
	let vicious = $state(false);
	let formula = $derived(
		Array.from(dieStack.entries())
			.map(([sides, count]) => `${count}d${sides}${exploding ? '!' : ''}${vicious ? 'v' : ''}`)
			.join(' + ') +
			(modifier > 0 ? ` + ${modifier}` : modifier < 0 ? ` - ${Math.abs(modifier)}` : '')
	);
	let open = $state(false);

	async function simpleRoll(sides: number) {
		return await rollDice(`d${sides}`, { characterName });
	}

	async function tapDie(sides: number, event: MouseEvent) {
		if (mode === 'single') {
			await simpleRoll(sides);
		} else if (mode === 'multi') {
			event.preventDefault();
			dieStack.set(sides, (dieStack.get(sides) || 0) + 1);
		}
	}

	async function actionBtn() {
		if (mode === 'single') {
			mode = 'multi';
		} else if (mode === 'multi') {
			await rollDice(formula, { characterName });
			open = false;
			dieStack.clear();
			vicious = false;
			exploding = false;
			modifier = '' as unknown as number;
			mode = 'single';
		}
	}
</script>

<DropdownMenu.Root bind:open>
	<DropdownMenu.Trigger>
		<div class="relative">
			<Button variant="secondary" size="icon" class="rounded-full">
				<Icons.Dice class="h-5 w-5" />
				<span class="sr-only">Roll dice</span>
			</Button>
			{#if rollInfluence.value === 20}<Badge
					variant={rollInfluence.value < 0 ? `destructive` : `default`}
					class="absolute -top-1 -right-2">{Math.abs(rollInfluence.value)}</Badge
				>{/if}
		</div>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="center">
		<DropdownMenu.Label class="flex justify-between gap-2">
			<div class="relative">
				<Button
					variant="outline"
					size="icon"
					class="rounded-full"
					title="Advantage"
					onclick={() => rollInfluence.positive()}
					><Icons.Advantage class="pointer-events-none size-6" /></Button
				>
				{#if rollInfluence.value > 0}<Badge variant="destructive" class="absolute -top-1 -right-2"
						>{rollInfluence.value}</Badge
					>{/if}
			</div>
			<Button
				variant="outline"
				size="icon"
				class="rounded-full"
				title="Clear Adv/Dis"
				onclick={() => rollInfluence.reset()}><Icons.X class="pointer-events-none size-6" /></Button
			>
			<div class="relative">
				<Button
					variant="outline"
					size="icon"
					class="rounded-full"
					title="Disadvantage"
					onclick={() => rollInfluence.negative()}
					><Icons.Disadvantage class="pointer-events-none size-6" /></Button
				>
				{#if rollInfluence.value < 0}<Badge variant="destructive" class="absolute -top-1 -right-2"
						>{Math.abs(rollInfluence.value)}</Badge
					>{/if}
			</div>
		</DropdownMenu.Label>
		{#each [4, 6, 8, 10, 12, 20, 100] as d}
			<DropdownMenu.Item onclick={(e) => tapDie(d, e)} class="cursor-pointer">
				<div class="flex w-full items-center gap-3 text-lg">
					<Die which={d} size="size-6" /> d{d}
					{#if mode === 'multi'}
						{#if (dieStack.get(d) ?? 0) > 0}
							<Badge variant="destructive" class="ml-auto">{dieStack.get(d)}</Badge>
						{/if}
					{/if}
				</div>
			</DropdownMenu.Item>
		{/each}
		{#if mode === 'multi'}
			<DropdownMenu.Label class="flex flex-col gap-2">
				<div>
					<Button
						variant="outline"
						class={[exploding && 'bg-muted border-primary']}
						size="sm"
						title="Exploding Crits"
						onclick={() => (exploding = !exploding)}><Explode /></Button
					>
					<Button
						variant="outline"
						class={[vicious && 'bg-muted border-primary']}
						size="sm"
						title="Vicious"
						onclick={() => (vicious = !vicious)}><Vicious /></Button
					>
				</div>
				<Input class="w-22 flex-1" type="number" placeholder="Modifier" bind:value={modifier} />
			</DropdownMenu.Label>
		{/if}
		<DropdownMenu.Label>
			<Button
				variant="outline"
				size="sm"
				class="w-full"
				onclick={actionBtn}
				disabled={mode === 'multi' && formula === ''}
			>
				{#if mode === 'single'}
					<Icons.Multi class="" />
					Multi Roll
				{:else}
					<Icons.Dice class="" />
					Roll
				{/if}
			</Button>
		</DropdownMenu.Label>
	</DropdownMenu.Content>
</DropdownMenu.Root>
