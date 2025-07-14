<script lang="ts">
	import * as Card from './components/ui/card';
	import { Textarea } from './components/ui/textarea';
	import Trash from 'lucide-svelte/icons/trash-2';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Check from 'lucide-svelte/icons/check';
	import { Button } from './components/ui/button';
	import { Input } from './components/ui/input';
	import ConfirmButton from './ConfirmButton.svelte';
	import type { Note } from './types';

	type Props = {
		note: Note;
		ondelete: () => void;
	};
	let { note = $bindable(), ondelete }: Props = $props();
	let editing = $state(false);
	// svelte-ignore non_reactive_update - It doesn't need to be reactive
	let inputElement: HTMLInputElement | null = null;

	function startEditing() {
		editing = true;
		setTimeout(() => {
			inputElement?.focus();
			inputElement?.select();
		}, 0);
	}
</script>

<Card.Root>
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
					><Check class="size-4" /></Button
				>
			{:else}
				<span>{note.name}</span>
				<Button size="icon" variant="ghost" onclick={startEditing}><Pencil class="size-4" /></Button
				>
			{/if}
		</Card.Title>
		<ConfirmButton
			confirmText="Delete?"
			class="w-10"
			onconfirm={ondelete}
			variant="outline"
			side="left"
			size="icon"><Trash class="size-5" /></ConfirmButton
		>
	</Card.Header>
	<Card.Content>
		<Textarea rows={5} bind:value={note.content} />
	</Card.Content>
</Card.Root>
