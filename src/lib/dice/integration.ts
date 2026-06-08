import { toast } from 'svelte-sonner';
import { evaluateDiceRoll } from './rolling';
import DiceRoll from './DiceRoll.svelte';
import { rollInfluence } from './influence.svelte';
import { owlbear } from '$lib/owlbear.svelte';
import { id } from '$lib/random';
import { sendBusDiceRoll } from '$lib/bus-roll';
import { activityLog } from '$lib/activity-log.svelte';

type RollOptions = {
	label?: string;
	context?: Record<string, number>;
	rollModifier?: number;
	characterName?: string;
	characterId?: string;
};

export async function rollDice(
	formula: string,
	{ label, context, rollModifier, characterName, characterId }: RollOptions = {}
) {
	const influence = rollInfluence.value;
	const primary = rollInfluence.primary;
	rollModifier = (rollModifier ?? 0) + influence;
	const result = await evaluateDiceRoll(formula, context, rollModifier, primary);
	activityLog.logRoll({
		characterId,
		characterName,
		formula,
		result: result.value,
		label,
		rollModifier,
		influence,
		primary,
		isCrit: result.isCrit,
		isMiss: result.isMiss,
	});
	toast(DiceRoll, {
		componentProps: { formula, label, rollModifier, result, primaryoffset: primary },
		class:
			'[--initial-height:7.5rem]! bg-gray-200! dark:bg-gray-800! dark:text-white! border-gray-400!',
	});
	const rollId = id();
	await owlbear.sendDiceRoll(result, rollId, label, characterName, rollModifier);
	await sendBusDiceRoll(result, rollId, label, characterName, rollModifier);
	rollInfluence.reset();
	return result;
}
