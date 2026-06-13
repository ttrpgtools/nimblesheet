<script lang="ts">
	import * as Popover from '$lib/components/ui/popover';
	import { Icons } from '$lib/icons';
	import type { FieldDoc } from '$lib/nimble-docs';
	import type { Snippet } from 'svelte';

	type Props = {
		doc: FieldDoc;
		class?: string;
		children: Snippet;
	};
	let { doc, class: className, children }: Props = $props();
</script>

<Popover.Root>
	<Popover.Trigger class={className}>{@render children()}</Popover.Trigger>
	<Popover.Content>
		{#if doc.desc}<p class="text-sm">{doc.desc}</p>{/if}
		<a class="mt-2 block text-muted-foreground" href={doc.url} target="nimble-docs">
			<Icons.BookOpenText class="size-4" />
		</a>
	</Popover.Content>
</Popover.Root>
