import { getRandomInt } from "../random";

const numberlike = /^-?\d+(\.\d+)?$/;

export function isNumeric(potential: string) {
  return numberlike.test(potential);
}

export function roll(sides: number) {
  return getRandomInt(1, sides);
}

export function rolls(sides: number, count = 5) {
  return Array.from(Array(count), () => roll(sides));
}

export function bestRoll(dice: number[]) {
  return dice.reduce((p, c) => Math.max(roll(c), p), 0);
}

export function total(dice: number[]) {
  return dice.reduce((p, c) => p + c, 0);
}

type DieType = "normal" | "primary" | "dropped" | "exploded" | "vicious";
class NimbleDie {
  sides: number;
  value: number;
  position: number;
  type: DieType;

  constructor(sides: number, type: DieType = "normal") {
    this.sides = sides;
    this.value = getRandomInt(1, sides);
    this.position = getRandomInt(0, 1000);
    this.type = type;
  }

  isMax() {
    return this.sides === this.value;
  }

  isMin() {
    return this.value === 1;
  }

  get sortPosition() {
    return this.position + (this.type === "dropped" ? 2000 : 0);
  }
}

const sortValueHighPosition = (a: NimbleDie, b: NimbleDie) =>
  a.value === b.value ? a.sortPosition - b.sortPosition : b.value - a.value;
const sortValueLowPosition = (a: NimbleDie, b: NimbleDie) =>
  a.value === b.value ? a.sortPosition - b.sortPosition : a.value - b.value;

function nrolls(sides: number, count = 5) {
  return Array.from(Array(count), () => new NimbleDie(sides));
}

function blowUp(primary: NimbleDie, explode: boolean, vicious: boolean) {
  if (!primary.isMax()) return [];
  const extra: NimbleDie[] = [];
  let crit = true;
  while (crit) {
    crit = false;
    if (vicious) {
      extra.push(new NimbleDie(primary.sides, "vicious"));
    }
    if (explode) {
      const eroll = new NimbleDie(primary.sides, "exploded");
      extra.push(eroll);
      crit = eroll.isMax();
    }
  }
  return extra;
}

function smoosh(formula: string) {
  return formula.replace(/\s/g, "").replace(/([\dv!])-/g, "$1+-");
}

class NimbleRoller {
  formula: string;
  value: number = 0;
  dice: NimbleDie[] = [];

  constructor(formula: string) {
    this.formula = formula;
  }

  parseTerm(term: string) {
    if (!term) return 0;
    const neg = term.at(0) === "-";
    //console.log(`term = ${term}`);
    if (neg) term = term.substring(1);
    const removals = { h: 0, l: 0 };
    let explode = false;
    let vicious = false;
    term = term.replace(/r([hl])(\d*)/, (_, dir: "h" | "l", num: string) => {
      removals[dir] += +(num || "1");
      return "";
    });
    term = term.replace(/v/, () => {
      vicious = true;
      return "";
    });
    term = term.replace(/!/, () => {
      explode = true;
      return "";
    });
    const [count, sides] = term.split("d");
    if (!sides) return 0;
    //console.log(
    //  `count = ${count} sides = ${sides} explode = ${explode} vicious = ${vicious} removals = ${removals}`
    //);
    const nsides = parseInt(sides, 10);
    const results = nrolls(nsides, parseInt(count || "1", 10));
    results.sort(sortValueHighPosition);
    for (let highs = 0; highs < removals.h; highs += 1) {
      results[highs].type = "dropped";
    }
    results.sort(sortValueLowPosition);
    for (let lows = 0; lows < removals.l; lows += 1) {
      results[lows].type = "dropped";
    }
    results.sort((a, b) => a.sortPosition - b.sortPosition);
    results[0].type = "primary";

    const extra = blowUp(results[0], explode, vicious);
    const value =
      results
        .concat(extra)
        .filter((d) => d.type !== "dropped")
        .reduce((p, c) => p + c.value, 0) * (neg ? -1 : 1);
    this.dice.push(...results);
    this.dice.push(...extra);
    //console.log(value);
    return value;
  }

  async roll() {
    if (!this.formula) return;
    //console.log(`formula = ${this.formula}`);
    const terms = smoosh(this.formula).split("+");
    const value = terms.reduce(
      (p, c) => p + (isNumeric(c) ? +c : this.parseTerm(c)),
      0
    );
    //console.log(value);
    this.value = value;
    return value;
  }
}

// 2d6+2, 1 -> 3d6rl1+2
// 2d6v!, 1 -> 3d6rl1v!
function integrateModifier(expression: string, modifier: number) {
  if (modifier === 0) return expression;
  return smoosh(expression).replace(
    /(\d*)(d\d+)/g,
    (_, count, size) =>
      `${+(count || "1") + Math.abs(modifier)}${size}r${
        modifier > 0 ? `l` : `h`
      }${Math.abs(modifier)}`
  );
}

export async function evaluateDiceRoll(
  expression: string,
  context: Record<string, number> = {},
  modifier: number = 0
) {
  //console.log(`Evaluating = ${expression}`, context, modifier);
  expression = expression.replace(/\[([^\]]+)\]/g, (_, key) => {
    if (key in context) {
      return context[key].toString();
    } else {
      throw new Error(`Context key '${key}' not found from '${expression}'`);
    }
  });
  expression = integrateModifier(expression, modifier);
  const roller = new NimbleRoller(expression);
  await roller.roll();
  return roller;
}
