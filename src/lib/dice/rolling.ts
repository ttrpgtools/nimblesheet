import { stopImmediatePropagation } from 'svelte/legacy';
import { getRandomInt } from '../random';

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

type DieType = 'normal' | 'primary' | 'dropped' | 'exploded' | 'vicious';
class NimbleDie {
	sides: number;
	value: number;
	position: number;
	type: DieType;

	constructor(sides: number, type: DieType = 'normal') {
		this.sides = sides;
		this.value = getRandomInt(1, sides);
		this.position = getRandomInt(0, 1000);
		this.type = type;
	}

	get isMax() {
		return this.sides <= this.value;
	}

	get isMin() {
		return this.value <= 1;
	}

	get sortPosition() {
		return this.position + (this.type === 'dropped' ? 2000 : 0);
	}

	toJSON() {
		return {
			sides: this.sides,
			value: this.value,
			position: this.position,
			type: this.type,
			isMax: this.isMax,
			isMin: this.isMin,
		};
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
	if (!primary.isMax) return [];
	const extra: NimbleDie[] = [];
	let crit = true;
	while (crit) {
		crit = false;
		if (vicious) {
			extra.push(new NimbleDie(primary.sides, 'vicious'));
		}
		if (explode) {
			const eroll = new NimbleDie(primary.sides, 'exploded');
			extra.push(eroll);
			crit = eroll.isMax;
		}
	}
	return extra;
}

function smoosh(formula: string) {
	return formula.replace(/\s/g, '').replace(/([\dv!])-/g, '$1+-');
}

class NimbleRoller {
	formula: string;
	value: number = 0;
	dice: NimbleDie[] = [];

	constructor(formula: string) {
		this.formula = formula;
	}

	get isCrit() {
		return this.dice.find((x) => x.type === 'primary')?.isMax;
	}

	get isMiss() {
		return this.dice.find((x) => x.type === 'primary')?.isMin;
	}
	// Handle 3D6rl1
	parseTerm(term: string): number {
		if (!term) return 0;
		if (term.includes('*')) {
			const product = term
				.split('*')
				.reduce((p, c) => p * (isNumeric(c) ? +c : this.parseTerm(c)), 1);
			return product;
		}
		const neg = term.at(0) === '-';
		//console.log(`term = ${term}`);
		if (neg) term = term.substring(1);
		const removals = { h: 0, l: 0 };
		let explode = false;
		let vicious = false;
		let primaryoffset = 0;
		term = term.replace(/r([hl])(\d*)/, (_, dir: 'h' | 'l', num: string) => {
			removals[dir] += +(num || '1');
			return '';
		});
		term = term.replace(/v/, () => {
			vicious = true;
			return '';
		});
		term = term.replace(/!/, () => {
			explode = true;
			return '';
		});
		term = term.replace(/p([pm])(\d*)/, (_, op: 'p' | 'm', num: string) => {
			primaryoffset = (op === 'm' ? -1 : 1) * (num ? parseInt(num, 10) : 1);
			return '';
		});
		const [count, sides] = term.split('d');
		if (!sides) return 0;
		//console.log(
		//  `count = ${count} sides = ${sides} explode = ${explode} vicious = ${vicious} removals = ${removals}`
		//);
		let results: NimbleDie[] = [];
		let placeValues = false;
		if (sides.includes(',')) {
			if (count && count !== '1') {
				console.warn(
					'Invalid dice formula. If you use the dX,X,X syntax, you cannot have a multiplier in front of it.'
				);
				return 0;
			}
			placeValues = true;
			results = sides.split(',').map((side) => new NimbleDie(parseInt(side, 10)));
		} else {
			const nsides = parseInt(sides, 10);
			results = nrolls(nsides, parseInt(count || '1', 10));
		}
		results.sort(sortValueHighPosition);
		for (let highs = 0; highs < removals.h; highs += 1) {
			results[highs].type = 'dropped';
		}
		results.sort(sortValueLowPosition);
		for (let lows = 0; lows < removals.l; lows += 1) {
			results[lows].type = 'dropped';
		}
		results.sort((a, b) => a.sortPosition - b.sortPosition);

		let extra: NimbleDie[] = [];
		if (placeValues) {
			let place = 0;
			for (let index = results.length - 1; index >= 0; index -= 1) {
				if (results[index].type !== 'dropped') {
					results[index].value = results[index].value * 10 ** place;
					place += 1;
				}
			}
		} else {
			results[0].type = 'primary';
			results[0].value += primaryoffset;
			extra = blowUp(results[0], explode, vicious);
		}
		const value =
			results
				.concat(extra)
				.filter((d) => d.type !== 'dropped')
				.reduce((p, c) => p + c.value, 0) * (neg ? -1 : 1);
		this.dice.push(...results);
		this.dice.push(...extra);
		//console.log(value);
		return value;
	}

	async roll() {
		if (!this.formula) return;
		//console.log(`formula = ${this.formula}`);
		const terms = smoosh(this.formula).split('+');
		const value = terms.reduce((p, c) => p + (isNumeric(c) ? +c : this.parseTerm(c)), 0);
		//console.log(value);
		this.value = value;
		return value;
	}

	toJSON() {
		return {
			formula: this.formula,
			value: this.value,
			dice: this.dice.map((x) => x.toJSON()),
			isCrit: this.isCrit ?? false,
			isMiss: this.isMiss ?? false,
		};
	}
}

// 2d6+2, 1 -> 3d6rl1+2
// 2d6v!, 1 -> 3d6rl1v!
function integrateModifier(expression: string, modifier: number) {
	if (modifier === 0) return expression;
	return smoosh(expression).replace(
		/(\d*)(d\d+)/g,
		(_, count, size) =>
			`${+(count || '1') + Math.abs(modifier)}${size}r${
				modifier > 0 ? `l` : `h`
			}${Math.abs(modifier)}`
	);
}

function integrateOffset(expression: string, offset: number) {
	if (offset === 0) return expression;
	return smoosh(expression).replace(
		/(\d*)(d\d+)/g,
		(_, count, size) =>
			`${count}${size}p${offset > 0 ? `p` : `m`}${Math.abs(offset) === 1 ? '' : Math.abs(offset)}`
	);
}

export async function evaluateDiceRoll(
	expression: string,
	context: Record<string, number> = {},
	modifier: number = 0,
	primaryoffset: number = 0
) {
	//console.log(`Evaluating = ${expression}`, context, modifier);
	expression = expression.replace(/\[([^\]]+)\]/g, (_, key) => {
		if (key in context) {
			return context[key].toString();
		} else {
			throw new Error(`Context key '${key}' not found from '${expression}'`);
		}
	});
	expression = integrateOffset(expression, primaryoffset);
	expression = integrateModifier(expression, modifier);
	const roller = new NimbleRoller(expression);
	await roller.roll();
	return roller.toJSON();
}

export type NimbleRoll = ReturnType<NimbleRoller['toJSON']>;
