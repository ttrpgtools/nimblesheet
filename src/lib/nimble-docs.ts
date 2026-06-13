const BASE = 'https://nimblenomicon.pages.dev/';

export function spellUrl(name: string): string {
	const slug = name
		.trim()
		.replace(/'/g, ' ')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	return `${BASE}spells/${slug}/`;
}

export function openRule(path: string): void {
	window.open(BASE + path, 'nimble-docs');
}

export type FieldDoc = { desc: string; url: string };

export const statDocs: Record<string, FieldDoc> = {
	Armor: {
		desc: 'Reduces damage taken. Defaults to your DEX modifier.',
		url: BASE + 'core-rules/#armor',
	},
	HP: {
		desc: 'Current hit points. Reaching 0 HP gives you a Wound.',
		url: BASE + 'core-rules/#hit-points--dying',
	},
	HD: {
		desc: 'Hit dice spent on a short rest to recover HP. Roll your hit die + STR.',
		url: BASE + 'core-rules/#hit-dice',
	},
	Init: {
		desc: 'Roll 1d20 + DEX at the start of combat. 1–9 = 1 action, 10–19 = 2, 20+ = 3.',
		url: BASE + 'core-rules/#starting-combat',
	},
	Speed: {
		desc: 'Spaces moved per Move action. Default is 6.',
		url: BASE + 'core-rules/#speed--range',
	},
};

export const cardDocs: Record<string, FieldDoc> = {
	Save: {
		desc: 'Roll 1d20 + stat when the world acts on you. Each class has one +1 and one −1 save bonus.',
		url: BASE + 'core-rules/#skill-checks--saves',
	},
	Actions: {
		desc: 'Up to 3 actions per turn, set by your initiative roll at the start of combat. Resets to 3 at end of turn.',
		url: BASE + 'core-rules/#heroic-actions',
	},
	Wounds: {
		desc: 'Gained each time you reach 0 HP. Accumulated wounds lead toward death.',
		url: BASE + 'core-rules/#wounds',
	},
};

export const manaDoc: FieldDoc = {
	desc: "Mana powers your spells. Max mana is based on your class's key stat and level.",
	url: BASE + 'core-rules/#cast-spell',
};

export const inventoryUrl = BASE + 'core-rules/#7-inventory-slots';
export const skillsUrl = BASE + 'core-rules/#skills';

export const skillDescs: Record<string, string> = {
	Arcana:
		'Your understanding of magical phenomena, spells, and enchantments. With Arcana, you can identify magical effects, decipher arcane symbols, and discern the properties of magical items. It also grants insights into the abilities and weaknesses of magical beings like Aberrations, Elementals, and Oozes.',
	Examination:
		'Your aptitude for thorough analysis and deduction. Use Examination to diagnose injuries, determine causes of death, uncover clues, and unravel the workings of traps or mechanical devices. It also grants insights into the abilities and weaknesses of Constructs.',
	Finesse:
		'Your ability to use your hands and feet in careful ways. Use Finesse for activities such as picking locks, disarming traps, piloting vehicles, tinkering, card tricks, stealing or planting items, climbing a mossy wall, or any other task that requires precise, careful movement.',
	Influence:
		'Your persuasiveness, charm, and ability to influence others through charisma or cunning. Use Influence to convince or deceive people, negotiate deals, build trust, win allies to your cause, or put on a captivating performance.',
	Insight:
		'Your ability to understand people and situations beyond the obvious. Use Insight to sense motives, detect lies, read hidden emotions, make sense of clues, and when faced with uncertainty—you can think ahead or just "get" what is happening.',
	Lore: 'Your understanding of the history of civilization, kingdoms, and religions. Use Lore to recall historical events and grasp the significance of cultural practices. It extends to knowledge of the abilities and behavior of Celestials, Dragons, Fey, Fiends, Giants, Humanoids, and Undead.',
	Might:
		'Your ability to apply strength effectively. Use Might for lifting heavy objects, breaking through obstacles, climbing, swimming, jumping, or performing feats of strength.',
	Naturecraft:
		'Your expertise in wilderness survival, navigation, tracking, and the handling of animals. Use Naturecraft to thrive in the wild, identify flora, fauna, and track creatures with precision. It encompasses knowledge of Beasts, Monstrosities, and Plants, providing insights into their behavior, habitats, and characteristics.',
	Perception:
		"Your overall ability to notice subtle details in your surroundings. Use Perception to spot hidden objects, detect secret passages, sense subtle environmental changes, and sense when you're being followed or observed.",
	Stealth:
		'Your proficiency in staying unseen and moving quietly. Use Stealth to hide, slip past guards, evade detection, and move without drawing attention.',
};

export type RuleLink = { label: string; path: string };
export type RuleGroup = { label: string; links: RuleLink[] };

const CR = 'core-rules/';

export const ruleGroups: RuleGroup[] = [
	{
		label: 'Basics',
		links: [
			{ label: 'How to Be a Good Player', path: CR + '#how-to-be-a-good-player' },
			{ label: 'Stats', path: CR + '#stats' },
			{ label: 'Skills', path: CR + '#skills' },
			{ label: 'Skill Checks & Saves', path: CR + '#skill-checks--saves' },
			{ label: 'Advantage & Disadvantage', path: CR + '#advantage--disadvantage' },
			{ label: 'Size', path: CR + '#size' },
		],
	},
	{
		label: 'Character',
		links: [
			{ label: 'The Character Sheet', path: CR + '#the-character-sheet' },
			{ label: 'Leveling Up', path: CR + '#leveling-up' },
			{ label: 'Hit Points & Dying', path: CR + '#hit-points--dying' },
			{ label: 'Wounds', path: CR + '#wounds' },
			{ label: 'Temporary HP', path: CR + '#temporary-hp' },
			{ label: 'Hit Dice', path: CR + '#hit-dice' },
			{ label: 'Speed & Range', path: CR + '#speed--range' },
			{ label: 'Adventuring Motivation', path: CR + '#adventuring-motivation' },
		],
	},
	{
		label: 'Classes',
		links: [
			{ label: 'Berserker', path: 'classes/berserker/' },
			{ label: 'The Cheat', path: 'classes/the-cheat/' },
			{ label: 'Commander', path: 'classes/commander/' },
			{ label: 'Hunter', path: 'classes/hunter/' },
			{ label: 'Mage', path: 'classes/mage/' },
			{ label: 'Oathsworn', path: 'classes/oathsworn/' },
			{ label: 'Shadowmancer', path: 'classes/shadowmancer/' },
			{ label: 'Shepherd', path: 'classes/shepherd/' },
			{ label: 'Songweaver', path: 'classes/songweaver/' },
			{ label: 'Stormshifter', path: 'classes/stormshifter/' },
			{ label: 'Zephyr', path: 'classes/zephyr/' },
		],
	},
	{
		label: 'Ancestries',
		links: [
			{ label: 'Human', path: 'ancestries/human/' },
			{ label: 'Dwarf', path: 'ancestries/dwarf/' },
			{ label: 'Elf', path: 'ancestries/elf/' },
			{ label: 'Halfling', path: 'ancestries/halfling/' },
			{ label: 'Gnome', path: 'ancestries/gnome/' },
			{ label: 'Bunbun', path: 'ancestries/bunbun/' },
			{ label: 'Dragonborn', path: 'ancestries/dragonborn/' },
			{ label: 'Fiendkin', path: 'ancestries/fiendkin/' },
			{ label: 'Goblin', path: 'ancestries/goblin/' },
			{ label: 'Kobold', path: 'ancestries/kobold/' },
			{ label: 'Orc', path: 'ancestries/orc/' },
			{ label: 'Birdfolk', path: 'ancestries/birdfolk/' },
			{ label: 'Celestial', path: 'ancestries/celestial/' },
			{ label: 'Changeling', path: 'ancestries/changeling/' },
			{ label: 'Crystalborn', path: 'ancestries/crystalborn/' },
			{ label: 'Dryad/Shroomling', path: 'ancestries/dryad-shroomling/' },
			{ label: 'Half-Giant', path: 'ancestries/half-giant/' },
			{ label: 'Minotaur/Beastfolk', path: 'ancestries/minotaur-beastfolk/' },
			{ label: 'Oozeling/Construct', path: 'ancestries/oozeling-construct/' },
			{ label: 'Planarbeing', path: 'ancestries/planarbeing/' },
			{ label: 'Ratfolk', path: 'ancestries/ratfolk/' },
			{ label: 'Stoatling', path: 'ancestries/stoatling/' },
			{ label: 'Turtlefolk', path: 'ancestries/turtlefolk/' },
			{ label: 'Wyrdling', path: 'ancestries/wyrdling/' },
		],
	},
	{
		label: 'Backgrounds',
		links: [
			{ label: 'Back Out of Retirement', path: 'backgrounds/back-out-of-retirement/' },
			{ label: 'Devoted Protector', path: 'backgrounds/devoted-protector/' },
			{ label: 'Academy Dropout', path: 'backgrounds/academy-dropout/' },
			{ label: 'Made a BAD Choice', path: 'backgrounds/made-a-bad-choice/' },
			{ label: 'Haunted Past', path: 'backgrounds/haunted-past/' },
			{ label: 'Ear to the Ground', path: 'backgrounds/ear-to-the-ground/' },
			{ label: "What? I've Been Around", path: 'backgrounds/what-i-ve-been-around/' },
			{ label: 'Acrobat', path: 'backgrounds/acrobat/' },
			{ label: 'Wild One', path: 'backgrounds/wild-one/' },
			{ label: 'Fey Touched', path: 'backgrounds/fey-touched/' },
			{ label: 'Survivalist', path: 'backgrounds/survivalist/' },
			{ label: 'Home at Sea', path: 'backgrounds/home-at-sea/' },
			{ label: 'At Home Underground', path: 'backgrounds/at-home-underground/' },
			{ label: 'Raised by Goblins', path: 'backgrounds/raised-by-goblins/' },
			{ label: 'Change It Up!', path: 'backgrounds/change-it-up/' },
			{ label: 'History Buff', path: 'backgrounds/history-buff/' },
			{ label: '(Former) Con Artist', path: 'backgrounds/former-con-artist/' },
			{ label: '(Secretly) Undead', path: 'backgrounds/secretly-undead/' },
			{ label: 'Taste for the Finer Things', path: 'backgrounds/taste-for-the-finer-things/' },
			{ label: 'Fearless', path: 'backgrounds/fearless/' },
			{ label: "So Dumb I'm Smart Sometimes", path: 'backgrounds/so-dumb-i-m-smart-sometimes/' },
			{ label: 'Wily Underdog', path: 'backgrounds/wily-underdog/' },
			{ label: 'Bumblewise', path: 'backgrounds/bumblewise/' },
			{ label: 'Accidental Acrobat', path: 'backgrounds/accidental-acrobat/' },
			{ label: 'Tradesman/Artisan', path: 'backgrounds/tradesman-artisan/' },
			{ label: 'Make It Your Own!', path: 'backgrounds/make-it-your-own/' },
		],
	},
	{
		label: 'Conditions',
		links: [
			{ label: 'Blinded', path: 'conditions/blinded/' },
			{ label: 'Bloodied', path: 'conditions/bloodied/' },
			{ label: 'Charmed', path: 'conditions/charmed/' },
			{ label: 'Dazed', path: 'conditions/dazed/' },
			{ label: 'Dying', path: 'conditions/dying/' },
			{ label: 'Frightened', path: 'conditions/frightened/' },
			{ label: 'Grappled/Restrained', path: 'conditions/grappled-restrained/' },
			{ label: 'Hampered', path: 'conditions/hampered/' },
			{ label: 'Incapacitated', path: 'conditions/incapacitated/' },
			{ label: 'Invisible', path: 'conditions/invisible/' },
			{ label: 'Petrified', path: 'conditions/petrified/' },
			{ label: 'Poisoned', path: 'conditions/poisoned/' },
			{ label: 'Prone', path: 'conditions/prone/' },
			{ label: 'Riding', path: 'conditions/riding/' },
			{ label: 'Slowed', path: 'conditions/slowed/' },
			{ label: 'Taunted', path: 'conditions/taunted/' },
			{ label: 'Wounded', path: 'conditions/wounded/' },
		],
	},
	{
		label: 'Combat',
		links: [
			{ label: 'Starting Combat', path: CR + '#starting-combat' },
			{ label: 'Surprise', path: CR + '#surprise' },
			{ label: 'Turn Order', path: CR + '#turn-order' },
			{ label: 'Turns, Rounds & Encounters', path: CR + '#turns-rounds--encounters' },
			{ label: 'Acting Over Multiple Turns', path: CR + '#acting-over-multiple-turns' },
			{ label: 'Heroic Actions', path: CR + '#heroic-actions' },
			{ label: '— Attack', path: CR + '#attack' },
			{ label: '— Cast Spell', path: CR + '#cast-spell' },
			{ label: '— Move', path: CR + '#move' },
			{ label: '— Assess', path: CR + '#assess' },
			{ label: '— Free Actions', path: CR + '#free-actions' },
			{ label: 'Heroic Reactions', path: CR + '#heroic-reactions' },
			{ label: '— Defend', path: CR + '#defend' },
			{ label: '— Interpose', path: CR + '#interpose' },
			{ label: '— Opportunity Attack', path: CR + '#opportunity-attack' },
			{ label: '— Help', path: CR + '#help' },
			{ label: 'Concentration', path: CR + '#concentration' },
			{ label: 'Cover & Hiding', path: CR + '#cover--hiding' },
			{ label: 'Grappling', path: CR + '#grappling' },
			{ label: 'Monsters & Armor', path: CR + '#monsters--armor' },
			{ label: 'Minions', path: CR + '#minions' },
		],
	},
	{
		label: 'Rest & Downtime',
		links: [
			{ label: 'Field Rests', path: CR + '#field-rests' },
			{ label: '— Catch Breath', path: CR + '#catch-breath' },
			{ label: '— Make Camp', path: CR + '#make-camp' },
			{ label: 'Safe Rest', path: CR + '#safe-rest' },
			{ label: 'Downtime', path: CR + '#downtime' },
		],
	},
	{
		label: 'Equipment',
		links: [
			{ label: 'Armor', path: CR + '#armor' },
			{ label: 'Weapon Properties', path: CR + '#weapon-properties' },
			{ label: 'Melee Weapons', path: CR + '#melee-weapons' },
			{ label: 'Ranged Weapons', path: CR + '#ranged-weapons' },
			{ label: 'Key Equipment', path: CR + '#key-equipment' },
			{ label: 'Misc Adventuring Equipment', path: CR + '#misc-adventuring-equipment' },
			{ label: 'Magical Items', path: CR + '#magical-items' },
			{ label: 'Spell Scrolls & Wands', path: CR + '#spell-scrolls--wands' },
		],
	},
	{
		label: 'Magic',
		links: [
			{ label: 'Cast Spell', path: CR + '#cast-spell' },
			{ label: 'Upcasting Spells', path: CR + '#upcasting-spells' },
			{ label: 'Fire Spells', path: CR + '#fire-spells' },
			{ label: 'Ice Spells', path: CR + '#ice-spells' },
			{ label: 'Lightning Spells', path: CR + '#lightning-spells' },
			{ label: 'Wind Spells', path: CR + '#wind-spells' },
			{ label: 'Radiant Spells', path: CR + '#radiant-spells' },
			{ label: 'Necrotic Spells', path: CR + '#necrotic-spells' },
			{ label: 'Utility Spells', path: CR + '#utility-spells' },
		],
	},
];
