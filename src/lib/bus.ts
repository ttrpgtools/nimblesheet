export type Listener<T = unknown> = (event: T) => void;
export type Unsubscribe = () => void;

export type BusEvent = unknown; // keep it generic/opinion-free

// Minimal pub/sub with topic support (no reactivity, no Svelte deps)
class Emitter {
	private map = new Map<string, Set<Listener>>();

	on<T = BusEvent>(topic: string, fn: Listener<T>): Unsubscribe {
		let set = this.map.get(topic);
		if (!set) {
			set = new Set();
			this.map.set(topic, set);
		}
		set.add(fn as Listener);
		return () => set!.delete(fn as Listener);
	}

	once<T = BusEvent>(topic: string, fn: Listener<T>): Unsubscribe {
		const off = this.on<T>(topic, (e) => {
			off();
			fn(e);
		});
		return off;
	}

	off<T = BusEvent>(topic: string, fn: Listener<T>) {
		this.map.get(topic)?.delete(fn as Listener);
	}

	emit<T = BusEvent>(topic: string, e: T) {
		const set = this.map.get(topic);
		if (!set || set.size === 0) return;
		for (const fn of Array.from(set)) {
			try {
				(fn as Listener<T>)(e);
			} catch (err) {
				console.error('bus listener error', err);
			}
		}
	}

	clear(topic?: string) {
		if (topic) this.map.delete(topic);
		else this.map.clear();
	}
}

// Singleton bus for the app
export const bus = new Emitter();

// Sender plumbing — set by the bridge when connected.
// Consumers call send() to go out over the MessagePort if present, else it no-ops/throws based on config.
let _post: ((data: unknown) => void) | null = null;

export function setSender(fn: ((data: unknown) => void) | null) {
	_post = fn;
	bus.emit('bridge:sender', { ready: !!fn });
}

export function send(data: unknown, options?: { throwIfOffline?: boolean }) {
	if (_post) {
		_post(data);
		return true;
	}
	if (options?.throwIfOffline) throw new Error('bus: sender not ready');
	return false;
}

export function isReady() {
	return !!_post;
}
