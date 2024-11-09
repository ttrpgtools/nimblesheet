const MAX_ROLL_MOD = 9;
class RollInfluence {
	value = $state(0);

	#mod(delta: 1 | -1) {
		this.value = Math.min(this.value + delta, MAX_ROLL_MOD);
	}

	positive() {
		this.#mod(1);
	}

	reset() {
		this.value = 0;
	}

	negative() {
		this.#mod(-1);
	}
}

export const rollInfluence = new RollInfluence();
