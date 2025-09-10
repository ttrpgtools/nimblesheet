import { toast } from 'svelte-sonner';
import { evaluateDiceRoll } from './rolling';
import DiceRoll from './DiceRoll.svelte';
import { rollInfluence } from './influence.svelte';
import { owlbear } from '$lib/owlbear.svelte';
import { id } from '$lib/random';
import { sendBusDiceRoll } from '$lib/bus-roll';

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
	toast(DiceRoll, {
		componentProps: { formula, label, rollModifier, result },
		class:
			'[--initial-height:7.5rem]! bg-gray-200! dark:bg-gray-800! dark:text-white! border-gray-400!',
	});
	const rollId = id();
	await owlbear.sendDiceRoll(result, rollId, label, characterName, rollModifier);
	await sendBusDiceRoll(result, rollId, label, characterName, rollModifier);
	rollInfluence.reset();
	return result;
}
