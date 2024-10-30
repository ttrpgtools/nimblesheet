import type { Spell } from './types';

export const fireSpells: Spell[] = [
	{
		name: 'Flame Dart',
		school: 'Fire',
		tier: 0,
		desc: 'Deal 1d10 damage to any target within 60 ft. Inflicts Smoldering on crit. High Levels: +5 damage every 5 levels.',
		actions: 1,
		roll: '1d10'
	},
	{
		name: "Heart's Fire",
		school: 'Fire',
		tier: 0,
		desc: 'Give an ally within 20 ft. an extra Action. High Levels: +10 ft. range every 5 levels.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Ignite',
		school: 'Fire',
		tier: 1,
		desc: 'Deal 4d10 damage to a Smoldering target within 60 ft., ending the condition. Upcast: +2d10 damage.',
		actions: 2,
		roll: '4d10'
	},
	{
		name: 'Enchant Weapon',
		school: 'Fire',
		tier: 2,
		desc: '(Concentration, 1min) A weapon you touch is enchanted with magical flame for 1 minute. It deals +KEY damage and inflicts Smoldering on crit. Upcast: +KEY damage.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Flame Barrier',
		school: 'Fire',
		tier: 3,
		desc: '(Reaction, when you would Defend) Defend for free, until the start of your next turn, melee attackers against you take KEY damage and gain Smoldering. Upcast: +KEY damage.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Pyroclasm',
		school: 'Fire',
		tier: 4,
		desc: 'Other creatures within 15 ft. of you take 6d10 damage on a failed DEX save, half on save. Smoldering creatures automatically fail. Upcast: +5 ft. to the explosion radius.',
		actions: 3,
		roll: '6d10'
	},
	{
		name: 'Fiery Embrace',
		school: 'Fire',
		tier: 5,
		desc: '(Concentration, 1min) All other creatures within 60 ft. are Smoldering. While Smoldering this way, ALL damage Resistance is suppressed and Immunity is reduced to Resistance. Upcast: +30 ft. radius for each additional mana spent.',
		actions: 2,
		roll: ''
	},
	{
		name: 'Living Inferno',
		school: 'Fire',
		tier: 7,
		desc: 'You become a pillar of living flame. Until the end of your next turn gain the effects of Flame Barrier. At the end of this turn and your next turn, cast Pyroclasm for free. Upcast: +10 ft. speed for the duration for each additional mana spent.',
		actions: 3,
		roll: ''
	},
	{
		name: 'Dragonform',
		school: 'Fire',
		tier: 9,
		desc: 'You take the form of a Huge Red Dragon. Gain 3 Actions, 10x LVL temp HP, a flying speed of 80 ft., LVL Armor, and: • Tooth & Claw: Reach 10 ft., 1d20+LVL Slashing damage. Inflicts Smoldering, ignores Armor. • Immolating Breath: 60 ft. cone. DC 20 DEX save, LVL d6 damage, half on save. Smoldering targets fail. You can maintain this form for as long as the temp HP granted by this spell remains (max. 10 minutes). When it ends, you drop to 0 HP.',
		actions: 6,
		roll: '1d20+[LVL]'
	}
];

export const iceSpells: Spell[] = [
	{
		name: 'Ice Lance',
		school: 'Ice',
		tier: 0,
		desc: 'Deal 1d6 damage to a target within 90 ft. Advantage against creatures that are slowed. High Levels: +3 cold damage every 5 levels.',
		actions: 1,
		roll: '1d6'
	},
	{
		name: 'Biting Fog',
		school: 'Ice',
		tier: 0,
		desc: '(Concentration, up to 1 minute.) Create a 10 ft. opaque cube of icy fog adjacent to you. Creatures in it are Blinded and take 1d6 damage when you create it and at the end of their turn. High Levels: +3 damage every 5 levels.',
		actions: 1,
		roll: '1d6'
	},
	{
		name: 'Glacial Shard',
		school: 'Ice',
		tier: 1,
		desc: 'Deal 3d6 damage to a target within 90 ft. On a critical hit a medium or smaller target is knocked prone. Advantage against slowed creatures. Upcast: Increase the size by 1 and +1d6 damage.',
		actions: 2,
		roll: '3d6'
	},
	{
		name: 'Frost Shield',
		school: 'Ice',
		tier: 2,
		desc: '(Reaction, when you would defend.) Gain KEY temp HP, then Defend for free. Upcast: +KEY temp HP.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Frost Nova',
		school: 'Ice',
		tier: 3,
		desc: 'Creatures within 15 ft. of you take 4d6 damage. The area is difficult terrain until the end of your next turn. Surviving creatures must make a DEX save or fall Prone; creatures that were already Prone are Stunned for their next turn. Upcast: +5 ft. radius.',
		actions: 2,
		roll: '4d6'
	},
	{
		name: 'Icebound Aura',
		school: 'Ice',
		tier: 4,
		desc: '(Concentration, up to 1 minute.) The space within 90 ft. of you is difficult terrain. You and one ally within range are immune to this effect. Upcast: +2 targets.',
		actions: 2,
		roll: ''
	},
	{
		name: 'Glacier Strike',
		school: 'Ice',
		tier: 5,
		desc: 'Choose a 10x10 ft. area within 90 ft. of you. Targets in the area suffer 8d6 damage, targets adjacent to that area take half as much. The entire area permanently becomes difficult terrain. Upcast: +5 ft. initial square.',
		actions: 3,
		roll: '8d6'
	},
	{
		name: 'Cryotomb',
		school: 'Ice',
		tier: 8,
		desc: 'A creature within 90 ft. is entombed in ice on a failed STR save. While entombed they are incapacitated and immune to harm. This lasts as long as you survive, or until it melts or is destroyed by natural means. The creature may repeat the save once every 10 days. Huge or larger creatures have advantage on the save, a Small or smaller creature, disadvantage. Upcast: +5 spell save DC.',
		actions: 3,
		roll: ''
	},
	{
		name: 'Arctic Annihilation',
		school: 'Ice',
		tier: 9,
		desc: 'Any number of objects or willing creatures you choose within 90 ft., are encased in ice, incapacitated and immune to all damage and negative effects until the start of their next turn. All other creatures and objects within this radius take 20d6 damage. Any surviving creatures who took this damage must make a STR save or be stunned 1 round. Once you cast this spell, you must Long Rest for 1 week before using it again.',
		actions: 3,
		roll: '20d6'
	}
];

export const radiantSpells: Spell[] = [
	{
		name: 'Rebuke',
		school: 'Radiant',
		tier: 0,
		desc: 'Deal 1d6 damage to a target within 20 ft., ignoring Armor. Deal double damage against undead or cowardly (those behind cover). High Levels: +1d6 every 5 levels.',
		actions: 1,
		roll: '1d6'
	},
	{
		name: 'True Strike',
		school: 'Radiant',
		tier: 0,
		desc: 'Give yourself or an ally within 10 ft. insight into an enemy’s defenses. They gain advantage on the next attack they make until the end of their next turn. High Levels: +5 ft. range every 5 levels.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Heal',
		school: 'Radiant',
		tier: 1,
		desc: 'Touch a creature and heal it 1d6+KEY HP. Upcast: Choose one: +1 Target, +30 ft. range, +1d6 healing. If 5+ mana is spent, you may also heal 1 negative condition (e.g., Blind, Deaf, 1 Wound, etc.).',
		actions: 1,
		roll: '1d6+[KEY]'
	},
	{
		name: 'Summon Lifebinding Spirit',
		school: 'Radiant',
		tier: 1,
		desc: '(Shepherd Only) Call forth a spirit companion that faithfully follows you wherever you go. It is immune to damage and other harmful effects. It lasts until you cast it again, Long Rest, or until it has healed a number of times equal to the mana spent to summon it. Upcast: Increases its die size by 1 (max d12). Action: It attacks or heals a creature within 20ft. of you. It attacks for 1d6+WIL radiant damage (ignoring armor), or heals for the same amount.',
		actions: 1,
		roll: '1d6+[WIL]',
		onlyFor: 'Shepherd'
	},
	{
		name: 'Warding Bond',
		school: 'Radiant',
		tier: 2,
		desc: 'Designate a willing creature as your ward for 1 hour. They take half damage from all attacks, you are attacked for the other half. Upcast: +1 hour.',
		actions: 2,
		roll: ''
	},
	{
		name: 'Shield of Justice',
		school: 'Radiant',
		tier: 3,
		desc: '(Reaction, when you would defend.) Defend for free. You reflect Radiant damage back at the attacker equal to the amount blocked, ignoring Armor. Upcast: +5 Armor.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Vengeance',
		school: 'Radiant',
		tier: 4,
		desc: '(Can only target a creature that crit you or an ally since your last turn.) Deal 2d12+20 damage to a creature within 30 ft, ignoring Armor & Cover. Upcast: +1d12 damage.',
		actions: 2,
		roll: '2d12+20'
	},
	{
		name: 'Condemn',
		school: 'Radiant',
		tier: 5,
		desc: '(Can only target a creature that reduced an ally to 0 HP or attacked a Dying ally since your last turn.) Unerringly deal 50 damage to a creature within 5 ft. This damage cannot be reduced or mitigated by any means. Upcast: +10 ft. range.',
		actions: 2,
		roll: '50'
	},
	{
		name: 'Sacrifice',
		school: 'Radiant',
		tier: 6,
		desc: 'Reduce yourself to 0 HP. You can not have more than 0 HP until you Long Rest. Heal a number of HP equal to your maximum HP, divided as you choose to any number of other creatures within 60 ft. You may revive a creature that has died in the past minute if you give them at least 20 HP (also healing 2 Wounds from them), provided they have not been revived with this spell before. Upcast: +30 ft. range.',
		actions: 2,
		roll: ''
	},
	{
		name: 'Redeem',
		school: 'Radiant',
		tier: 9,
		desc: '(Casting Time: 24 hours. Requires a diamond worth at least 10,000 gp which this spell consumes.) Revive any number of deceased creatures within 1 mile that have died in the past year, provided they have not died of old age or been revived with this spell before.',
		actions: -1,
		roll: ''
	}
];

export const necroticSpells: Spell[] = [
	{
		name: 'Shadow Blast',
		school: 'Necrotic',
		tier: -1,
		desc: '(Shadowmancer Only.) Deal 1d12+WIL damage to a target within 60 ft. 1/round. Higher Levels: +1d12 every 5 levels.',
		actions: 1,
		roll: '1d12+[WIL]',
		onlyFor: 'Shadowmancer'
	},
	{
		name: 'Summon Shadow',
		school: 'Necrotic',
		tier: -1,
		desc: '(Shadowmancer Only.) Summon a d12 shadow minion adjacent to yourself (the maximum number of minions you can summon this way is equal to your INT or LVL, whichever is lower). Your shadow minions follow the normal minion rules: They have 1 HP, no damage modifier, and do not crit. Additionally, as an Action (1/turn) you may command ALL of your minions to move up to 30 ft. and attack an adjacent target. They abandon you immediately outside of combat.',
		actions: 1,
		roll: '',
		onlyFor: 'Shadowmancer'
	},
	{
		name: 'Entice',
		school: 'Necrotic',
		tier: 0,
		desc: 'On a failed WIT save, a target within 60 ft. takes 1d6 damage and moves 10 ft. nearer to you. Repeat until they save or cannot move any longer. High Levels: Increment the die size 1 step every 5 levels (d6 → d8 → d10 → d12 → d20).',
		actions: 1,
		roll: '1d6'
	},
	{
		name: 'Withering Touch',
		school: 'Necrotic',
		tier: 0,
		desc: 'Touch a target and deal 1d12 damage. They are considered undead until the end of your next turn. High Levels: +6 damage every 5 levels.',
		actions: 1,
		roll: '1d12'
	},
	{
		name: 'Shadow Trap',
		school: 'Necrotic',
		tier: 1,
		desc: '(Concentration, up to 1 minute.) The next creature to move adjacent to you suffers 3d12 damage and a medium or smaller creature is also Grappled by shadowy tendrils. Upcast: +1d12 damage.',
		actions: 2,
		roll: '3d12'
	},
	{
		name: 'Voidcloak',
		school: 'Necrotic',
		tier: 1,
		desc: '(Concentration, 1 minute.) Wrap yourself in horrifying living shadow. Melee attacks against you have disadvantage. The first creature that makes a melee attack against you each round, first takes 1d12 damage. Upcast: +1d12 damage.',
		actions: 2,
		roll: '1d12'
	},
	{
		name: 'Vampiric Greed',
		school: 'Necrotic',
		tier: 3,
		desc: 'Deal 4d12 damage to all other creatures within 5 ft., heal HP equal to the damage done. Any surviving creatures make a STR save, you gain 1 Wound for each creature that saves. Upcast: +1 save DC.',
		actions: 3,
		roll: '4d12'
	},
	{
		name: 'Greater Shadow',
		school: 'Necrotic',
		tier: 4,
		desc: 'Summon a 5d12 Greater Shadow minion (max 1) adjacent to you. When it dies, it explodes into 5 shadow minions (see Summon Shadow)—place them anywhere within 20 ft. Upcast: +1d12 damage, +1 shadow.',
		actions: 3,
		roll: '5d12'
	},
	{
		name: 'Gangrenous Burst',
		school: 'Necrotic',
		tier: 5,
		desc: '(Damaged creatures within 20 ft. make a failed STR save.) Damaged creatures within 20 ft. take 6d12 damage on a failed STR save, made with disadvantage while Bloodied. Upcast: +1d12 damage.',
		actions: 3,
		roll: '6d12'
	},
	{
		name: 'Unspeakable Word',
		school: 'Necrotic',
		tier: 6,
		desc: 'A target within 60 ft. dies on a failed WIT save. If they succeed, you drop to 0 HP instead. The target has disadvantage if they are Bloodied, advantage if they are unharmed. Upcast: +1 save DC.',
		actions: 3,
		roll: ''
	},
	{
		name: 'Creeping Death',
		school: 'Necrotic',
		tier: 7,
		desc: 'Deal 8d12 damage to a creature within 60 ft. If this kills the creature, it violently erupts and you MUST deal the same amount of damage to another creature within 60 ft. of it that has not yet been damaged by this effect. Repeat until a creature survives this damage or no other creatures are in range.',
		actions: 3,
		roll: '8d12'
	}
];

export const lightningSpells: Spell[] = [
	{
		name: 'Zap',
		school: 'Lightning',
		tier: 0,
		desc: 'Deal 2d8 damage to a target within 90 ft. If this misses, the lightning fails to find ground and strikes you instead. High Levels: +4 damage every 5 levels.',
		actions: 1,
		roll: '2d8'
	},
	{
		name: 'Electrical Discharge',
		school: 'Lightning',
		tier: 0,
		desc: '(Can only be cast if you are charged.) Inerrantly deal 2d8 damage to all other creatures within 10 ft. of you. High Levels: +4 damage every 5 levels.',
		actions: 1,
		roll: '2d8'
	},
	{
		name: 'Arc Lightning',
		school: 'Lightning',
		tier: 1,
		desc: 'Deal 3d8 damage to a target within 90 ft. The bolt also strikes the next closest creature to your target. If this attack misses, the lightning fails to find ground and strikes you instead. Upcast: +1d8 damage.',
		actions: 2,
		roll: '3d8'
	},
	{
		name: 'Alacrity',
		school: 'Lightning',
		tier: 2,
		desc: 'After your roll initiative, add KEY to the roll (once). Upcast: +1 to your initiative.',
		actions: 0, // Free action
		roll: ''
	},
	{
		name: 'Chain Lightning',
		school: 'Lightning',
		tier: 3,
		desc: 'A 10 ft. wide, 60 ft. long bolt of lightning originates from you, dealing 5d8 damage to all creatures in the area on a failed DEX save, half on save. Creatures wielding a large amount of metal automatically fail (e.g., wearing metal armor, or wielding a 2-handed metal weapon). Upcast: +1d8 damage.',
		actions: 3,
		roll: '5d8'
	},
	{
		name: 'Electrickery',
		school: 'Lightning',
		tier: 4,
		desc: '(Reaction, when a creature within 90 ft. takes an action.) Switch the places of one willing creature and another creature in range. If one was the target of an attack or effect, the other becomes the new target. An unwilling target makes a WIT save to resist. Costs 2 Mana and 1 Action while Charged or Dying. Upcast: +1 spell save DC.',
		actions: 2,
		roll: ''
	},
	{
		name: 'Electrocharge',
		school: 'Lightning',
		tier: 5,
		desc: '(Concentration, up to 1 minute.) A target you touch gains +1 max Action, +5 Armor, double Speed, and advantage on DEX saves. Upcast: +1 minute duration.',
		actions: 3,
		roll: ''
	},
	{
		name: 'Ride the Lightning',
		school: 'Lightning',
		tier: 6,
		desc: 'You temporarily turn into a living bolt of lightning and strike with thunderous noise. Teleport up to 90 ft. away to a spot you can see. If a willing creature occupies that spot, you change places with them. Creatures within 15 ft. take 10d8 damage. Surviving creatures must make a STR save or also be hurled back 20 ft., knocked prone, and deafened for 1 day. If a creature falls by 10 or more, they are also stunned for 1 round. Upcast: +60 ft. range and +10 damage.',
		actions: 3,
		roll: '10d8'
	},
	{
		name: 'Seething Storm',
		school: 'Lightning',
		tier: 9,
		desc: '(Concentration, up to 1 minute. Costs 3 Actions to maintain each turn.) You are enveloped in a 20 ft. radius cloud of tempestuous storm that follows you; you gain a flying speed and move for free 1/round; and attacks against you are made with disadvantage. Up to 6 different creatures you choose within the area are unerringly struck by a bolt of lightning, taking 10d8 damage (a creature can only be struck once per round). Each round the storm grows in radius by 10 ft. and the number of bolts of lightning increases by 2. Once you cast this spell, you must Long Rest for 1 week before you can use it again.',
		actions: 3,
		roll: '10d8'
	}
];

export const windSpells: Spell[] = [
	{
		name: 'Razor Wind',
		school: 'Wind',
		tier: 0,
		desc: 'Deal 1d4 slashing damage to up to 2 adjacent targets within 90 ft. Vicious (roll an additional die whenever this crits). High Levels: +2 damage every 5 levels.',
		actions: 1,
		roll: '1d4'
	},
	{
		name: 'Breath of Life',
		school: 'Wind',
		tier: 0,
		desc: 'Restore 1 HP to a Dying creature within 30 ft. High Levels: +10 ft. range every 5 levels.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Vicious Mockery',
		school: 'Wind',
		tier: 0,
		desc: '(Songweaver Only.) Range 60 ft. 1d4+INT psychic damage (ignores armor). The target’s next attack is made with disadvantage (+3 damage every 5th level).',
		actions: 1,
		roll: '1d4+[INT]',
		onlyFor: 'Songweaver'
	},
	{
		name: 'Blustery Gale',
		school: 'Wind',
		tier: 1,
		desc: 'Deal 3d4 slashing damage to a target within 90 ft. Move a medium or smaller target 5 ft. Advantage against flying or small/tiny targets and move them twice as far. Vicious. Upcast: +5 ft. movement.',
		actions: 2,
		roll: '3d4'
	},
	{
		name: 'Barrier of Wind',
		school: 'Wind',
		tier: 2,
		desc: '(Reaction, when you would Defend.) Ranged attacks have disadvantage against you until the start of your next turn (including the triggering attack), then Defend for free. Upcast: +2 Armor.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Fly',
		school: 'Wind',
		tier: 3,
		desc: '(Concentration, up to 10 minutes.) A gust of living wind lifts a target you touch effortlessly into the air. They gain a flying speed of 60 ft. for the duration. Upcast: +1 target.',
		actions: 2,
		roll: ''
	},
	{
		name: 'Eye of the Storm',
		school: 'Wind',
		tier: 4,
		desc: 'Enemies within 15 ft. of you take 6d4+10 slashing damage. Move affected surviving creatures anywhere within 5 ft. of the storm’s radius on a failed STR save. Upcast: +5 ft. radius.',
		actions: 3,
		roll: '6d4+10'
	},
	{
		name: 'Updraft',
		school: 'Wind',
		tier: 5,
		desc: 'Choose a 25x25 ft. square area within 60 ft., enemy creatures there must roll a DEX save until they succeed. For each time they failed they are whisked into the air 10 ft. landing prone at the end of your turn (falling damage is 1d6 damage per 10 ft.). Upcast: +1 spell save DC.',
		actions: 3,
		roll: '1d6'
	},
	{
		name: 'Thousand Cuts',
		school: 'Wind',
		tier: 6,
		desc: 'Target a creature within 90 ft. and roll 12d4. This attack does not miss, and EVERY die explodes on a 4. Also damages all enemies within 5 ft. of your target. Upcast: +5 ft. radius.',
		actions: 3,
		roll: '12d4'
	},
	{
		name: 'Boisterous Gale',
		school: 'Wind',
		tier: 7,
		desc: '(Concentration, up to 1 minute.) You and up to 12 allies gain a flying speed of 60 ft., can move up to their speed for free once each round, and ranged attacks have disadvantage against you. Upcast: +1 minute or +2 targets.',
		actions: 3,
		roll: ''
	}
];

export const utilitySpells: Spell[] = [
	{
		name: 'Kindle',
		school: 'Fire',
		tier: 0, // Utility spell, doesn't use mana
		desc: 'Use the power of fire magic to conjure a single minor visual illusion or make something warmer. Or: Ignite a small, unheld item within 30 ft.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Fire Step',
		school: 'Fire',
		tier: 0, // Utility spell
		desc: 'Casting time: 1 minute. Touch a fire source and teleport to another fire source you can see.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Firebrand',
		school: 'Fire',
		tier: 0, // Utility spell
		desc: 'Touch a surface and secretly mark it with a symbol or brief message. Speaking a chosen command word reveals the hidden mark.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Chillcraft',
		school: 'Ice',
		tier: 0, // Utility spell
		desc: 'Use your power over ice and water to: Chill. Harmlessly freeze, thaw, or move a bath-sized amount of water near you. Or: Craft. Conjure a sheet of opaque, mirror-like, or transparent ice no bigger than a window or small door.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Ice Disk',
		school: 'Ice',
		tier: 0, // Utility spell
		desc: 'Casting time: 1 minute. Conjure a disk of ice that floats just above the ground and follows you. It can carry up to 250 lbs of weight for 1 hour or until you cast it again.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Wintry Scrying',
		school: 'Ice',
		tier: 0, // Utility spell
		desc: 'Casting time: 10 minutes. Turn a small patch of water into a reflective icy mirror. Looking through it grants you vision of any desired location near this same body of water for 10 minutes.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Spark Step',
		school: 'Lightning',
		tier: 0, // Utility spell
		desc: 'Teleport a metal object within 20 ft.',
		actions: 1,
		roll: ''
	},
	{
		name: "Tempest's Command",
		school: 'Lightning',
		tier: 0, // Utility spell
		desc: 'Harness the power of lightning magic to: Dispel a minor magical effect, or temporarily suppress a stronger one (the more powerful an enchantment, the shorter the duration), OR Voice of Thunder. For 1 minute your eyes flash with lightning and your voice is greatly amplified to a booming, thunder-like volume.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Spark Buddy',
		school: 'Lightning',
		tier: 0, // Utility spell
		desc: 'Casting time: 1 minute. Conjure a tiny electrical helper about the size of a squirrel for up to 1 hour. It can perform simple tasks you request of it such as fetch a small object (max 1 pound), open an unlocked door, glow brightly to illuminate a small area, or harmlessly shock creatures. If it takes damage or moves further than 30 ft. away from you, it dissipates into harmless sparks.',
		actions: 1,
		roll: ''
	},
	{
		name: 'False Face',
		school: 'Necrotic',
		tier: 0, // Utility spell
		desc: 'Casting time: 1 minute. Change your appearance to look like someone else for 10 minutes. You replicate a piece of that person.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Grave',
		school: 'Necrotic',
		tier: 0, // Utility spell
		desc: 'Use your power over necrotic magic to: Gravemark. Soil a surface with blood, filth, or other disgusting things, OR Gravework. Casting time 1 minute: Shape/move a body-sized plot of earth.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Thought Leech',
		school: 'Necrotic',
		tier: 0, // Utility spell
		desc: 'Read the surface thoughts of a creature within 30 ft. Unwilling creatures can sense you doing this and may not like it.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Light',
		school: 'Radiant',
		tier: 0, // Utility spell
		desc: 'Cause an item to brightly glow with radiant light for as long as you hold it.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Beautify',
		school: 'Radiant',
		tier: 0, // Utility spell
		desc: 'Clean dirt or stains from an item, repair a small tear or break in a non-magical item, or conjure tiny beautiful things: flowers, butterflies, etc.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Bond of Peace',
		school: 'Radiant',
		tier: 0, // Utility spell
		desc: 'You may telepathically communicate simple thoughts or feelings with a friendly creature you can see. Alternatively, you can imbue your spoken words with calming magic, granting advantage on any check made to soothe anger or fear in a creature within range.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Whispered on the Wind',
		school: 'Wind',
		tier: 0, // Utility spell
		desc: 'You whisper a message into the wind and it will be secretly carried to a specified target within 100 miles.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Helpful Gust',
		school: 'Wind',
		tier: 0, // Utility spell
		desc: 'Gently move a tiny unheld item within 30 ft. in any direction; or generate an illusory scent.',
		actions: 1,
		roll: ''
	},
	{
		name: 'Feather Fall',
		school: 'Wind',
		tier: 0, // Utility spell (Reaction)
		desc: 'Reaction: cause a falling creature within 30 ft. to gently float to the ground unharmed.',
		actions: 1,
		roll: ''
	}
];
