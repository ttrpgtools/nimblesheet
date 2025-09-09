<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from './components/ui/button';

	import { Icons } from '$lib/icons';

	import type { Component, SvelteComponent, Snippet, ComponentType } from 'svelte';

	type Props = {
		title: string;
		// TODO: Simplify once Lucide Svelte exports Svelte 5 icon components
		icon: Component | ComponentType<SvelteComponent>;
		onnew?: () => PromiseLike<void> | void;
		footer?: Snippet<[() => void]>;
		children?: Snippet<[() => void]>;
	};

	let { title, icon: Icon, onnew, footer, children }: Props = $props();

	let sheetOpen = $state(false);
	function ondone() {
		sheetOpen = false;
	}
</script>

<Sheet.Root bind:open={sheetOpen}>
	<Sheet.Trigger>
		<Button variant="outline" size="icon" class="shrink-0">
			<Icons.Menu class="h-5 w-5" />
			<span class="sr-only">Toggle menu</span>
		</Button>
	</Sheet.Trigger>
	<Sheet.Content side="right" class="flex flex-col gap-4">
		<Sheet.Header class="flex flex-row items-center justify-between space-y-0">
			<Sheet.Title class="flex items-center gap-2 text-lg font-semibold">
				<Icon class="h-6 w-6" />
				<span class="">{title}</span>
			</Sheet.Title>
			{#if onnew}
				<Button
					variant="secondary"
					size="icon"
					class="mr-6 rounded-full"
					onclick={async () => {
						await onnew();
						ondone();
					}}
				>
					<Icons.Add class="pointer-events-none" />
					<span class="sr-only">Add new {title}</span>
				</Button>
			{/if}
		</Sheet.Header>
		<div class="overflow-y-auto">
			{@render children?.(ondone)}
		</div>
		{#if footer}
			<Sheet.Footer class="flex flex-col flex-wrap gap-2 sm:flex-col sm:space-x-0">
				{@render footer?.(ondone)}
			</Sheet.Footer>
		{/if}
	</Sheet.Content>
</Sheet.Root>
