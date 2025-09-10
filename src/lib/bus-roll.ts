import { isReady, send } from './bus';
import type { NimbleRoll } from './dice/rolling';
import type { RollMessage } from './owlbear-sync';
const DICE_ROLL_MESSAGE = `tools.ttrpg.obr-dicelog/roll`;
const logger = console.log.bind(console);
//const logger = (...args: any) => {};

const handleRollMessage = async ({ roll, label, character, rollModifier, rollId }: RollMessage) => {
	logger(`[BUS:handleRollMessage] Received roll`, roll);
	const pname = 'Colin';
	send({
		topic: DICE_ROLL_MESSAGE,
		payload: {
			connectionId: 'RANDOM',
			data: {
				roll,
				from: character || pname,
				label,
				rollModifier,
				rollId,
			},
		},
	});
};

export async function sendBusDiceRoll(
	roll: NimbleRoll,
	rollId: string,
	label?: string,
	character?: string,
	rollModifier?: number
) {
	const msg = { type: 'roll' as const, roll, label, character, rollModifier, rollId };
	logger(`[BUS:sendDiceRoll] Received roll`, msg);
	if (isReady()) {
		await handleRollMessage(msg);
	}
}
