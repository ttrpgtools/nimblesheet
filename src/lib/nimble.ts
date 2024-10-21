import type { Stat, Save, Skill, NimbleClass } from "./types";

export const stats: Stat[] = ["STR", "DEX", "INT", "WIS", "CHA"];
export const saves: Save[] = ["STR", "DEX", "WIL"];

export const allSkills: Skill[] = [
  { name: "Arcana", type: "INT", extra: 0 },
  { name: "Examination", type: "INT", extra: 0 },
  { name: "Finesse", type: "DEX", extra: 0 },
  { name: "Influence", type: "CHA", extra: 0 },
  { name: "Insight", type: "CHA", extra: 0 },
  { name: "Lore", type: "INT", extra: 0 },
  { name: "Might", type: "STR", extra: 0 },
  { name: "Naturecraft", type: "WIS", extra: 0 },
  { name: "Perception", type: "WIS", extra: 0 },
  { name: "Stealth", type: "DEX", extra: 0 },
];

export const allClasses: NimbleClass[] = [
  {
    name: "Berserker",
    key: ["STR", "DEX"],
    saves: {
      STR: 1,
      WIL: -1,
    },
    die: "d12",
    startHp: 20,
  },
  {
    name: "The Cheat",
    key: ["DEX", "CHA"],
    saves: {
      DEX: 1,
      STR: -1,
    },
    die: "d6",
    startHp: 10,
  },
  {
    name: "Commander",
    key: ["STR", "INT"],
    saves: {
      STR: 1,
      DEX: -1,
    },
    die: "d10",
    startHp: 17,
  },
  {
    name: "Hunter",
    key: ["DEX", "WIS"],
    saves: {
      DEX: 1,
      STR: -1,
    },
    die: "d8",
    startHp: 13,
  },
  {
    name: "Mage",
    key: ["INT", "WIS"],
    saves: {
      WIL: 1,
      STR: -1,
    },
    die: "d6",
    startHp: 10,
    magicSchools: ["Fire", "Ice", "Lightning"],
  },
  {
    name: "Oathsworn",
    key: ["STR", "CHA"],
    saves: {
      STR: 1,
      DEX: -1,
    },
    die: "d10",
    startHp: 17,
    magicSchools: ["Radiant"],
  },
  {
    name: "Shadowmancer",
    key: ["CHA", "INT"],
    saves: {
      WIL: 1,
      STR: -1,
    },
    die: "d8",
    startHp: 13,
    magicSchools: ["Necrotic"],
  },
  {
    name: "Shepherd",
    key: ["WIS", "STR"],
    saves: {
      WIL: 1,
      DEX: -1,
    },
    die: "d10",
    startHp: 17,
    magicSchools: ["Radiant", "Necrotic"],
  },
  {
    name: "Songweaver",
    key: ["CHA", "INT"],
    saves: {
      WIL: 1,
      STR: -1,
    },
    die: "d8",
    startHp: 13,
    magicSchools: ["Wind"],
  },
  {
    name: "Stormshifter",
    key: ["WIS", "DEX"],
    saves: {
      WIL: 1,
      STR: -1,
    },
    die: "d8",
    startHp: 13,
    magicSchools: ["Lightning", "Wind"],
  },
  {
    name: "Zephyr",
    key: ["DEX", "WIS"],
    saves: {
      DEX: 1,
      STR: -1,
    },
    die: "d8",
    startHp: 13,
  },
];
