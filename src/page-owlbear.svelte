<script lang="ts">
	import CharacterSheet from '$lib/CharacterSheet.svelte';
	import OwlbearIcon from '$lib/icons/OwlbearIcon.svelte';
	import { owlbear } from '$lib/owlbear.svelte';
	import { page } from '$lib/page.svelte';

	$effect(() => {
		page.title = owlbear.active?.name ?? '';
	});
</script>

{#if owlbear.active}
	<CharacterSheet character={owlbear.active} onchange={() => {}} />
{:else}
	<div class="flex w-full items-center justify-center py-12">
		<div
			class="flex max-w-lg flex-col items-center gap-4 rounded-lg border-4 border-dashed p-8 text-center italic text-muted-foreground"
		>
			<OwlbearIcon size="size-12" />
			Select a character from the sidebar to view it.
		</div>
	</div>
{/if}
