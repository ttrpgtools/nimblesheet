<script lang="ts">
	import { onDestroy } from 'svelte';
	import { bus, setSender } from './bus';

	type Props = {
		src: string;
		targetOrigin?: string | null;
	};

	let { src, targetOrigin }: Props = $props();

	let iframeEl: HTMLIFrameElement | null = null;
	let port: MessagePort | null = null;
	let loaded = false;

	function connect() {
		if (!iframeEl || !loaded) return;
		const origin = targetOrigin ?? new URL(src).origin;

		// close previous
		try {
			port?.close?.();
		} catch {}

		const mc = new MessageChannel();
		port = mc.port1;

		// incoming -> emit to global bus (single generic stream + topic-aware payloads if you want)
		port.onmessage = (e: MessageEvent) => {
			// If your bridge wraps messages with {topic,payload}, you can emit both a generic and topic-specific channel
			const { topic, payload } = (e.data || {}) as {
				topic?: string;
				payload?: unknown;
			};
			if (topic) {
				bus.emit(topic, payload);
				bus.emit('bridge:message', { topic, payload });
			} else {
				bus.emit('bridge:message', e.data);
			}
		};

		try {
			port.start?.();
		} catch {}

		// parent -> iframe handshake
		iframeEl.contentWindow?.postMessage({ type: 'connect' }, origin, [mc.port2]);

		// outflow: set global sender
		setSender((data) => port?.postMessage(data));

		bus.emit('bridge:open', { origin });
	}

	function onIframeLoad() {
		loaded = true;
		connect();
	}

	function disconnect() {
		setSender(null);
		try {
			port?.close?.();
		} catch {}
		port = null;
		bus.emit('bridge:close', undefined);
	}

	onDestroy(() => {
		disconnect();
		if (iframeEl?.parentElement) iframeEl.parentElement.removeChild(iframeEl);
		iframeEl = null;
	});
</script>

<iframe bind:this={iframeEl} {src} style="display:none" onload={onIframeLoad} title="bus-bridge"
></iframe>
