<script lang="ts">
	type Props = {
		size?: string;
		dir: 'up' | 'down';
		save: 1 | 0 | -1;
	};
	let { size = 'size-6', dir, save }: Props = $props();
	let filled = $derived((save === 1 && dir === 'up') || (save === -1 && dir === 'down'));
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 320 512"
	class="{size} {dir === 'up' ? `` : `rotate-180`}"
	fill="currentColor"
>
	{#if filled}
		<path d="M0 272L160 128 320 272v48H0V272z" />
	{:else}
		<path
			d="M32 288l256 0 0-1.7L160 171 32 286.2l0 1.7zm0 32L0 320l0-32 0-16L160 128 320 272l0 16 0 32-32 0L32 320z"
		/>
	{/if}
</svg>
