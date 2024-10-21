import { allSkills } from "./nimble";
import { debouncedPersist } from "./persist";
import { id } from "./random";
import {
  type Die,
  type Inventory,
  type Resource,
  type Skill,
  type Stat,
} from "./types";

function serializeCharacter(character: NimbleCharacter) {
  return {
    id: $state.snapshot(character.id),
    created: $state.snapshot(character.created),
    touched: $state.snapshot(character.touched),
    name: $state.snapshot(character.name),
    charClass: $state.snapshot(character.charClass),
    ancestry: $state.snapshot(character.ancestry),
    size: $state.snapshot(character.size),
    level: $state.snapshot(character.level),
    hitdie: $state.snapshot(character.hitdie),
    stats: $state.snapshot(character.stats),
    skills: $state.snapshot(character.skills),
    armor: $state.snapshot(character.armor),
    hp: $state.snapshot(character.hp),
    maxHp: $state.snapshot(character.maxHp),
    tempHp: $state.snapshot(character.tempHp),
    hd: $state.snapshot(character.hd),
    maxHd: $state.snapshot(character.maxHd),
    initiative: $state.snapshot(character.initiative),
    speed: $state.snapshot(character.speed),
    wounds: $state.snapshot(character.wounds),
    inventory: $state.snapshot(character.inventory),
    utilspells: $state.snapshot(character.utilspells),
    resources: $state.snapshot(character.resources),
    notes: $state.snapshot(character.notes),
  };
}

function deserializeCharacter(data: CharacterSave) {
  const newChar = new NimbleCharacter();
  newChar.id = data.id;
  newChar.created = data.created;
  newChar.touched = data.touched;
  newChar.name = data.name;
  newChar.charClass = data.charClass;
  newChar.ancestry = data.ancestry;
  newChar.size = data.size;
  newChar.level = data.level;
  newChar.hitdie = data.hitdie;
  newChar.stats = data.stats;
  newChar.skills = data.skills;
  newChar.armor = data.armor;
  newChar.hp = data.hp;
  newChar.maxHp = data.maxHp;
  newChar.tempHp = data.tempHp;
  newChar.hd = data.hd;
  newChar.maxHd = data.maxHd;
  newChar.initiative = data.initiative;
  newChar.speed = data.speed;
  newChar.wounds = data.wounds;
  newChar.inventory = data.inventory;
  newChar.utilspells = data.utilspells;
  newChar.resources = data.resources;
  newChar.notes = data.notes;
  return newChar;
}

export class NimbleCharacter {
  id = id();
  created = new Date().toISOString();
  touched = new Date().toISOString();
  name: string = $state("");
  charClass: string = $state("");
  ancestry: string = $state("");
  size: string = $state("");
  level: number = $state(1);
  hitdie: Die | undefined = $state();
  stats: Record<Stat, string> = $state({
    STR: "0",
    DEX: "0",
    INT: "0",
    WIS: "0",
    CHA: "0",
  });
  skills: Skill[] = $state(structuredClone(allSkills));
  armor: string = $state("0");
  hp: string = $state("0");
  maxHp: string = $state("0");
  tempHp: string = $state("0");
  hd: string = $state("1");
  maxHd: string = $state("1");
  initiative: string = $state("0");
  speed: string = $state("30");
  wounds: number = $state(0);
  inventory: Inventory[] = $state([]);
  utilspells: Record<string, boolean> = $state({});
  resources: Resource[] = $state([]);
  notes: string = $state("");

  toJSON() {
    return serializeCharacter(this);
  }

  static load(save: CharacterSave) {
    return deserializeCharacter(save);
  }

  save() {
    debouncedPersist(this);
    console.log(this.toJSON());
  }
}

export type CharacterSave = ReturnType<typeof serializeCharacter>;
