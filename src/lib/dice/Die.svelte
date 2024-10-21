<script lang="ts" module>
import D4, { value as d4 } from "./D4.svelte";
import D6, { value as d6 } from "./D6.svelte";
import D8, { value as d8 } from "./D8.svelte";
import D10, { value as d10 } from "./D10.svelte";
import D12, { value as d12 } from "./D12.svelte";
import D20, { value as d20 } from "./D20.svelte";
import D100, { value as d100 } from "./D100.svelte";
const dMap = new Map();
dMap.set(d4, D4);
dMap.set(d6, D6);
dMap.set(d8, D8);
dMap.set(d10, D10);
dMap.set(d12, D12);
dMap.set(d20, D20);
dMap.set(d100, D100);

export function knownDie(sides: number) {
  return dMap.has(sides);
}
</script>
<script lang="ts">
  let { which, size = 'size-6' } : { which: number; size?: string; } = $props();
  let Die = $derived(dMap.get(which));
</script>
{#if Die}
<Die {size} />
{/if}