import { id } from './random';
import {
	addableSpells,
	builtInSpellId,
	contentSlug,
	findBuiltInSpell,
	utilitySpells,
} from './spell-catalog';
import type {
	CharacterClass,
	ClassTemplate,
	ContentPack,
	ContentSpell,
	Spell,
	SpellcastingProfile,
} from './types';

function normalizeBuiltInReferences(references: string[], catalog: Spell[]) {
	return references.map((reference) => {
		const spell = findBuiltInSpell(reference, catalog);
		return spell ? builtInSpellId(spell) : reference;
	});
}

function resolveBuiltInReferences(references: string[], catalog: Spell[]) {
	return references
		.map((reference) => findBuiltInSpell(reference, catalog)?.name)
		.filter((name): name is string => !!name);
}

export function createClassContentPack(
	classConfig: CharacterClass,
	spellcasting: SpellcastingProfile
) {
	const templateId = classConfig.templateId?.startsWith('user:class:')
		? classConfig.templateId
		: `user:class:${id()}`;
	const packId = classConfig.templatePackId?.startsWith('user:pack:')
		? classConfig.templatePackId
		: `user:pack:${id()}`;
	const nextClassConfig: CharacterClass = {
		...structuredClone(classConfig),
		presetId: undefined,
		templateId,
		templatePackId: packId,
	};
	const customSpells: ContentSpell[] = spellcasting.customSpells.map((spell) => ({
		...structuredClone(spell),
		id: spell.id ?? `user:spell:${id()}`,
	}));
	const nextSpellcasting: SpellcastingProfile = {
		...structuredClone(spellcasting),
		customSpells,
	};
	const template: ClassTemplate = {
		id: templateId,
		name: nextClassConfig.name,
		classConfig: nextClassConfig,
		spellcasting: {
			schools: nextSpellcasting.schools,
			keyStat: nextSpellcasting.keyStat,
			utilitySpellIds: normalizeBuiltInReferences(nextSpellcasting.utilitySpells, utilitySpells),
			addedSpellIds: normalizeBuiltInReferences(nextSpellcasting.addedSpells, addableSpells),
			excludedSpellIds: normalizeBuiltInReferences(nextSpellcasting.excludedSpells, addableSpells),
			customSchoolIds: nextSpellcasting.customSchools.map((school) => school.id),
			customSpellIds: customSpells.map((spell) => spell.id),
		},
	};
	const pack: ContentPack = {
		format: 'nimblesheet-content-pack',
		version: 1,
		id: packId,
		metadata: {
			name: `${nextClassConfig.name} class template`,
			description: `A NimbleSheet class template for ${nextClassConfig.name}.`,
			created: new Date().toISOString(),
		},
		classes: [template],
		schools: structuredClone(nextSpellcasting.customSchools),
		spells: customSpells,
	};
	return { pack, classConfig: nextClassConfig, spellcasting: nextSpellcasting };
}

export function applyClassTemplate(pack: ContentPack, template: ClassTemplate) {
	const customSchoolIds = new Set(template.spellcasting.customSchoolIds);
	const customSpellIds = new Set(template.spellcasting.customSpellIds);
	const classConfig: CharacterClass = {
		...structuredClone(template.classConfig),
		name: template.name,
		presetId: undefined,
		templateId: template.id,
		templatePackId: pack.id,
	};
	const spellcasting: SpellcastingProfile = {
		schools: template.spellcasting.schools
			? structuredClone(template.spellcasting.schools)
			: undefined,
		keyStat: template.spellcasting.keyStat,
		utilitySpells: resolveBuiltInReferences(template.spellcasting.utilitySpellIds, utilitySpells),
		addedSpells: resolveBuiltInReferences(template.spellcasting.addedSpellIds, addableSpells),
		excludedSpells: resolveBuiltInReferences(template.spellcasting.excludedSpellIds, addableSpells),
		customSchools: pack.schools
			.filter((school) => customSchoolIds.has(school.id))
			.map((school) => structuredClone(school)),
		customSpells: pack.spells
			.filter((spell) => customSpellIds.has(spell.id))
			.map((spell) => structuredClone(spell)),
	};
	return { classConfig, spellcasting };
}

export function contentPackFilename(pack: ContentPack) {
	return `${contentSlug(pack.metadata.name)}.nimble-content.json`;
}

export function isContentPack(value: unknown): value is ContentPack {
	if (!isRecord(value)) return false;
	const candidate = value as Partial<ContentPack>;
	return (
		candidate.format === 'nimblesheet-content-pack' &&
		candidate.version === 1 &&
		typeof candidate.id === 'string' &&
		isRecord(candidate.metadata) &&
		typeof candidate.metadata.name === 'string' &&
		typeof candidate.metadata.created === 'string' &&
		Array.isArray(candidate.classes) &&
		candidate.classes.every(isClassTemplate) &&
		Array.isArray(candidate.schools) &&
		candidate.schools.every(
			(school) =>
				isRecord(school) && typeof school.id === 'string' && typeof school.name === 'string'
		) &&
		Array.isArray(candidate.spells) &&
		candidate.spells.every(
			(spell) =>
				isRecord(spell) &&
				typeof spell.id === 'string' &&
				(spell.category === undefined ||
					spell.category === 'utility' ||
					spell.category === 'secret') &&
				typeof spell.name === 'string' &&
				typeof spell.school === 'string' &&
				typeof spell.tier === 'number' &&
				typeof spell.desc === 'string' &&
				typeof spell.roll === 'string'
		)
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object';
}

function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isClassTemplate(value: unknown): value is ClassTemplate {
	if (!isRecord(value) || !isRecord(value.classConfig) || !isRecord(value.spellcasting)) {
		return false;
	}
	return (
		typeof value.id === 'string' &&
		typeof value.name === 'string' &&
		typeof value.classConfig.id === 'string' &&
		typeof value.classConfig.name === 'string' &&
		isStringArray(value.classConfig.key) &&
		isRecord(value.classConfig.saves) &&
		typeof value.classConfig.startHp === 'number' &&
		isStringArray(value.spellcasting.utilitySpellIds) &&
		isStringArray(value.spellcasting.addedSpellIds) &&
		isStringArray(value.spellcasting.excludedSpellIds) &&
		isStringArray(value.spellcasting.customSchoolIds) &&
		isStringArray(value.spellcasting.customSpellIds)
	);
}
