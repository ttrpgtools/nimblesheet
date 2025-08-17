<script lang="ts" generics="T">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Icons } from '$lib/icons';
	import type { Snippet } from 'svelte';
	import * as Popover from '$lib/components/ui/popover';

	type Props = {
		list: T[];
		title: string;
		headerExtra?: Snippet;
		footerExtra?: Snippet;
		helpText?: Snippet;
		emptyLabel: string;
		onchange: () => void;
		initialRow: T;
		grid?: string;
		row: Snippet<[T, Snippet]>;
		deleteAlt: Snippet<[T]>;
	};
	let {
		list = $bindable(),
		title,
		headerExtra,
		footerExtra,
		helpText,
		emptyLabel,
		initialRow,
		grid,
		onchange,
		row,
		deleteAlt,
	}: Props = $props();

	let deleteMode = $state(false);

	function deleteRow(index: number) {
		list.splice(index, 1);
		if (!list.length) {
			deleteMode = false;
		}
		onchange();
	}

	function addRow() {
		list.push(structuredClone(initialRow));
		onchange();
	}
</script>

<Card.Root class={deleteMode ? `border-destructive bg-destructive/20` : ``}>
	<Card.Header>
		<div class="flex items-center gap-2">
			<Card.Title class="flex grow flex-row items-center gap-2 text-lg">
				<span>{title}</span>
				{#if helpText}
					<Popover.Root>
						<Popover.Trigger class="">
							<Icons.Question class="size-4" />
						</Popover.Trigger>
						<Popover.Content>
							{@render helpText()}
						</Popover.Content>
					</Popover.Root>
				{/if}
			</Card.Title>
			{#if headerExtra}
				{@render headerExtra()}
			{/if}
			<Button
				size="icon"
				variant={deleteMode ? `destructive` : `outline`}
				onclick={() => (deleteMode = !deleteMode)}
				><Icons.Trash
					class="size-5 {deleteMode ? `text-destructive-foreground` : `text-destructive`}"
				/></Button
			>
		</div>
	</Card.Header>
	<Card.Content class="grid {grid ? grid : `grid-cols-[minmax(0,1fr)_auto_auto]`} gap-2">
		{#each list as item, index}
			{#snippet delBtn()}
				{#if deleteMode}
					<Button size="icon" variant="outline" onclick={() => deleteRow(index)}>
						<Icons.Trash class="text-destructive size-5" />
					</Button>
				{:else}
					{@render deleteAlt(item)}
				{/if}
			{/snippet}
			{@render row(item, delBtn)}
		{:else}
			<div class="p-2 text-center text-muted-foreground text-sm col-span-3">{emptyLabel}</div>
		{/each}
	</Card.Content>
	<Card.Footer>
		<div class="flex w-full items-center justify-between gap-2">
			<Button
				variant="secondary"
				class="border-primary/50 rounded-full hover:border"
				size="icon"
				onclick={addRow}><Icons.Add class="size-5" /></Button
			>
			{#if footerExtra}{@render footerExtra()}{/if}
		</div>
	</Card.Footer>
</Card.Root>
