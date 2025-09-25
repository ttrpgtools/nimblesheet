<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import type { Npc } from './npc';
	import Shield from '$lib/icons/Shield.svelte';
	import Heart from './icons/Heart.svelte';
	import Movement from './icons/Movement.svelte';
	import { Icons } from '$lib/icons';
	import { Button } from './components/ui/button';
	import { rollDice } from './dice/integration';

	let {
		npc,
		delMode = false,
		ondelete,
	}: { npc: Npc; delMode?: boolean; ondelete: () => void } = $props();
	const ENDS_LETTER = /[\w)]$/;

	async function onroll(roll: string, label?: string, addMod = 0) {
		const context = {
			LVL: +npc.level,
		};
		return await rollDice(roll, {
			label,
			context,
			rollModifier: addMod,
			characterName: npc.name,
		});
	}

	let hpdelta = $state('');
	function adjustHp(mod: number) {
		if (!hpdelta) return;
		const delta = parseInt(hpdelta, 10);
		if (Number.isNaN(delta) || delta === 0) return;
		npc.hp = Math.min(Math.max(npc.hp + delta * mod, 0), npc.maxHp);
		hpdelta = '';
	}
	function autoSel(ev: FocusEvent) {
		const el = ev.target as HTMLInputElement;
		el.select();
	}
	let isDead = $derived(npc.hp === 0);
</script>

<Card.Root
	class="relative {delMode
		? `border-destructive bg-[repeating-linear-gradient(45deg,var(--tw-gradient-stops))] from-[rgba(255,0,0,0.1)] from-[length:0_20px] to-[transparent] to-[length:20px_40px]`
		: `border-gray-500`}"
>
	<Card.Content class="flex flex-col gap-2 {isDead ? `text-muted-foreground` : ``}">
		{#if delMode}
			<Button
				size="icon"
				variant="destructive"
				class="absolute top-2 right-4 rounded-full"
				onclick={ondelete}><Icons.Trash class="text-destructive-foreground" /></Button
			>
		{/if}
		<div class="flex items-center gap-3">
			<div class="text-lg font-bold {isDead ? `line-through` : ``} [font-variant:small-caps]">
				{npc.name}
			</div>
			<div>Lvl {npc.level}</div>
			{#if npc.armor && npc.armor !== 'none'}
				<div class="flex items-center gap-1">
					<Shield size="size-4" />
					{npc.armor[0].toUpperCase()}
				</div>
			{/if}
			{#if npc.speed && npc.speed !== '6'}
				<div class="flex items-center gap-1">
					<Movement size="size-4" />
					{npc.speed}
				</div>
			{/if}
		</div>
		<div class="grid grid-cols-3 gap-2">
			<div class="relative">
				<Heart size="size-4 absolute left-2 top-1/2 -translate-y-1/2" />
				<Input
					bind:value={npc.hp}
					onfocus={autoSel}
					class="pl-6 text-right"
					type="number"
					inputmode="numeric"
				/>
			</div>
			<div class="relative">
				<Button
					variant="ghost"
					class="absolute top-1/2 left-0 -translate-y-1/2 p-2"
					onclick={() => adjustHp(1)}><Icons.CirclePlus class="size-4" /></Button
				>
				<Input type="text" class="px-7 text-center" bind:value={hpdelta} />
				<Button
					variant="ghost"
					class="absolute top-1/2 right-0 -translate-y-1/2 p-2"
					onclick={() => adjustHp(-1)}><Icons.CircleMinus class="size-4" /></Button
				>
			</div>
			<Input placeholder="Notes" />
		</div>
		{#if npc.special.name}
			<div class="bg-secondary p-2">
				<span class="font-bold"
					>{npc.special.name}{ENDS_LETTER.test(npc.special.name) ? `.` : ``}</span
				>
				<span>{npc.special.desc}</span>
			</div>
		{/if}
		{#if npc.actionOptions}<div>{npc.actionOptions}</div>{/if}
		{#if npc.actions.length}
			<ul class="flex flex-col gap-2">
				{#each npc.actions as action}
					<li class="flex flex-wrap items-center gap-1 border-r-4">
						{#if action.roll}
							<button
								type="button"
								class="inline-block"
								onclick={() => onroll(action.roll, action.name)}
								><Icons.Dice class="size-6" /></button
							>
						{:else}
							<Icons.Dot class="size-6" />
						{/if}
						<span class="font-bold">{action.name}{ENDS_LETTER.test(action.name) ? `.` : ``}</span>
						<span>{action.desc}</span>
					</li>
				{/each}
			</ul>
		{/if}
	</Card.Content>
</Card.Root>
