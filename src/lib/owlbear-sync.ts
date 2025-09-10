import type { CharacterSave } from './character.svelte';
import type { NimbleRoll } from './dice/rolling';
import { withResolvers } from './with-resolvers';
//const logger = console.log.bind(console);
const logger = (...args: any) => {};
function getSameOriginOpener() {
	try {
		if (window.opener && window.opener.location.origin === window.location.origin) {
			return window.opener; // Same origin
		}
	} catch (e) {
		if (e instanceof DOMException && e.name === 'SecurityError') {
			return undefined; // Different origin
		}
	}
	return undefined; // No opener or different origin
}

export type RollMessage = {
	type: 'roll';
	roll: NimbleRoll;
	label?: string;
	character?: string;
	rollModifier?: number;
};

export type HailMessage = { type: 'hail' };
export type RoomAnnounceMessage = { type: 'room'; room: string };
export type CharacterShareMessage = { type: 'charshare'; character: CharacterSave };
export type SheetSendMessage = { type: 'sheetsend'; playerId: string; sheet: CharacterSave };

export type SyncMessages =
	| RollMessage
	| HailMessage
	| RoomAnnounceMessage
	| CharacterShareMessage
	| SheetSendMessage;

type SyncMessageHandlerMap = {
	[K in SyncMessages['type']]: ((message: Extract<SyncMessages, { type: K }>) => void)[];
};

const BROADCAST_CHANNEL = 'tools.ttrpg.nimblesheet/obr-sync';
class BroadcastSync {
	#bc = new BroadcastChannel(BROADCAST_CHANNEL);

	send(msg: SyncMessages) {
		this.#bc.postMessage(msg);
	}

	on(fn: (ev: MessageEvent<SyncMessages>) => void) {
		this.#bc.addEventListener('message', fn);
		const thisbc = this.#bc;
		return () => thisbc.removeEventListener('message', fn);
	}
}

class PopoutMessenger {
	url: string;
	#init = false;
	#port: MessagePort | undefined;
	#listeners: Partial<SyncMessageHandlerMap> = {};
	#broadcast: InstanceType<typeof BroadcastSync>;
	#mcresolver: (() => void) | undefined;

	// Handle messages from the #port
	#handlePortMessage: (ev: MessageEvent<SyncMessages>) => void = (ev) => {
		logger(`[SYNC:dispatcher] Raw message from port`, ev.data);
		const message = ev.data;
		if (!message || !message.type) return;
		this.#broadcast.send(message);
		this.#dispatch(message);
	};

	#handleBroadcastMessage: (ev: MessageEvent<SyncMessages>) => void = (ev) => {
		const message = ev.data;
		if (!message || !message.type) return;
		if (this.#port) {
			this.#port.postMessage(ev.data);
		}
		this.#dispatch(message);
	};

	#handleWindowMessage: (ev: MessageEvent) => void = (ev) => {
		if (ev.origin !== window.origin) return;
		if (ev.data !== 'daddy?') return;
		this.#setupPort(ev.ports[0]);
		this.#mcresolver?.();
	};

	constructor(url: string, broadcast: InstanceType<typeof BroadcastSync>) {
		this.url = url;
		this.#broadcast = broadcast;
		this.#broadcast.on(this.#handleBroadcastMessage);
		logger(`[SYNC:constructor] Wired up BC and checking for opener`);
		const parent = getSameOriginOpener();
		if (parent) {
			logger(`[SYNC:constructor] Looks like we have an opener window`);
			const channel = new MessageChannel();
			this.#setupPort(channel.port1);
			parent.postMessage('daddy?', window.origin, [channel.port2]);
		}
	}

	#dispatch(message: SyncMessages) {
		const listeners = this.#listeners[message.type] as SyncMessageHandlerMap[typeof message.type];
		logger(`[SYNC:dispatcher] About to send message to ${listeners?.length} listeners`, message);
		if (listeners) {
			(listeners as Array<(msg: typeof message) => void>).forEach((listener) => {
				listener(message);
			});
		}
	}

	#handleError: (ev: MessageEvent<any>) => void = (ev) => {
		console.error(`MESSAGE ERROR`, ev.data, ev.origin, ev.source);
	};

	#setupPort(port: MessagePort) {
		logger(`[SYNC:setupPort] Saving port and listening for messages`);
		if (this.#port) {
			logger(`[SYNC:setupPort] Discarding existing port first`);
			this.#port.removeEventListener('message', this.#handlePortMessage);
			this.#port.removeEventListener('messageerror', this.#handleError);
			this.#port.close();
		}
		this.#port = port;
		this.#port.addEventListener('message', this.#handlePortMessage);
		this.#port.addEventListener('messageerror', this.#handleError);
		this.#port.start();
	}

	disconnect() {
		if (this.#port) {
			this.#port.close();
		}
		if (this.#init) {
			window.removeEventListener('message', this.#handleWindowMessage);
		}
	}

	get active() {
		return this.#port != null;
	}

	async popout() {
		if (!this.#init) {
			logger(`[SYNC:popout] Initializing with message handler`);
			window.addEventListener('message', this.#handleWindowMessage);
			this.#init = true;
		}
		logger(`[SYNC:popout] About to popout a new tab`, this.url);
		const opened = window.open(this.url, 'nimblesheet');
		const { resolve, reject, promise } = withResolvers();
		this.#mcresolver = resolve;
		setTimeout(() => {
			reject('timeout');
			this.#mcresolver = undefined;
		}, 5000);
		return promise;
	}

	send(msg: SyncMessages) {
		logger(`[SYNC:send]`, msg);
		if (this.#port != null) {
			logger(`[SYNC:send] posting to message channel too`);
			try {
				this.#port.postMessage(msg);
			} catch (e) {
				console.error(`[SYNC:send] Couldn't postMessage`, e);
			}
		}
		this.#broadcast.send(msg);
	}

	on<T extends keyof SyncMessageHandlerMap>(type: T, fn: SyncMessageHandlerMap[T][number]) {
		if (!this.#listeners[type]) {
			this.#listeners[type] = [] as SyncMessageHandlerMap[T];
		}
		this.#listeners[type]!.push(fn);
		return () => {
			this.#listeners[type] = this.#listeners[type]!.filter(
				(x) => x !== fn
			) as SyncMessageHandlerMap[T];
		};
	}
}

export const sync = new PopoutMessenger(
	window.location.origin + window.location.pathname,
	new BroadcastSync()
);
export type IPopoutMessenger = InstanceType<typeof PopoutMessenger>;
