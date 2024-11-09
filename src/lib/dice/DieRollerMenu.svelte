<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Advantage from 'lucide-svelte/icons/smile';
	import Dice from 'lucide-svelte/icons/dices';
	import Disadvantage from 'lucide-svelte/icons/frown';
	import X from 'lucide-svelte/icons/x';
	import { rollInfluence } from './influence.svelte';
	import Die from './Die.svelte';
	import { rollDice } from './integration';

	let { characterName }: { characterName?: string | undefined } = $props();

	async function simpleRoll(sides: number) {
		return await rollDice(`d${sides}`, { characterName });
	}
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<div class="relative">
			<Button variant="secondary" size="icon" class="rounded-full">
				<Dice class="h-5 w-5" />
				<span class="sr-only">Roll dice</span>
			</Button>
			{#if rollInfluence.value !== 0}<Badge
					variant={rollInfluence.value < 0 ? `destructive` : `default`}
					class="absolute -right-2 -top-1">{Math.abs(rollInfluence.value)}</Badge
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
					onclick={() => rollInfluence.positive()}
					><Advantage class="pointer-events-none size-6" /></Button
				>
				{#if rollInfluence.value > 0}<Badge variant="destructive" class="absolute -right-2 -top-1"
						>{rollInfluence.value}</Badge
					>{/if}
			</div>
			<Button
				variant="outline"
				size="icon"
				class="rounded-full"
				onclick={() => rollInfluence.reset()}><X class="pointer-events-none size-6" /></Button
			>
			<div class="relative">
				<Button
					variant="outline"
					size="icon"
					class="rounded-full"
					onclick={() => rollInfluence.negative()}
					><Disadvantage class="pointer-events-none size-6" /></Button
				>
				{#if rollInfluence.value < 0}<Badge variant="destructive" class="absolute -right-2 -top-1"
						>{Math.abs(rollInfluence.value)}</Badge
					>{/if}
			</div>
		</DropdownMenu.Label>
		{#each [4, 6, 8, 10, 12, 20, 100] as d}
			<DropdownMenu.Item onclick={() => simpleRoll(d)}>
				<div class="flex items-center gap-3 text-lg">
					<Die which={d} size="size-6" /> d{d}
				</div>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
