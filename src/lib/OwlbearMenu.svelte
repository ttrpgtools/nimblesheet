<script lang="ts">
	import { Button } from './components/ui/button';

	import { owlbear } from './owlbear.svelte';
	import Sidebar from './Sidebar.svelte';
	import OwlbearIcon from './icons/OwlbearIcon.svelte';

	type Props = {
		type: 'char' | 'npc';
	};
	let { type }: Props = $props();
</script>

<Sidebar title="Owlbear Player Sheets" icon={OwlbearIcon}>
	{#snippet children(ondone)}
		{#if owlbear.characters?.length}
			<nav>
				<ul class="">
					{#each owlbear.characters as char}
						<li>
							<Button
								variant={owlbear.active?.id === char.id ? `outline` : `ghost`}
								class="w-full justify-start gap-1 border-gray-500 px-3"
								onclick={() => {
									owlbear.view(char);
									ondone();
								}}
							>
								{char.name || 'Unnamed Character'} ({owlbear.players[char.id].name})
							</Button>
						</li>
					{/each}
				</ul>
			</nav>
		{:else}
			<div class="flex-grow">
				<div class="rounded-lg border-4 border-dashed p-8 text-center italic text-muted-foreground">
					No characters available. Make sure players enable sharing on their sheets.
				</div>
			</div>
		{/if}
	{/snippet}
</Sidebar>
