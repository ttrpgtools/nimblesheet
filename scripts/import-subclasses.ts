#!/usr/bin/env tsx
// Run with: npm run import-subclasses
// Reads subclass names from docs and rewrites the allSubclasses export in nimble.ts.
// Also reads spell markdown from docs and rewrites the spell arrays in magic.ts.
import { readdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Load .env without requiring dotenv as a dependency.
try {
	const raw = readFileSync(join(PROJECT_ROOT, '.env'), 'utf8');
	for (const line of raw.split('\n')) {
		const stripped = line.replace(/#.*/, '').trim();
		const eq = stripped.indexOf('=');
		if (eq > 0) {
			const key = stripped.slice(0, eq).trim();
			const val = stripped.slice(eq + 1).trim();
			if (key && !(key in process.env)) process.env[key] = val;
		}
	}
} catch {}

const VAULT_DIR = process.env.NIMBLE_DOCS_DIR ?? join(PROJECT_ROOT, 'docs/Nimble Vault');
const DOCS_DIR = join(VAULT_DIR, 'Heroes/Classes');

// ── Shared helpers ─────────────────────────────────────────────────────────────

function esc(s: string): string {
	return s.replaceAll('\\', String.raw`\\`).replaceAll("'", String.raw`\'`);
}

// ── Subclass sync ──────────────────────────────────────────────────────────────

const DIR_NAME_OVERRIDES: Record<string, string> = {
	'Cheat, The': 'The Cheat',
};

const result: Record<string, string[]> = {};

const classDirs = readdirSync(DOCS_DIR, { withFileTypes: true })
	.filter((d) => d.isDirectory())
	.map((d) => d.name);

for (const dirName of classDirs) {
	const subclassDir = join(DOCS_DIR, dirName, 'Subclasses');
	if (!existsSync(subclassDir)) continue;
	const subclasses = readdirSync(subclassDir)
		.filter((f) => f.endsWith('.md'))
		.filter((f) => {
			const content = readFileSync(join(subclassDir, f), 'utf8');
			return !/^\*\(by .+\)\*\s*$/m.test(content);
		})
		.map((f) => f.replace(/\.md$/, ''))
		.sort((a, b) => a.localeCompare(b));
	const className = DIR_NAME_OVERRIDES[dirName] ?? dirName;
	result[className] = subclasses;
}

const formatSubList = (subs: string[]) => subs.map((s) => `'${esc(s)}'`).join(', ');

const entries = Object.entries(result)
	.sort(([a], [b]) => a.localeCompare(b))
	.map(([cls, subs]) => `\t'${cls}': [${formatSubList(subs)}]`)
	.join(',\n');

const block = `export const allSubclasses: Record<string, string[]> = {\n${entries},\n};`;

const nimblePath = join(PROJECT_ROOT, 'src/lib/nimble.ts');
const nimbleSource = readFileSync(nimblePath, 'utf8');
const updatedNimble = nimbleSource.replace(
	/export const allSubclasses: Record<string, string\[\]> = \{[\s\S]*?\};/,
	block,
);

if (updatedNimble === nimbleSource) {
	console.error('Could not find allSubclasses block in nimble.ts — nothing written.');
	process.exit(1);
}

writeFileSync(nimblePath, updatedNimble, 'utf8');
console.log(`Updated allSubclasses in src/lib/nimble.ts (${Object.keys(result).length} classes).`);

// ── Spell sync (disabled) ──────────────────────────────────────────────────────
// Vault spell files do not yet correspond 1-to-1 with magic.ts entries
// (the PDF subclasses reference existing spells; Muscle Spells need a separate pass).
// Re-enable by removing the surrounding /* ... */ when vault spell files are ready.

/*

const MAGIC_DIR = join(VAULT_DIR, 'Magic/Spell Schools');
const UTILITY_DIR = join(VAULT_DIR, 'Magic/Utility Spells');

const SCHOOL_DIRS: Record<string, { varName: string; school: string }> = {
	'Fire Spells': { varName: 'fireSpells', school: 'Fire' },
	'Ice Spells': { varName: 'iceSpells', school: 'Ice' },
	'Lightning Spells': { varName: 'lightningSpells', school: 'Lightning' },
	'Wind Spells': { varName: 'windSpells', school: 'Wind' },
	'Radiant Spells': { varName: 'radiantSpells', school: 'Radiant' },
	'Necrotic Spells': { varName: 'necroticSpells', school: 'Necrotic' },
};

// Vault file names that differ from the spell name in magic.ts.
const SPELL_NAME_OVERRIDES: Record<string, string> = {
	'Lifebinding Spirit': 'Summon Lifebinding Spirit',
};

interface ParsedSpell {
	name: string;
	school: string;
	tier: number;
	desc: string;
	actions: number;
	roll: string;
	onlyFor?: string;
}

// ── Header line classification ─────────────────────────────────────────────────

type LineClass =
	| { kind: 'header'; school: string; tier: number }
	| { kind: 'onlyFor'; className: string }
	| { kind: 'actions'; count: number }
	| { kind: 'castingTime'; count: number }
	| { kind: 'targeting' }
	| { kind: 'desc' };

function classifyLine(line: string): LineClass {
	const mCantrip = /^\*Cantrip\s+(\w+)\s+Spell\*$/i.exec(line);
	if (mCantrip) return { kind: 'header', school: mCantrip[1], tier: 0 };

	const mTiered = /^\*Tier\s+(\d+)\s+(\w+)\s+Spell\*$/i.exec(line);
	if (mTiered) return { kind: 'header', school: mTiered[2], tier: Number(mTiered[1]) };

	const mUtil = /^\*(\w+)\s+Utility\s+Cantrip\*$/i.exec(line);
	if (mUtil) return { kind: 'header', school: mUtil[1], tier: 0 };

	const mOnly = /^\*(\S+)\s+only\*$/i.exec(line);
	if (mOnly) return { kind: 'onlyFor', className: mOnly[1] };

	const mActions = /^(\d+)\s+Actions?\b/i.exec(line);
	if (mActions) return { kind: 'actions', count: Number(mActions[1]) };

	if (/^Reaction\b/i.test(line)) return { kind: 'actions', count: 0 };

	if (/^(AoE|Self|Single Target|Cone|Line)\b/i.test(line)) return { kind: 'targeting' };

	if (line.startsWith('**Casting Time:**')) {
		const castTime = line.slice('**Casting Time:**'.length).trim().toLowerCase();
		return { kind: 'castingTime', count: /\d+\s*(hour|day)/.test(castTime) ? -1 : 1 };
	}

	return { kind: 'desc' };
}

function stripMarkdown(line: string): string {
	return line.replaceAll('**', '').replace(/^\* /, '').trim();
}

interface SpellHeader {
	school: string;
	tier: number;
	onlyFor: string | undefined;
	actions: number;
	firstDescIdx: number;
}

// Scans header lines and returns parsed metadata + the index where description begins.
function processHeaderLines(lines: string[], defaultSchool: string): SpellHeader {
	let school = defaultSchool;
	let tier = 0;
	let onlyFor: string | undefined;

	for (let i = 0; i < lines.length; i++) {
		const c = classifyLine(lines[i]);
		if (c.kind === 'header') { school = c.school; tier = c.tier; }
		else if (c.kind === 'onlyFor') { onlyFor = c.className; }
		else if (c.kind === 'actions') { return { school, tier, onlyFor, actions: c.count, firstDescIdx: i + 1 }; }
		else if (c.kind === 'targeting') { return { school, tier, onlyFor, actions: 1, firstDescIdx: i + 1 }; }
		else if (c.kind === 'castingTime') { return { school, tier, onlyFor, actions: c.count, firstDescIdx: i }; }
		else { return { school, tier, onlyFor, actions: 1, firstDescIdx: i }; }
	}
	return { school, tier, onlyFor, actions: 1, firstDescIdx: lines.length };
}

function parseSpellFile(filePath: string, defaultSchool: string): ParsedSpell {
	const vaultName = basename(filePath, '.md');
	const name = SPELL_NAME_OVERRIDES[vaultName] ?? vaultName;
	const lines = readFileSync(filePath, 'utf8')
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean);

	const { school, tier: rawTier, onlyFor, actions, firstDescIdx } = processHeaderLines(lines, defaultSchool);
	// Shadowmancer-only cantrips are at-will class features, not mana-gated spells.
	const tier = onlyFor === 'Shadowmancer' && rawTier === 0 ? -1 : rawTier;
	const desc = lines.slice(firstDescIdx).map(stripMarkdown).join(' ').replace(/\s+/g, ' ').trim();

	return { name, school, tier, desc, actions, roll: '', onlyFor };
}

// ── magic.ts sync helpers ──────────────────────────────────────────────────────

// Build name → { roll, actions } from existing magic.ts so hand-tuned values survive.
function buildSpellMetaMap(src: string): Map<string, { roll: string; actions: number }> {
	const map = new Map<string, { roll: string; actions: number }>();
	const re = /name:\s*'([^']+)'([\s\S]*?)roll:\s*'([^']*)'/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(src)) !== null) {
		const actionsMatch = /actions:\s*(-?\d+)/.exec(m[2]);
		map.set(m[1], { roll: m[3], actions: actionsMatch ? Number(actionsMatch[1]) : 1 });
	}
	return map;
}

function serializeSpell(s: ParsedSpell): string {
	const lines = [
		'\t{',
		`\t\tname: '${esc(s.name)}',`,
		`\t\tschool: '${s.school}',`,
		`\t\ttier: ${s.tier},`,
		`\t\tdesc: '${esc(s.desc)}',`,
		`\t\tactions: ${s.actions},`,
		`\t\troll: '${s.roll}',`,
	];
	if (s.onlyFor) lines.push(`\t\tonlyFor: '${s.onlyFor}',`);
	lines.push('\t}');
	return lines.join('\n');
}

// ── Spell sync (disabled) ──────────────────────────────────────────────────────
// Vault spell files do not yet correspond 1-to-1 with magic.ts entries
// (the PDF subclasses reference existing spells; Muscle Spells need a separate pass).
// Re-enable by uncommenting the block below when vault spell files are ready.
/*

const magicPath = join(PROJECT_ROOT, 'src/lib/magic.ts');
const magicSource = readFileSync(magicPath, 'utf8');
const spellMeta = buildSpellMetaMap(magicSource);

const spellsByVar = new Map<string, ParsedSpell[]>();

for (const [dirName, { varName, school }] of Object.entries(SCHOOL_DIRS)) {
	const dir = join(MAGIC_DIR, dirName);
	if (!existsSync(dir)) continue;
	spellsByVar.set(
		varName,
		readdirSync(dir)
			.filter((f) => f.endsWith('.md'))
			.map((f) => parseSpellFile(join(dir, f), school)),
	);
}

if (existsSync(UTILITY_DIR)) {
	spellsByVar.set(
		'utilitySpells',
		readdirSync(UTILITY_DIR)
			.filter((f) => f.endsWith('.md') && f !== 'Utility Spells.md')
			.map((f) => parseSpellFile(join(UTILITY_DIR, f), 'Fire')),
	);
}

// Only add spells that are not already in magic.ts. Existing entries are never touched.
let updatedMagic = magicSource;
let addedTotal = 0;

for (const [varName, vaultSpells] of spellsByVar) {
	const newSpells = vaultSpells.filter((s) => !spellMeta.has(s.name));
	if (newSpells.length === 0) continue;

	const additions = newSpells.map(serializeSpell).join(',\n');
	const next = updatedMagic.replace(
		new RegExp(String.raw`(export const ${varName}: Spell\[\] = \[[\s\S]*?)\n\];`),
		`$1,\n${additions},\n];`,
	);
	if (next === updatedMagic) {
		console.warn(`Warning: could not find ${varName} in magic.ts — skipped.`);
	} else {
		addedTotal += newSpells.length;
	}
	updatedMagic = next;
}

if (updatedMagic === magicSource) {
		console.log('No new spells to add to src/lib/magic.ts.');
	} else {
		writeFileSync(magicPath, updatedMagic, 'utf8');
		console.log(`Added ${addedTotal} new spell(s) to src/lib/magic.ts.`);
	}


*/
