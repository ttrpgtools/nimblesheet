const MAX_ROLL_MOD = 9;
class RollInfluence {
	value = $state(0);
	primary = $state(0);

	#mod(delta: 1 | -1) {
		this.value = Math.min(this.value + delta, MAX_ROLL_MOD);
	}

	positive() {
		this.#mod(1);
	}

	reset() {
		this.value = 0;
		this.primary = 0;
	}

	negative() {
		this.#mod(-1);
	}

	opening() {
		this.primary = this.primary !== 1 ? 1 : 0;
	}

	anticipate() {
		this.primary = this.primary !== -1 ? -1 : 0;
	}
}

export const rollInfluence = new RollInfluence();
