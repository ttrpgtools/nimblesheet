<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "$lib/utils.js";

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<div
	class={cn("bg-card text-card-foreground -mx-4 sm:mx-0 sm:rounded-lg border-t sm:border sm:shadow-sm", className)}
	{...$$restProps}
>
	<slot />
</div>
