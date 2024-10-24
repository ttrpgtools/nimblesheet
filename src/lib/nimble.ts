import type { Stat, Save, Skill, NimbleClass } from "./types";

export const stats: Stat[] = ["STR", "DEX", "INT", "WIL"];
export const saves: Save[] = ["STR", "DEX", "WIT"];

export const allSkills: Skill[] = [
  { name: "Arcana", type: "INT", extra: 0 },
  { name: "Examination", type: "INT", extra: 0 },
  { name: "Finesse", type: "DEX", extra: 0 },
  { name: "Influence", type: "WIL", extra: 0 },
  { name: "Insight", type: "WIL", extra: 0 },
  { name: "Lore", type: "INT", extra: 0 },
  { name: "Might", type: "STR", extra: 0 },
  { name: "Naturecraft", type: "WIL", extra: 0 },
  { name: "Perception", type: "WIL", extra: 0 },
  { name: "Stealth", type: "DEX", extra: 0 },
];

export const allClasses: NimbleClass[] = [
  {
    name: "Berserker",
    key: ["STR", "DEX"],
    saves: {
      STR: 1,
      WIT: -1,
    },
    die: "d12",
    startHp: 20,
  },
  {
    name: "The Cheat",
    key: ["DEX", "INT"],
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
    key: ["DEX", "WIL"],
    saves: {
      DEX: 1,
      STR: -1,
    },
    die: "d8",
    startHp: 13,
  },
  {
    name: "Mage",
    key: ["INT", "WIL"],
    saves: {
      WIT: 1,
      STR: -1,
    },
    die: "d6",
    startHp: 10,
    magicSchools: ["Fire", "Ice", "Lightning"],
  },
  {
    name: "Oathsworn",
    key: ["STR", "WIL"],
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
    key: ["INT", "DEX"],
    saves: {
      WIT: 1,
      STR: -1,
    },
    die: "d8",
    startHp: 13,
    magicSchools: ["Necrotic"],
  },
  {
    name: "Shepherd",
    key: ["WIL", "STR"],
    saves: {
      WIT: 1,
      DEX: -1,
    },
    die: "d10",
    startHp: 17,
    magicSchools: ["Radiant", "Necrotic"],
  },
  {
    name: "Songweaver",
    key: ["WIL", "INT"],
    saves: {
      WIT: 1,
      STR: -1,
    },
    die: "d8",
    startHp: 13,
    magicSchools: ["Wind"],
  },
  {
    name: "Stormshifter",
    key: ["WIL", "DEX"],
    saves: {
      WIT: 1,
      STR: -1,
    },
    die: "d8",
    startHp: 13,
    magicSchools: ["Lightning", "Wind"],
  },
  {
    name: "Zephyr",
    key: ["DEX", "STR"],
    saves: {
      DEX: 1,
      WIT: -1,
    },
    die: "d8",
    startHp: 13,
  },
];
