<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import { Icons } from '$lib/icons';
	import type { ClassValue } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	let { children, class: className }: { children: Snippet; class?: ClassValue } = $props();
</script>

<Popover.Root>
	<Popover.Trigger class={className}>
		<Icons.Question class="size-4" />
	</Popover.Trigger>
	<Popover.Content>
		{@render children()}
	</Popover.Content>
</Popover.Root>
