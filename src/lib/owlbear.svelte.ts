import OBR, { type Player } from '@owlbear-rodeo/sdk';
import { NimbleCharacter, type CharacterSave } from './character.svelte';
import type { NimbleRoll } from './dice/rolling';
import {
	sync,
	type CharacterShareMessage,
	type IPopoutMessenger,
	type RollMessage,
	type RoomAnnounceMessage,
} from './owlbear-sync';

//const logger = console.log.bind(console);
const logger = (...args: any) => {};
const PLAYER_SHEET_KEY = 'tools.ttrpg.nimblesheet/sheets';
const DICE_ROLL_MESSAGE = `tools.ttrpg.obr-dicelog/roll`;
class OwlbearIntegration {
	embedded = OBR.isAvailable;
	ready = $state(OBR.isReady);
	room = $state('');
	role: '' | 'GM' | 'PLAYER' = $state('');
	characters: CharacterSave[] = $state([]);
	active: NimbleCharacter | undefined = $state();
	players: Record<string, Player> = $state({});
	#init = false;
	#sync: IPopoutMessenger;

	constructor(popMsg: IPopoutMessenger) {
		this.#sync = popMsg;
		this.#sync.on('roll', this.#handleRollMessage);
		this.#sync.on('room', this.#handleRoomMessage);
		this.#sync.on('hail', this.#handleHailMessage);
		this.#sync.on('charshare', this.#handleCharacterShareMessage);
		if (!this.embedded) {
			this.#sync.send({ type: 'hail' });
		}
	}

	#extractPlayerSheets(party: Player[]) {
		this.characters = [];
		if (this.role === 'GM') {
			for (const player of party) {
				const sheets = player.metadata[PLAYER_SHEET_KEY] as
					| Record<string, CharacterSave>
					| undefined;
				if (sheets) {
					for (const sheet of Object.values(sheets)) {
						this.characters.push(sheet);
						this.players[sheet.id] = player;
						if (sheet.id === this.active?.id) {
							this.active = NimbleCharacter.load(sheet);
						}
					}
				}
			}
		}
	}

	async loadOwlbear() {
		if (this.#init) return;
		OBR.onReady(async () => {
			this.ready = true;
			this.room = OBR.room.id;
			this.role = await OBR.player.getRole();
			if (this.role === 'GM') {
				const party = await OBR.party.getPlayers();
				this.#extractPlayerSheets(party);
			}
			OBR.player.onChange(async (player) => {
				this.role = player.role;
			});
			OBR.party.onChange(async (party) => {
				this.#extractPlayerSheets(party);
			});
		});
		this.#init = true;
	}

	#handleHailMessage = () => {
		if (this.embedded && this.room) {
			this.#sync.send({ type: 'room', room: this.room });
		}
	};

	#handleRoomMessage = ({ room }: RoomAnnounceMessage) => {
		if (!this.embedded) {
			this.room = room;
		}
	};

	#handleRollMessage = async ({ roll, label, character }: RollMessage) => {
		if (this.embedded && this.ready) {
			logger(`[OWLBEAR:handleRollMessage] Received roll`, roll);
			const pname = await OBR.player.getName();
			const rollMsg = `${character || pname} rolled ${roll.formula}${
				label ? ` (${label})` : ``
			} = ${roll.value}`;
			OBR.broadcast.sendMessage(
				DICE_ROLL_MESSAGE,
				{
					roll: rollMsg,
					from: pname,
					meta: roll.isCrit ? 'crit' : roll.isMiss ? 'miss' : '',
				},
				{ destination: 'ALL' }
			);
		}
	};

	async sendDiceRoll(roll: NimbleRoll, label?: string, character?: string) {
		const msg = { type: 'roll' as const, roll, label, character };
		logger(`[OWLBEAR:sendDiceRoll] Received roll`, msg);
		if (this.embedded && this.ready) {
			await this.#handleRollMessage(msg);
		} else {
			this.#sync.send(msg);
		}
	}

	async popout() {
		try {
			await this.#sync.popout();
			//this.#sync.send({ type: 'room', room: this.room });
		} catch {
			console.warn('[NIMBLESHEET] Popout took too long');
		}
	}

	#handleCharacterShareMessage = async ({ character }: CharacterShareMessage) => {
		if (this.embedded && this.ready && character.shared === `owlbear::${this.room}`) {
			OBR.player.setMetadata({
				[PLAYER_SHEET_KEY]: {
					[character.id]: character,
				},
			});
		}
	};

	async saveCharacterToOwlbear(character: NimbleCharacter) {
		if (!this.room || character.shared !== `owlbear::${this.room}`) return;
		const msg = { type: 'charshare' as const, character: character.toJSON() };
		if (this.embedded && this.ready) {
			await this.#handleCharacterShareMessage(msg);
		} else {
			this.#sync.send(msg);
		}
	}

	view = async (data: CharacterSave) => {
		if (!data || (this.active && this.active.id === data.id)) return;
		this.active = NimbleCharacter.load(data);
	};
}

export const owlbear = new OwlbearIntegration(sync);
