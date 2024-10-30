<script lang="ts">
	import { Die } from '.';
	import Explode from './Explode.svelte';
	import Vicious from './Vicious.svelte';
	import X from 'lucide-svelte/icons/x';
	import type { evaluateDiceRoll } from './rolling';

	type Props = {
		formula: string;
		label?: string;
		rollModifier?: number;
		result: Awaited<ReturnType<typeof evaluateDiceRoll>>;
	};
	let { formula, label = '', rollModifier = 0, result }: Props = $props();

	const modDisplay = Math.abs(rollModifier) === 1 ? '' : ` ${Math.abs(rollModifier)}`;
</script>

<div class="flex flex-col gap-2">
	<div class="">
		Rolling {formula}{label ? ` (${label})` : ``}
		{rollModifier === 0 ? `` : `with${modDisplay} ${rollModifier < 0 ? `dis` : ''}advantage`}
	</div>
	<div class="flex items-center gap-4">
		<div class="text-2xl font-bold">{result.value}</div>
		<div class="flex gap-2 rounded-md border border-gray-400 p-2">
			{#each result.dice as die}
				<div class="flex flex-col items-center gap-1">
					{#if die.type === 'vicious'}
						<Vicious size="size-4" />
					{:else if die.type === 'exploded'}
						<Explode size="size-4" />
					{:else if die.type === 'dropped'}
						<X class="size-4" />
					{:else}
						<Die which={die.sides} size="size-4" />
					{/if}
					<div class="{die.isMax() ? `text-green-500` : ''} {die.isMin() ? `text-red-500` : ``}">
						{die.value}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
