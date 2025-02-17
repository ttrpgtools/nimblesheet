import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwind from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [tailwind(), svelte()],
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, './src/lib'),
		},
	},
});
