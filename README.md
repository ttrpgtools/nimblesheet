# Nimblesheets

A character sheet / lightweight encounter manager for [Nimble 2](https://nimblerpg.com/pages/nimble) TTRPG.

Also designed to be used as an [Owlbear Rodeo](https://owlbear.rodeo) extension.

## Feature integration guide

### Integrating `feature/non-editable` (locked state)

The sheet context system is in place. When the locked feature merges to `main`, two edits wire it up:

**1. `src/lib/CharacterSheet.svelte`** — replace the placeholder in the sheet context with the real locked state:

```ts
// Before (placeholder):
const sheetCtx = $state({ locked: false });
setSheetContext(sheetCtx);

// After (connect to locked feature's reactive state):
// locked is already declared by feature/non-editable as: let locked = $state(true);
$effect(() => { sheetCtx.locked = locked; });
```

**2. `src/lib/ClassAbilities.svelte`** — pass locked from context instead of as a prop. In `CharacterSheet.svelte`, add `locked={sheetCtx.locked}` to the `<ClassAbilities>` call (once `feature/class-abilities` is also merged):

```svelte
<ClassAbilities
  charClass={character.charClass}
  level={character.level}
  subclass={character.subclass}
  locked={sheetCtx.locked}
  bind:selectedAbilities={character.selectedAbilities}
  {onchange}
/>
```

The subclass dropdown already reads `sheetCtx.locked` and will become non-interactive automatically.

---

### Integrating `feature/docs` (Nimblenomicon links)

**1. `src/lib/CharacterSheet.svelte`** — replace the inline slug expression in the subclass doc link with the helper from `nimble-docs`:

```svelte
<!-- Before (inline slug): -->
href="https://nimblenomicon.pages.dev/classes/{character.charClass.trim()...}/"

<!-- After (import classUrl from nimble-docs and use it): -->
href={classUrl(character.charClass)}
```

**2. `src/lib/ClassAbilities.svelte`** — replace `classSlugUrl` with the shared helper:

```ts
// Remove the local classSlugUrl function and replace the import:
import { classUrl } from './nimble-docs';

// Replace:
let docUrl = $derived(classSlugUrl(charClass));
// With:
let docUrl = $derived(classUrl(charClass));
```

**3. `src/lib/icons/index.ts`** — `BookOpenText` is already added by `feature/class-abilities`. The docs feature may also add it; if so, remove the duplicate.

---

## Roadmap

### Subclass rules support

Subclass selection at level 3+ is implemented. Full mechanical support would require:

- **Data model** — a `NimbleSubclass` type with per-level feature arrays (levels 3, 7, 11, 15), sourced from `docs/Nimble Vault/Heroes/Classes/*/Subclasses/*.md`. Run `npm run import-subclasses` to regenerate the name list from docs; extending it to parse feat content is the next step.

- **Feat parsing** — each subclass feature is a `[[Wikilink]]` to a feat file in the class's `Feats/Subclass Feats/` directory. Those files define the actual mechanical effect (damage bonuses, new actions, extra magic schools, etc.) and would need structured front-matter or a consistent parse format to be machine-readable.

- **Applying features** — once parsed, features would be applied conditionally in the character sheet based on `character.subclass` and `character.level`. Common effect types observed across subclasses:
  - Extra magic school access (e.g. Commander Spellblade gains a school, Stormshifter circles swap schools)
  - New or modified actions/reactions (most martial subclasses)
  - Passive stat or save modifiers
  - Unique resource tracks (e.g. Berserker rage stacks, Stormshifter wild shapes)
  - Triggered effects that replace or augment existing class features

- **Edge cases** — Oathbreaker (Oathsworn subclass) inverts class assumptions and would need special handling. Hexbinder exists in docs but is not yet in `allClasses`; its subclasses are included in `allSubclasses` for when it is added.
