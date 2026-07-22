<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Icons } from '$lib/icons';
	import { allLanguages } from '$lib/nimble';

	type Props = {
		languages: string[];
		onchange: () => void;
	};

	let { languages = $bindable(), onchange }: Props = $props();
	let newLanguage = $state('');
	let customLanguages = $derived(
		languages.filter((language) => !allLanguages.some((builtIn) => builtIn === language))
	);

	function updateLanguages(next: string[]) {
		languages = [...new Set(next)];
		onchange();
	}

	function setBuiltIn(language: string, checked: boolean) {
		updateLanguages(
			checked
				? [...languages, language]
				: languages.filter((knownLanguage) => knownLanguage !== language)
		);
	}

	function addCustomLanguage() {
		const language = newLanguage.trim();
		if (!language) return;
		if (
			!languages.some((knownLanguage) => knownLanguage.toLowerCase() === language.toLowerCase())
		) {
			updateLanguages([...languages, language]);
		}
		newLanguage = '';
	}

	function renameCustomLanguage(current: string, next: string) {
		const language = next.trim();
		if (!language) {
			updateLanguages(languages.filter((knownLanguage) => knownLanguage !== current));
			return;
		}
		if (
			languages.some(
				(knownLanguage) =>
					knownLanguage !== current && knownLanguage.toLowerCase() === language.toLowerCase()
			)
		) {
			return;
		}
		updateLanguages(
			languages.map((knownLanguage) => (knownLanguage === current ? language : knownLanguage))
		);
	}
</script>

<Card.Root>
	<Card.Content class="flex items-start gap-3 py-3 sm:py-3">
		<h4 class="shrink-0 font-semibold">Languages</h4>
		<div class="text-muted-foreground min-w-0 grow text-right text-sm">
			{languages.length ? languages.join(', ') : 'None'}
		</div>
		<Sheet.Root>
			<Sheet.Trigger
				class={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-6' })}
			>
				<Icons.Pencil class="size-4" />
				<span class="sr-only">Edit languages</span>
			</Sheet.Trigger>
			<Sheet.Content side="right" class="w-full overflow-y-auto sm:max-w-sm">
				<Sheet.Header>
					<Sheet.Title>Languages</Sheet.Title>
					<Sheet.Description>
						Choose from the standard languages or add languages unique to this character.
					</Sheet.Description>
				</Sheet.Header>

				<div class="flex flex-col gap-6 px-4 pb-8">
					<section class="grid grid-cols-2 gap-3">
						{#each allLanguages as language}
							<label class="flex items-center gap-2">
								<Checkbox
									checked={languages.includes(language)}
									onCheckedChange={(checked) => setBuiltIn(language, !!checked)}
								/>
								<span>{language}</span>
							</label>
						{/each}
					</section>

					<section class="flex flex-col gap-3">
						<h3 class="font-semibold">Custom languages</h3>
						{#each customLanguages as language}
							<div class="flex items-center gap-2">
								<Input
									aria-label="Custom language"
									value={language}
									onchange={(event) => renameCustomLanguage(language, event.currentTarget.value)}
								/>
								<Button
									variant="ghost"
									size="icon"
									onclick={() =>
										updateLanguages(
											languages.filter((knownLanguage) => knownLanguage !== language)
										)}
								>
									<Icons.Trash class="size-4" />
									<span class="sr-only">Remove {language}</span>
								</Button>
							</div>
						{/each}
						<form
							class="flex items-center gap-2"
							onsubmit={(event) => {
								event.preventDefault();
								addCustomLanguage();
							}}
						>
							<Input placeholder="Add a language" bind:value={newLanguage} />
							<Button type="submit" variant="outline" size="icon">
								<Icons.Add class="size-4" />
								<span class="sr-only">Add language</span>
							</Button>
						</form>
					</section>
				</div>
			</Sheet.Content>
		</Sheet.Root>
	</Card.Content>
</Card.Root>
