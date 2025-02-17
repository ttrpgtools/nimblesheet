import { toast } from 'svelte-sonner';
import { evaluateDiceRoll } from './rolling';
import DiceRoll from './DiceRoll.svelte';
import { rollInfluence } from './influence.svelte';
import { owlbear } from '$lib/owlbear.svelte';

type RollOptions = {
	label?: string;
	context?: Record<string, number>;
	rollModifier?: number;
	characterName?: string;
};

export async function rollDice(
	formula: string,
	{ label, context, rollModifier, characterName }: RollOptions = {}
) {
	rollModifier = (rollModifier ?? 0) + rollInfluence.value;
	const result = await evaluateDiceRoll(formula, context, rollModifier);
	//@ts-expect-error DiceRoll is Svelte 5 and doesn't match the expected Svelte 4 type
	toast(DiceRoll, {
		componentProps: { formula, label, rollModifier, result },
		class: '[--initial-height:7.5rem]! bg-gray-200! dark:bg-gray-800!',
	});
	await owlbear.sendDiceRoll(result, label, characterName);
	return result;
}
