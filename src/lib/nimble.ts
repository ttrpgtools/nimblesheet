import type { Stat, Save, Skill, NimbleClass, Ancestry, Inventory } from './types';

export const stats: Stat[] = ['STR', 'DEX', 'INT', 'WIL'];
export const saves: Save[] = ['STR', 'DEX', 'WIT'];

export const allSkills: Skill[] = [
	{ name: 'Arcana', type: 'INT', extra: 0 },
	{ name: 'Examination', type: 'INT', extra: 0 },
	{ name: 'Finesse', type: 'DEX', extra: 0 },
	{ name: 'Influence', type: 'WIL', extra: 0 },
	{ name: 'Insight', type: 'WIL', extra: 0 },
	{ name: 'Lore', type: 'INT', extra: 0 },
	{ name: 'Might', type: 'STR', extra: 0 },
	{ name: 'Naturecraft', type: 'WIL', extra: 0 },
	{ name: 'Perception', type: 'WIL', extra: 0 },
	{ name: 'Stealth', type: 'DEX', extra: 0 }
];

export const allClasses: NimbleClass[] = [
	{
		name: 'Berserker',
		key: ['STR', 'DEX'],
		saves: {
			STR: 1,
			WIT: -1
		},
		die: 'd12',
		startHp: 20
	},
	{
		name: 'The Cheat',
		key: ['DEX', 'INT'],
		saves: {
			DEX: 1,
			STR: -1
		},
		die: 'd6',
		startHp: 10
	},
	{
		name: 'Commander',
		key: ['STR', 'INT'],
		saves: {
			STR: 1,
			DEX: -1
		},
		die: 'd10',
		startHp: 17
	},
	{
		name: 'Hunter',
		key: ['DEX', 'WIL'],
		saves: {
			DEX: 1,
			STR: -1
		},
		die: 'd8',
		startHp: 13
	},
	{
		name: 'Mage',
		key: ['INT', 'WIL'],
		saves: {
			WIT: 1,
			STR: -1
		},
		die: 'd6',
		startHp: 10,
		magicSchools: ['Fire', 'Ice', 'Lightning']
	},
	{
		name: 'Oathsworn',
		key: ['STR', 'WIL'],
		saves: {
			STR: 1,
			DEX: -1
		},
		die: 'd10',
		startHp: 17,
		magicSchools: ['Radiant']
	},
	{
		name: 'Shadowmancer',
		key: ['INT', 'DEX'],
		saves: {
			WIT: 1,
			STR: -1
		},
		die: 'd8',
		startHp: 13,
		magicSchools: ['Necrotic']
	},
	{
		name: 'Shepherd',
		key: ['WIL', 'STR'],
		saves: {
			WIT: 1,
			DEX: -1
		},
		die: 'd10',
		startHp: 17,
		magicSchools: ['Radiant', 'Necrotic']
	},
	{
		name: 'Songweaver',
		key: ['WIL', 'INT'],
		saves: {
			WIT: 1,
			STR: -1
		},
		die: 'd8',
		startHp: 13,
		magicSchools: ['Wind']
	},
	{
		name: 'Stormshifter',
		key: ['WIL', 'DEX'],
		saves: {
			WIT: 1,
			STR: -1
		},
		die: 'd8',
		startHp: 13,
		magicSchools: ['Lightning', 'Wind']
	},
	{
		name: 'Zephyr',
		key: ['DEX', 'STR'],
		saves: {
			DEX: 1,
			WIT: -1
		},
		die: 'd8',
		startHp: 13
	}
];

export const ancestries: Ancestry[] = [
	{ name: 'Human', size: 'Medium' },
	{ name: 'Elf', size: 'Medium' },
	{ name: 'Dwarf', size: 'Medium' },
	{ name: 'Halfling', size: 'Small' },
	{ name: 'Gnome', size: 'Small' },
	{ name: 'Bunbun', size: 'Small' },
	{ name: 'Dragonborn', size: 'Medium' },
	{ name: 'Kobold', size: 'Small' },
	{ name: 'Tiefling', size: 'Medium' },
	{ name: 'Goblin', size: 'Small' },
	{ name: 'Orc', size: 'Medium' },
	{ name: 'Birdfolk', size: 'Small or Medium' },
	{ name: 'Stoatling', size: 'Small' },
	{ name: 'Planarbeing', size: 'Medium' },
	{ name: 'Oozeling/Construct', size: 'Small or Medium' },
	{ name: 'Half-Giant', size: 'Large' },
	{ name: 'Changeling', size: 'Medium' },
	{ name: 'Celestial', size: 'Medium' },
	{ name: 'Dryad/Shroomlings', size: 'Small or Medium' },
	{ name: 'Minotaur/Beastfolk', size: 'Medium' },
	{ name: 'Turtlefolk', size: 'Small or Medium' }
];

export const meleeWeapons: Inventory[] = [
	{ name: 'Dagger', roll: '1d4!+[DEX]' },
	{ name: 'Sickle', roll: '1d4!v+[DEX]' },
	{ name: 'Club/Mace', roll: '1d6!+[STR]' },
	{ name: 'Hand Axe', roll: '1d6!+[STR]' },
	{ name: 'Short Sword', roll: '1d6!+[STR]' },
	{ name: 'Rapier', roll: '2d4!+[DEX]' },
	{ name: 'Staff', roll: '1d8!+[STR]' },
	{ name: 'Longsword', roll: '1d8!+[STR]' },
	{ name: 'Battleaxe', roll: '1d10!+[STR]', bulky: true },
	{ name: 'Pole Hammer', roll: '1d10!+[STR]' },
	{ name: 'Glaive', roll: '1d10!+[STR]' },
	{ name: 'Spear', roll: '1d10!+[STR]' },
	{ name: 'Greatmaul', roll: '1d12!+[STR]', bulky: true },
	{ name: 'Greataxe', roll: '2d6!+[STR]', bulky: true },
	{ name: 'Greatsword', roll: '3d4!+[STR]', bulky: true }
];

export const rangedWeapons: Inventory[] = [
	{ name: 'Sling', roll: '1d4!v+[DEX]' },
	{ name: 'Javelins', roll: '1d6!+[STR]' },
	{ name: 'Throwing Hammers', roll: '1d8!+[STR]' },
	{ name: 'Shortbow', roll: '1d6!+[DEX]' },
	{ name: 'Longbow', roll: '1d8!+[DEX]' },
	{ name: 'Crossbow', roll: '4d4!+[DEX]', bulky: true },
	{ name: 'Handheld Ballista', roll: '1d20!+[DEX]', bulky: true }
];
