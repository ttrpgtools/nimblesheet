<script lang="ts">
	import { Icons } from '$lib/icons';
	import CharacterSheet from '$lib/CharacterSheet.svelte';
	import { charManager } from '$lib/character-manager.svelte';
	import { page } from '$lib/page.svelte';
	import { owlbear } from '$lib/owlbear.svelte';

	$effect(() => {
		page.title = charManager.active?.name ?? '';
	});
	$effect(() => {
		charManager.initialize();
	});
	async function save() {
		charManager.saveActive();
		if (charManager.active) {
			owlbear.saveCharacterToOwlbear(charManager.active);
		}
	}
</script>

{#if charManager.active}
	<CharacterSheet bind:character={charManager.active} onchange={save} />
{:else}
	<div class="flex min-h-[300px] items-center justify-center">
		<Icons.Loader class="size-12 animate-spin" />
	</div>
{/if}
