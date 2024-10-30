export function download(payload: string, name: string, type = 'application/json') {
	const link = document.createElement('a');
	link.download = name;
	const blob = new Blob([payload], { type });
	link.href = URL.createObjectURL(blob);
	link.click();
	URL.revokeObjectURL(link.href);
}
