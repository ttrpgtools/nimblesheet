class Confirmable {
	confirming = $state(false);
	ready = $state(false);
	onconfirm: () => void;

	constructor(onconfirm: () => void) {
		this.onconfirm = onconfirm;
	}

	onclick = () => {
		if (!this.confirming) {
			this.confirming = true;
			setTimeout(() => (this.ready = true), 350);
			setTimeout(() => {
				this.ready = false;
				this.confirming = false;
			}, 4000);
		} else if (this.ready) {
			this.confirming = false;
			this.ready = false;
			this.onconfirm();
		}
	};
}

export function createConfirm(onconfirm: () => void) {
	return new Confirmable(onconfirm);
}
