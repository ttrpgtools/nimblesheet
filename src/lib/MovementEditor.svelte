<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Icons } from '$lib/icons';
	import { movementTypes } from '$lib/nimble';
	import type { MovementSpeed } from '$lib/types';

	type Props = {
		movements: MovementSpeed[];
		baseSpeed: number;
		onchange: () => void;
	};

	let { movements = $bindable(), baseSpeed, onchange }: Props = $props();
	let newType = $state('');
	let customMovements = $derived(
		movements.filter((movement) => !movementTypes.some((builtIn) => builtIn === movement.type))
	);

	function updateMovements(next: MovementSpeed[]) {
		movements = next;
		onchange();
	}

	function setBuiltIn(type: string, checked: boolean) {
		updateMovements(
			checked
				? [...movements, { type, speed: Math.max(0, +baseSpeed || 0) }]
				: movements.filter((movement) => movement.type !== type)
		);
	}

	function updateSpeed(type: string, speed: number) {
		updateMovements(
			movements.map((movement) =>
				movement.type === type ? { ...movement, speed: Math.max(0, speed || 0) } : movement
			)
		);
	}

	function addCustomMovement() {
		const type = newType.trim();
		if (!type) return;
		if (!movements.some((movement) => movement.type.toLowerCase() === type.toLowerCase())) {
			updateMovements([...movements, { type, speed: Math.max(0, +baseSpeed || 0) }]);
		}
		newType = '';
	}

	function renameCustomMovement(current: string, next: string) {
		const type = next.trim();
		if (!type) {
			updateMovements(movements.filter((movement) => movement.type !== current));
			return;
		}
		if (
			movements.some(
				(movement) =>
					movement.type !== current && movement.type.toLowerCase() === type.toLowerCase()
			)
		) {
			return;
		}
		updateMovements(
			movements.map((movement) => (movement.type === current ? { ...movement, type } : movement))
		);
	}
</script>

<Sheet.Root>
	<Sheet.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-5' })}>
		<Icons.Pencil class="size-3.5" />
		<span class="sr-only">Edit movement speeds</span>
	</Sheet.Trigger>
	<Sheet.Content side="right" class="w-full overflow-y-auto sm:max-w-sm">
		<Sheet.Header>
			<Sheet.Title>Movement</Sheet.Title>
			<Sheet.Description>
				Your normal Speed remains on the sheet. Add any alternative movement types available to this
				character.
			</Sheet.Description>
		</Sheet.Header>

		<div class="flex flex-col gap-6 px-4 pb-8">
			<section class="flex flex-col gap-3">
				<h3 class="font-semibold">Movement types</h3>
				{#each movementTypes as type}
					{@const movement = movements.find((item) => item.type === type)}
					<div class="grid grid-cols-[1.25rem_1fr_5rem] items-center gap-2">
						<Checkbox
							checked={!!movement}
							onCheckedChange={(checked) => setBuiltIn(type, !!checked)}
						/>
						<span>{type}</span>
						<Input
							aria-label={`${type} speed`}
							type="number"
							inputmode="numeric"
							min="0"
							disabled={!movement}
							value={movement?.speed ?? ''}
							onchange={(event) => updateSpeed(type, +event.currentTarget.value)}
						/>
					</div>
				{/each}
			</section>

			<section class="flex flex-col gap-3">
				<h3 class="font-semibold">Custom movement</h3>
				{#each customMovements as movement}
					<div class="grid grid-cols-[1fr_5rem_2.5rem] items-center gap-2">
						<Input
							aria-label="Movement type"
							value={movement.type}
							onchange={(event) => renameCustomMovement(movement.type, event.currentTarget.value)}
						/>
						<Input
							aria-label={`${movement.type} speed`}
							type="number"
							inputmode="numeric"
							min="0"
							value={movement.speed}
							onchange={(event) => updateSpeed(movement.type, +event.currentTarget.value)}
						/>
						<Button
							variant="ghost"
							size="icon"
							onclick={() =>
								updateMovements(movements.filter((item) => item.type !== movement.type))}
						>
							<Icons.Trash class="size-4" />
							<span class="sr-only">Remove {movement.type}</span>
						</Button>
					</div>
				{/each}
				<form
					class="flex items-center gap-2"
					onsubmit={(event) => {
						event.preventDefault();
						addCustomMovement();
					}}
				>
					<Input placeholder="Add movement type" bind:value={newType} />
					<Button type="submit" variant="outline" size="icon">
						<Icons.Add class="size-4" />
						<span class="sr-only">Add movement type</span>
					</Button>
				</form>
			</section>
		</div>
	</Sheet.Content>
</Sheet.Root>
