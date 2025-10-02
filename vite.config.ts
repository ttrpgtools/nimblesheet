import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwind from '@tailwindcss/vite';
import path from 'path';
import pkg from './package.json';

// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwind(), svelte()],
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, './src/lib'),
		},
	},
	define: {
		__VERSION__: JSON.stringify(pkg.version),
	},
	server: {
		cors: {
			origin: 'https://www.owlbear.rodeo',
		},
	},
});
