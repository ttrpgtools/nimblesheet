<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Snippet } from 'svelte';
	import { createConfirm } from './confirm.svelte';
	import { Button, type ButtonSize, type ButtonVariant } from './components/ui/button';
	import { cn } from './utils';
	import type { ClassValue } from 'clsx';
	interface Props {
		confirmText: string;
		children?: Snippet;
		onconfirm: () => void;
		size?: ButtonSize;
		variant?: ButtonVariant;
		class?: ClassValue;
	}
	let { confirmText, onconfirm, children, size, variant, class: className }: Props = $props();

	const confirm = createConfirm(onconfirm);
</script>

<span class="relative inline-block shrink-0">
	<Button
		onclick={confirm.onclick}
		variant={confirm.confirming ? `destructive` : (variant ?? `secondary`)}
		class={cn('w-full', className)}
		{size}
	>
		{#if children}{@render children()}{:else}Confirm{/if}
	</Button>
	{#if confirm.ready}
		<span
			class="helper absolute top-0 left-1/2 z-10 w-max max-w-full rounded border-0 bg-rose-500 px-2 py-1 text-center text-sm text-white"
			transition:fade={{ duration: 175 }}
		>
			<span
				class="nib absolute bottom-0 left-1/2 z-10 h-0 w-0 -translate-x-1/2 translate-y-[90%] border-x-[0.5rem] border-t-[0.5rem] border-b-0 border-x-transparent border-t-rose-500 border-b-transparent"
			></span>
			{confirmText}
		</span>
	{/if}
</span>

<style>
	.helper {
		transform: translate3d(-50%, calc(-100% + -1rem), 0);
	}
</style>
