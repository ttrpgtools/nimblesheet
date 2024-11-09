<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import type { Snippet } from 'svelte';
	import { withResolvers } from './with-resolvers';

	type Props = {
		title: string;
		description?: string;
		children: Snippet;
	};

	let { title, description, children }: Props = $props();

	let open = $state(false);
	let resolver: (x: boolean | PromiseLike<boolean>) => void = () => {};
	export async function show() {
		const { resolve, promise } = withResolvers<boolean>();
		resolver = resolve;
		open = true;
		return promise;
	}
	function ok() {
		console.log(`It's ok!`);
		resolver(true);
		resolver = () => {};
		open = false;
	}
	function onOpenChange(state: boolean) {
		if (!state) {
			console.log(`Not cool!`);
			resolver(false);
			resolver = () => {};
		}
	}
</script>

<AlertDialog.Root bind:open {onOpenChange}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{title}</AlertDialog.Title>
			{#if description}
				<AlertDialog.Description>
					{description}
				</AlertDialog.Description>
			{/if}
		</AlertDialog.Header>
		{@render children()}
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={ok}>Overwrite</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
