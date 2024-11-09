<script lang="ts">
	import type { Named } from './types';
	import Warning from './Warning.svelte';

	let warning: ReturnType<typeof Warning> | undefined;
	let list: Named[] = $state([]);
	export async function show(chars: Named[]) {
		list = chars;
		return warning ? await warning.show() : false;
	}
</script>

<Warning
	bind:this={warning}
	title="Overwriting Characters"
	description="The following {list.length} character{list.length === 1
		? ``
		: `s`} will be overwritten by the
				data from the uploaded file."
>
	<ul class="flex flex-col gap-1 pl-8">
		{#each list as osheet (osheet.name)}
			<li class="list-disc">{osheet.name || 'Unnamed Character'}</li>
		{/each}
	</ul>
</Warning>
