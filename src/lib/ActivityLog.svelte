<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { activityLog } from './activity-log.svelte';
	import { Icons } from '$lib/icons';
	import type { LogRollEntry, LogChangeEntry } from './types';

	let open = $state(false);

	$effect(() => {
		if (open) activityLog.load();
	});

	function formatTime(iso: string) {
		const d = new Date(iso);
		const today = new Date();
		const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
		if (d.toDateString() === today.toDateString()) return timeStr;
		return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + timeStr;
	}

	function influenceLabel(entry: LogRollEntry) {
		const parts: string[] = [];
		if (entry.influence > 0) parts.push(`Adv+${entry.influence}`);
		else if (entry.influence < 0) parts.push(`Dis${entry.influence}`);
		if (entry.primary > 0) parts.push('Opening');
		else if (entry.primary < 0) parts.push('Ant');
		return parts.join(' ');
	}
</script>

<Sheet.Root bind:open>
	<Sheet.Trigger>
		<Button variant="outline" size="icon" title="Activity Log">
			<Icons.History class="h-4 w-4" />
			<span class="sr-only">Activity Log</span>
		</Button>
	</Sheet.Trigger>
	<Sheet.Content side="right" class="flex w-96 max-w-full flex-col gap-0 p-0">
		<Sheet.Header class="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3">
			<Sheet.Title>Activity Log</Sheet.Title>
			<Button
				variant="outline"
				size="sm"
				onclick={() => activityLog.clear()}
				disabled={!activityLog.entries.length}
			>
				Clear
			</Button>
		</Sheet.Header>
		<div class="flex-1 overflow-y-auto">
			{#if !activityLog.loaded}
				<div class="flex h-24 items-center justify-center">
					<Icons.Loader class="size-6 animate-spin" />
				</div>
			{:else if !activityLog.entries.length}
				<div class="text-muted-foreground flex h-24 items-center justify-center text-sm">
					No activity yet.
				</div>
			{:else}
				<ul class="divide-y text-sm">
					{#each activityLog.entries as entry (entry.id)}
						{#if entry.kind === 'roll'}
							{@const roll = entry as LogRollEntry}
							<li class="flex flex-col gap-0.5 px-4 py-2.5">
								<div class="flex items-start justify-between gap-2">
									<span class="font-medium">{roll.label ?? roll.formula}</span>
									<span class="flex shrink-0 items-center gap-1">
										{#if roll.isCrit}
											<Badge variant="default" class="text-xs">Crit</Badge>
										{:else if roll.isMiss}
											<Badge variant="destructive" class="text-xs">Miss</Badge>
										{/if}
										<span class="text-lg font-bold leading-none">{roll.result}</span>
									</span>
								</div>
								<div class="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
									{#if roll.label}
										<span class="font-mono">{roll.formula}</span>
									{/if}
									{#if influenceLabel(roll)}
										<span class="text-amber-600 dark:text-amber-400">{influenceLabel(roll)}</span>
									{/if}
									{#if roll.rollModifier !== 0 && roll.influence === 0}
										<span>mod {roll.rollModifier > 0 ? '+' : ''}{roll.rollModifier}</span>
									{/if}
									{#if roll.characterName}
										<span class="text-muted-foreground/70">{roll.characterName}</span>
									{/if}
									<span class="ml-auto">{formatTime(roll.touched)}</span>
								</div>
							</li>
						{:else}
							{@const change = entry as LogChangeEntry}
							<li class="flex flex-col gap-0.5 px-4 py-2 text-xs">
								<div class="flex items-center justify-between gap-2">
									<span>
										<span class="font-medium">{change.field}</span>
										{#if change.from != null && change.to != null}
											<span class="text-muted-foreground"> {change.from} → {change.to}</span>
										{/if}
									</span>
									<span class="text-muted-foreground shrink-0">{formatTime(change.touched)}</span>
								</div>
								<span class="text-muted-foreground/70">{change.characterName}</span>
							</li>
						{/if}
					{/each}
				</ul>
			{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>
