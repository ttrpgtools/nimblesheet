import OBR, { type Player } from '@owlbear-rodeo/sdk';
import { NimbleCharacter, type CharacterSave } from './character.svelte';

const PLAYER_SHEET_KEY = 'tools.ttrpg.nimblesheet/sheets';
class OwlbearIntegration {
	embedded = OBR.isAvailable;
	ready = $state(OBR.isReady);
	room = $state('');
	role: '' | 'GM' | 'PLAYER' = $state('');
	characters: CharacterSave[] = $state([]);
	active: NimbleCharacter | undefined = $state();
	players: Record<string, Player> = $state({});
	#init = false;

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

	async saveCharacterToOwlbear(character: NimbleCharacter) {
		if (this.ready && character.shared === `owlbear::${this.room}`) {
			OBR.player.setMetadata({
				[PLAYER_SHEET_KEY]: {
					[character.id]: character.toJSON(),
				},
			});
		}
	}

	view = async (data: CharacterSave) => {
		if (!data || (this.active && this.active.id === data.id)) return;
		this.active = NimbleCharacter.load(data);
	};
}

export const owlbear = new OwlbearIntegration();
