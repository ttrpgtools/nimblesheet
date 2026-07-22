<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Icons } from '$lib/icons';
	import { MAX_ROLL_HISTORY, rollHistory } from './history';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	$effect(() => {
		rollHistory.initialize();
	});

	const dateFormatter = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	});

	function formatDate(value: string) {
		const date = new Date(value);
		return Number.isNaN(date.valueOf()) ? value : dateFormatter.format(date);
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Content side="right" class="w-full gap-0 p-0 sm:max-w-md">
		<Sheet.Header class="border-b px-6 py-5 pr-12">
			<Sheet.Title class="flex items-center gap-2 text-lg">
				<Icons.History class="size-5" />
				Roll History
			</Sheet.Title>
			<Sheet.Description>
				{$rollHistory.length} saved {$rollHistory.length === 1 ? 'roll' : 'rolls'}. Your most recent
				{MAX_ROLL_HISTORY} are stored in this browser.
			</Sheet.Description>
		</Sheet.Header>

		<div class="min-h-0 flex-1 overflow-y-auto px-4 py-4">
			{#if $rollHistory.length}
				<ol class="flex flex-col gap-3">
					{#each $rollHistory as entry (entry.id)}
						<li class="bg-card rounded-lg border p-3 shadow-sm">
							<div class="flex items-start gap-3">
								<div
									class="{entry.result.isCrit
										? 'text-green-500'
										: entry.result.isMiss
											? 'text-red-500'
											: ''} min-w-12 text-center text-2xl font-bold"
								>
									{entry.result.value}
								</div>
								<div class="min-w-0 flex-1">
									{#if entry.label}
										<div class="truncate font-medium" title={entry.label}>{entry.label}</div>
									{/if}
									<div class="font-mono text-sm break-words">
										{entry.result.formula.replace(/\+\-/g, '-') || entry.formula}
									</div>
									<div class="text-muted-foreground mt-1 flex flex-wrap gap-x-2 text-xs">
										{#if entry.characterName}<span>{entry.characterName}</span>{/if}
										<time datetime={entry.rolledAt} title={new Date(entry.rolledAt).toString()}>
											{formatDate(entry.rolledAt)}
										</time>
									</div>
								</div>
							</div>
							{#if entry.result.dice.length}
								<div class="mt-2 flex flex-wrap gap-1 border-t pt-2">
									{#each entry.result.dice as die}
										<span
											class:line-through={die.type === 'dropped'}
											class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs {die.isMax
												? 'text-green-600 dark:text-green-400'
												: die.isMin
													? 'text-red-600 dark:text-red-400'
													: ''}"
										>
											d{die.sides}: {die.value}{die.type === 'exploded'
												? '!'
												: die.type === 'vicious'
													? 'v'
													: ''}
										</span>
									{/each}
								</div>
							{/if}
						</li>
					{/each}
				</ol>
			{:else}
				<div
					class="text-muted-foreground flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border-4 border-dashed p-8 text-center"
				>
					<Icons.Dice class="size-10" />
					<p>Your rolls will appear here.</p>
				</div>
			{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>
