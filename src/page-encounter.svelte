<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { encounterManager } from '$lib/encounter-manager.svelte';
	import Npc from '$lib/Npc.svelte';
	import { page } from '$lib/page.svelte';
	import Trash_2 from 'lucide-svelte/icons/trash-2';

	page.title = 'Encounter';
	$effect(() => {
		encounterManager.initialize();
	});
	let delMode = $state(false);

	function clear() {
		encounterManager.clear();
		delMode = false;
	}

	function del(index: number) {
		encounterManager.encounter.splice(index, 1);
		if (encounterManager.encounter.length === 0) {
			delMode = false;
		}
	}
	function clearDead() {
		encounterManager.clearDead();
		if (encounterManager.encounter.length === 0) {
			delMode = false;
		}
	}
</script>

<div class="mx-auto flex w-full max-w-lg flex-col gap-2 sm:gap-4">
	<div class="flex items-center gap-2">
		<h2 class="grow text-left text-xl font-bold">Encounter</h2>
		{#if delMode}
			<Button variant="destructive" onclick={clear}>All</Button>
			<Button variant="destructive" onclick={clearDead}>Dead</Button>
		{/if}
		<Button size="icon" variant="outline" onclick={() => (delMode = !delMode)}>
			<Trash_2 class="size-5 text-destructive" />
		</Button>
	</div>
	{#each encounterManager.encounter as npc, index (npc.id)}
		<Npc {npc} {delMode} ondelete={() => del(index)} />
	{/each}
</div>
