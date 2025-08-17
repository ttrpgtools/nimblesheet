<script lang="ts">
	import * as Card from './components/ui/card';
	import { Textarea } from './components/ui/textarea';
	import { Icons } from '$lib/icons';
	import { Button } from './components/ui/button';
	import { Input } from './components/ui/input';
	import ConfirmButton from './ConfirmButton.svelte';
	import type { Note } from './types';

	type Props = {
		note: Note;
		ondelete: () => void;
		onroll: (roll: string, label?: string, addMod?: number) => void;
	};
	let { note = $bindable(), ondelete, onroll }: Props = $props();
	let editing = $state(false);
	let deleteMode = $state(false);
	// svelte-ignore non_reactive_update - It doesn't need to be reactive
	let inputElement: HTMLInputElement | null = null;

	function startEditing() {
		editing = true;
		setTimeout(() => {
			inputElement?.focus();
			inputElement?.select();
		}, 0);
	}

	function addRoll() {
		note.rolls.push({
			name: `${note.name} feature`,
			roll: 'd6',
		});
	}

	function deleteRoll(index: number) {
		note.rolls.splice(index, 1);
		if (!note.rolls.length) {
			deleteMode = false;
		}
	}
</script>

<Card.Root class={deleteMode ? `border-destructive bg-destructive/20` : ``}>
	<Card.Header class="flex flex-row items-center justify-between gap-3">
		<Card.Title class="flex flex-row items-center gap-3 text-lg">
			{#if editing}
				<Input
					bind:ref={inputElement}
					type="text"
					bind:value={note.name}
					onkeydown={(e) => {
						if (e.key === 'Enter') editing = false;
					}}
				/>
				<Button size="icon" variant="ghost" class="shrink-0" onclick={() => (editing = false)}
					><Icons.Check class="size-4" /></Button
				>
			{:else}
				<span>{note.name}</span>
				<Button size="icon" variant="ghost" onclick={startEditing}
					><Icons.Pencil class="size-4" /></Button
				>
			{/if}
		</Card.Title>
		<div class="flex items-center gap-2">
			<Button
				size="icon"
				variant={deleteMode ? `destructive` : `outline`}
				onclick={() => (deleteMode = !deleteMode)}
			>
				<Icons.Trash
					class="size-5 {deleteMode ? `text-destructive-foreground` : `text-destructive`}"
				/>
			</Button>
		</div>
	</Card.Header>
	<Card.Content>
		<Textarea rows={5} bind:value={note.content} />
		<div class="mt-3 flex flex-col gap-2">
			{#each note.rolls as _, index}
				<div class="flex flex-row items-center gap-2">
					<Input bind:value={note.rolls[index].name} class="w-full" />

					<Input class="w-20 md:w-24" bind:value={note.rolls[index].roll} />
					{#if deleteMode}
						<Button size="icon" variant="outline" onclick={() => deleteRoll(index)}>
							<Icons.Trash class="text-destructive size-5" />
						</Button>
					{:else}
						<Button
							size="icon"
							variant="ghost"
							onclick={() => onroll(note.rolls[index].roll, note.rolls[index].name)}
						>
							<Icons.Dice class="size-5" />
						</Button>
					{/if}
				</div>
			{/each}
		</div>
	</Card.Content>
	<Card.Footer>
		<div class="flex w-full items-center justify-between gap-2">
			<Button
				variant="secondary"
				class="border-primary/50 rounded-full hover:border"
				size="icon"
				onclick={addRoll}><Icons.Add class="size-5" /></Button
			>
			{#if deleteMode}
				<ConfirmButton
					confirmText={`Click again to delete`}
					onconfirm={ondelete}
					variant="destructive"
					size="sm"
					side="left"
				>
					Delete {note.name} section
				</ConfirmButton>
			{/if}
		</div>
	</Card.Footer>
</Card.Root>
