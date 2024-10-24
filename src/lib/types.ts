export type Stat = "STR" | "DEX" | "INT" | "WIL";
export type Save = "STR" | "DEX" | "WIT";
export type Alteration = 1 | -1;
export type Die = "d4" | "d6" | "d8" | "d10" | "d12" | "d20";
export type Skill = { name: string; type: Stat; extra: number };
export type Resource = { name: string; max: number; current: number };
export type Inventory = { name: string; roll: string; bulky?: boolean };

export type MagicSchool =
  | "Fire"
  | "Ice"
  | "Lightning"
  | "Wind"
  | "Necrotic"
  | "Radiant";
export type Spell = {
  name: string;
  school: MagicSchool;
  tier: number;
  desc: string;
  actions: number;
  roll: string;
  onlyFor?: string;
};

export interface NimbleClass {
  name: string;
  key: Stat[];
  saves: Partial<Record<Save, Alteration>>;
  die: Die;
  startHp: number;
  magicSchools?: MagicSchool[];
}
