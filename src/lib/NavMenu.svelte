<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import type { NavItem } from './types';
	import { Icons } from './icons';
	import { Button } from './components/ui/button';

	type Props = {
		items: NavItem[];
		onnav: (item: NavItem) => void;
		current: NavItem;
		disabled?: boolean;
	};
	let { items, onnav, current, disabled = false }: Props = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger {disabled}>
		<div class="relative">
			<Button variant="outline" size="icon" class="shrink-0">
				<Icons.Menu class="w-5" />
			</Button>
			<span class="sr-only">Navigate to</span>
		</div>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="center">
		{#each items as item (item.id)}
			<DropdownMenu.Item onSelect={() => onnav(item)}>
				<div class="flex items-center gap-3 text-lg {current.id === item.id ? `text-svelte` : ``}">
					<item.icon class="size-5" />
					{item.label}
				</div>
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
