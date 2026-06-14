import { getContext, setContext } from 'svelte';

export interface SheetContext {
	locked: boolean;
}

const KEY = Symbol('sheet');

export function setSheetContext(ctx: SheetContext): void {
	setContext(KEY, ctx);
}

export function getSheetContext(): SheetContext {
	return getContext<SheetContext>(KEY) ?? { locked: false };
}
