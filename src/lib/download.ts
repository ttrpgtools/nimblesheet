export function download(payload: string, name: string, type = 'application/json') {
	const link = document.createElement('a');
	link.download = name;
	const blob = new Blob([payload], { type });
	link.href = URL.createObjectURL(blob);
	link.click();
	URL.revokeObjectURL(link.href);
}

export function downloadViaPopup(payload: string, filename: string, type = 'application/json') {
	// 1) Open a same-origin, blank popup in the *same user gesture*
	const w = window.open('about:blank', '_blank', 'popup=yes,width=600,height=400');

	if (!w) {
		alert('Popup blocked. Please allow popups for exports.');
		return;
	}

	// 2) Inject a minimal HTML shell that exposes window.receive()
	//    Keep it tiny and inline to avoid CSP/external fetches.
	const html = `<!doctype html>
  <meta charset="utf-8">
  <title>Preparing download…</title>
  <style>html,body{height:100%;display:grid;place-items:center;font:14px system-ui}</style>
  <body>Preparing your download…</body>
  <script>
    // Expose a function the opener can call synchronously.
    // We *must* finish the download while the user activation is still valid.
    window.receive = function(bytes, name, mime){
      try {
        const blob = new Blob([bytes], { type: mime || 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name || 'export.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Give the browser a moment to start the download before revoking/closing.
        setTimeout(() => {
          URL.revokeObjectURL(url);
          // Try to close ourselves; some browsers may require user setting
          window.close();
        }, 500);
      } catch (e) {
        document.body.textContent = 'Download failed: ' + (e && e.message || e);
      }
    };
  </script>`;

	// Write and finalize the popup document
	w.document.open();
	w.document.write(html);
	w.document.close();

	// 3) Serialize your data to bytes and call the popup immediately.
	// Prefer an ArrayBuffer to avoid structured clone overhead.
	const bytes = new TextEncoder().encode(payload);

	// Call synchronously while user activation is still “hot”
	// (about:blank popup is same-origin, so direct function call works)
	// @ts-ignore - we know the function exists because we just injected it
	w.receive(bytes, filename, type);
}
