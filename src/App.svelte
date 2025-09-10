<script lang="ts">
	import './app.css';
	import { Icons } from '$lib/icons';
	import { Toaster } from '$lib/components/ui/sonner';

	import PageCharacter from './page-character.svelte';
	import PageNpc from './page-npc.svelte';
	import DieRollerMenu from '$lib/dice/DieRollerMenu.svelte';
	import CharacterMenu from '$lib/CharacterMenu.svelte';
	import { owlbear } from '$lib/owlbear.svelte';
	import { page } from '$lib/page.svelte';
	import type { NavItem } from '$lib/types';
	import NavMenu from '$lib/NavMenu.svelte';
	import type { Component } from 'svelte';
	import PageEncounter from './page-encounter.svelte';
	import EncounterMenu from '$lib/EncounterMenu.svelte';
	import OwlbearIcon from '$lib/icons/OwlbearIcon.svelte';
	import PageOwlbear from './page-owlbear.svelte';
	import OwlbearMenu from '$lib/OwlbearMenu.svelte';
	import ModeSwitcher from '$lib/ModeSwitcher.svelte';
	import { rollInfluence } from '$lib/dice/influence.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import Bus from '$lib/bus.svelte';

	$effect(() => {
		owlbear.loadOwlbear();
	});

	let topPos = $state(0);
	let pageTitle = $derived(page.title && topPos > 75 ? page.title : `Nimble CC`);
	const nav: NavItem[] = [
		{ id: 'char', label: 'Characters', icon: Icons.SheetLogo },
		{ id: 'npc', label: 'NPCs', icon: Icons.NpcLogo },
		{ id: 'encounter', label: 'Encounter', icon: Icons.Swords },
	];

	$effect(() => {
		if (owlbear.embedded && owlbear.ready) {
			nav.push({
				id: 'obr',
				label: 'Owlbear',
				icon: OwlbearIcon,
			});
		}
	});

	const routes: Record<string, { page: Component; menu: Component<{ type: 'char' | 'npc' }> }> = {
		char: { page: PageCharacter, menu: CharacterMenu },
		npc: { page: PageNpc, menu: CharacterMenu },
		encounter: { page: PageEncounter, menu: EncounterMenu },
		obr: { page: PageOwlbear, menu: OwlbearMenu },
	};
	let currentNav = $state(nav[0]);
	let route = $derived(routes[currentNav.id]);
	function onnav(item: NavItem) {
		currentNav = item;
	}
	let disableNav = $derived(owlbear.embedded && owlbear.role !== 'GM');
</script>

<svelte:head>
	<title>{page.title || 'Nimble CC'}</title>
</svelte:head>
<svelte:window bind:scrollY={topPos} />
<Toaster richColors duration={10000} closeButton />
<Bus src="https://bus.ttrpg.tools" />
<div class="flex min-h-screen w-full flex-col">
	<header
		class="bg-background/30 sticky top-0 z-50 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-md md:px-6"
	>
		<nav class="flex min-w-0 grow flex-row items-center gap-5 text-lg font-medium lg:gap-6">
			<h1 class="flex min-w-0 items-center gap-2 text-lg font-semibold md:text-base">
				<NavMenu items={nav} current={currentNav} {onnav} disabled={disableNav} />
				<span class="shrink truncate whitespace-nowrap">{pageTitle}</span>
			</h1>
		</nav>
		<div class="flex items-center gap-2 md:ml-auto md:gap-2 lg:gap-4">
			<div class="relative flex gap-2">
				<Button
					variant="outline"
					size="icon"
					class="rounded-full"
					title="Advantage"
					onclick={() => rollInfluence.positive()}
					><Icons.Advantage class="pointer-events-none size-6" /></Button
				>

				{#if rollInfluence.value !== 0}<Badge
						variant={rollInfluence.value < 0 ? 'destructive' : 'default'}
						class="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2"
						>{rollInfluence.value}</Badge
					>{/if}

				<Button
					variant="outline"
					size="icon"
					class="rounded-full"
					title="Disadvantage"
					onclick={() => rollInfluence.negative()}
					><Icons.Disadvantage class="pointer-events-none size-6" /></Button
				>
			</div>
			<DieRollerMenu />
		</div>

		<route.menu type={currentNav.id === 'char' ? 'char' : 'npc'} />
	</header>
	<main class="flex flex-col gap-4 p-4 md:gap-8 md:p-10">
		<route.page />
	</main>
	<footer
		class="text-muted-foreground mx-auto flex w-full max-w-lg flex-col gap-2 border-t p-4 text-sm sm:gap-4 md:mb-8"
	>
		<div class="flex items-center justify-start gap-2">
			<span>Crafted with</span>
			<span title="love" class="relative -top-px text-rose-500"
				><svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
					fill="currentColor"
					class="m-0 mt-0! inline-block size-4"
					><path
						d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"
					/></svg
				></span
			>
			<span
				>by <a
					href="https://ttrpg.tools"
					class="text-emerald-500 hover:text-emerald-600 hover:underline dark:hover:text-emerald-400"
					target="_blank">Colin</a
				> in Bermuda</span
			>
			<ModeSwitcher inline class="ml-auto" />
		</div>
		<p>
			<a href="https://nimblesheet.ttrpg.tools" class="text-blue-600 dark:text-blue-300"
				>NimbleSheet v{__VERSION__}</a
			> is an independent product published under the Nimble 3rd Party Creator License and is not affiliated
			with Nimble Co. Nimble © 2025 Nimble Co.
		</p>
	</footer>
</div>
