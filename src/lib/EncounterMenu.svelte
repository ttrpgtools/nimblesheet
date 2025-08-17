<script lang="ts">
	import { Button } from './components/ui/button';

	import { Icons } from '$lib/icons';

	import ConfirmButton from './ConfirmButton.svelte';

	import { encounterManager as manager } from './encounter-manager.svelte';
	import Sidebar from './Sidebar.svelte';

	type Props = {
		type: 'char' | 'npc';
	};
	let { type }: Props = $props();
</script>

<Sidebar title={`Encounter (${manager.encounter.length})`} icon={Icons.Swords}>
	{#snippet children(done)}
		{#if manager.npcs.length}
			<nav class="grow">
				<ul>
					{#each manager.npcs as char}
						<li>
							<Button
								variant="ghost"
								class="w-full justify-start gap-1 border-gray-500"
								onclick={() => {
									manager.addToEncounter(char);
								}}
							>
								{char.name || 'Unnamed NPC'}
							</Button>
						</li>
					{/each}
				</ul>
			</nav>
		{:else}
			<div class="grow px-2">
				<div class="text-muted-foreground rounded-lg border-4 border-dashed p-8 text-center italic">
					No NPCs created. Switch to the NPC menu to add some.
				</div>
			</div>
		{/if}
	{/snippet}
	{#snippet footer()}
		{#if manager.encounter.length > 0}
			<ConfirmButton
				onconfirm={manager.clear}
				confirmText={`Click again to clear ${manager.encounter.length} npcs${manager.encounter.length === 1 ? `` : `s`} from encounter.`}
				><Icons.Trash class="mr-2 size-4" />Clear Encounter</ConfirmButton
			>
		{/if}
	{/snippet}
</Sidebar>
