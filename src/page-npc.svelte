<script lang="ts">
	import { Icons } from '$lib/icons';
	import NpcSheet from '$lib/NpcSheet.svelte';
	import { npcManager } from '$lib/character-manager.svelte';
	import { page } from '$lib/page.svelte';

	$effect(() => {
		page.title = npcManager.active?.name ?? '';
	});
	$effect(() => {
		npcManager.initialize();
	});
</script>

{#if npcManager.active}
	<NpcSheet character={npcManager.active} onchange={npcManager.saveActive} />
{:else}
	<div class="flex min-h-[300px] items-center justify-center">
		<Icons.Loader class="size-12 animate-spin" />
	</div>
{/if}
