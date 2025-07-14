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
		side?: 'left' | 'top';
	}
	let {
		confirmText,
		onconfirm,
		children,
		size,
		variant,
		class: className,
		side = 'top',
	}: Props = $props();

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
			class={[
				'absolute z-10 w-max rounded border-0 bg-rose-500 px-2 py-1 text-center text-sm text-white',
				side === 'top' && 'helper-top top-0 left-1/2 max-w-full',
				side === 'left' && 'helper-left top-1/2 left-0',
			]}
			transition:fade={{ duration: 175 }}
		>
			<span
				class={[
					'nib absolute z-10 h-0 w-0 ',
					side === 'top' &&
						'bottom-0 left-1/2 -translate-x-1/2 translate-y-[90%] border-x-[0.5rem] border-t-[0.5rem] border-b-0 border-x-transparent border-t-rose-500 border-b-transparent',
					side === 'left' &&
						'top-1/2 right-0 -translate-y-1/2 translate-x-[90%] border-y-[0.5rem] border-r-0 border-l-[0.5rem] border-y-transparent border-r-transparent border-l-rose-500',
				]}
			></span>
			{confirmText}
		</span>
	{/if}
</span>

<style>
	.helper-top {
		transform: translate3d(-50%, calc(-100% + -1rem), 0);
	}
	.helper-left {
		transform: translate3d(calc(-100% + -1rem), -50%, 0);
	}
</style>
