<script lang="ts">
	import { Icons } from '$lib/icons';
	import type { MagicSchool } from './types';

	const schoolMap = {
		Fire: Icons.Fire,
		Ice: Icons.Ice,
		Lightning: Icons.Lightning,
		Necrotic: Icons.Necrotic,
		Radiant: Icons.Radiant,
		Wind: Icons.Wind,
		Utility: Icons.Utility,
	} as const;
	let {
		school,
		class: cls,
		...others
	}: { school: MagicSchool | 'Utility'; class?: string } = $props();

	const Icon = $derived(schoolMap[school]);
</script>

<Icon class={cls || 'size-4'} {...others} />
