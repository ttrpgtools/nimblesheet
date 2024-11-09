<script lang="ts">
	import './app.css';
	import SheetLogo from 'lucide-svelte/icons/square-user-round';
	import { Toaster } from '$lib/components/ui/sonner';

	import PageCharacter from './page-character.svelte';
	import PageNpc from './page-npc.svelte';
	import DieRollerMenu from '$lib/dice/DieRollerMenu.svelte';
	import CharacterMenu from '$lib/CharacterMenu.svelte';
	import { owlbear } from '$lib/owlbear.svelte';
	import { page } from '$lib/page.svelte';
	import type { NavItem } from '$lib/types';
	import Squirrel from 'lucide-svelte/icons/squirrel';
	import Swords from 'lucide-svelte/icons/swords';
	import NavMenu from '$lib/NavMenu.svelte';
	import type { Component } from 'svelte';
	import PageEncounter from './page-encounter.svelte';
	import EncounterMenu from '$lib/EncounterMenu.svelte';
	import OwlbearIcon from '$lib/icons/OwlbearIcon.svelte';
	import PageOwlbear from './page-owlbear.svelte';
	import OwlbearMenu from '$lib/OwlbearMenu.svelte';

	$effect(() => {
		owlbear.loadOwlbear();
	});

	let topPos = $state(0);
	let pageTitle = $derived(page.title && topPos > 75 ? page.title : `Nimble CC`);
	const nav: NavItem[] = [
		{ id: 'char', label: 'Characters', icon: SheetLogo },
		{ id: 'npc', label: 'NPCs', icon: Squirrel },
		{ id: 'encounter', label: 'Encounter', icon: Swords },
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
<div class="flex min-h-screen w-full flex-col">
	<header
		class="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/30 px-4 backdrop-blur-md md:px-6"
	>
		<nav class="flex w-full flex-grow flex-row items-center gap-5 text-lg font-medium lg:gap-6">
			<h1 class="flex items-center gap-2 text-lg font-semibold md:text-base">
				<NavMenu items={nav} current={currentNav} {onnav} disabled={disableNav} />
				<span class="whitespace-nowrap">{pageTitle}</span>
			</h1>
		</nav>
		<div class="flex items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
			<DieRollerMenu />
		</div>

		<route.menu type={currentNav.id === 'char' ? 'char' : 'npc'} />
	</header>
	<main class="flex flex-col gap-4 p-4 md:gap-8 md:p-10">
		<route.page />
	</main>
</div>
