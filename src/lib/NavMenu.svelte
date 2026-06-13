<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Icons } from '$lib/icons';
	import type { NavItem } from './types';
	import { openRule, ruleGroups } from './nimble-docs';

	type Props = {
		items: NavItem[];
		onnav: (item: NavItem) => void;
		current: NavItem;
		disabled?: boolean;
	};
	let { items, onnav, current, disabled = false }: Props = $props();

	let search = $state('');
	const filteredGroups = $derived(
		search.trim() === ''
			? ruleGroups
			: ruleGroups
					.map((g) => ({
						...g,
						links: g.links.filter((l) =>
							l.label.toLowerCase().includes(search.toLowerCase())
						),
					}))
					.filter((g) => g.links.length > 0)
	);
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger {disabled}>
		<div class="relative">
			<current.icon class="size-6" />
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
		<DropdownMenu.Separator />
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>
				<Icons.BookOpenText class="size-4" /> Rules Reference
			</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent class="flex max-h-[70vh] w-56 flex-col overflow-hidden">
				<div class="border-b px-2 py-1.5">
					<input
						class="bg-transparent w-full text-sm outline-none placeholder:text-muted-foreground"
						placeholder="Search…"
						bind:value={search}
						onkeydown={(e) => e.stopPropagation()}
					/>
				</div>
				<div class="overflow-y-auto">
					{#each filteredGroups as group, i}
						{#if i > 0}<DropdownMenu.Separator />{/if}
						<DropdownMenu.Label>{group.label}</DropdownMenu.Label>
						{#each group.links as link}
							<DropdownMenu.Item onSelect={() => openRule(link.path)}>
								{link.label}
							</DropdownMenu.Item>
						{/each}
					{/each}
					{#if filteredGroups.length === 0}
						<p class="text-muted-foreground px-2 py-3 text-sm">No results.</p>
					{/if}
				</div>
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
	</DropdownMenu.Content>
</DropdownMenu.Root>
