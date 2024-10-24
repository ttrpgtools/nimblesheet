<script lang="ts">
  import Dice from "lucide-svelte/icons/dices";
  import {
    Button
  } from "$lib/components/ui/button/index.js";
  import * as Card from '$lib/components/ui/card';
  import * as Select from '$lib/components/ui/select';
  import * as Collapsible from "$lib/components/ui/collapsible";
  import * as Popover from "$lib/components/ui/popover";
  import { fireSpells, iceSpells, necroticSpells, radiantSpells, lightningSpells, windSpells, utilitySpells } from './magic';
  import SpellSchool from './SpellSchool.svelte';
  import type { MagicSchool, Spell } from "./types";
  import Checkbox from "./components/ui/checkbox/checkbox.svelte";

  type Props = {
    allowed?: MagicSchool[];
    level?: number;
    utilspells?: Record<string, boolean>;
    onroll?: (roll: string, label?: string) => void;
    charClass?: string;
  };
  let {
    allowed = ['Fire', 'Ice', 'Lightning', 'Necrotic', 'Radiant', 'Wind'],
    level = 1,
    utilspells = $bindable({}),
    charClass = '',
    onroll = () => {}
  } : Props = $props();

  let tierCap = $derived(
    charClass === 'Oathsworn'
      ? (level === 1 ? -1 : (level < 13 ? Math.floor(Math.min(level, 10) / 2) : Math.floor((level - 13) / 4) + 6))
      : (charClass === 'Shadowmancer'
        ? (level === 1 ? -1 : (level < 7 ? Math.floor((level + 1) / 3) : Math.floor((level + 2) / 3)))
        : Math.floor(level / 2)));

  type SchoolGroup = { name: MagicSchool | 'Utility'; spells: Spell[] };
  const allSchools: SchoolGroup[] = [
    { name: 'Fire', spells: fireSpells, },
    { name: 'Ice', spells: iceSpells, },
    { name: 'Lightning', spells: lightningSpells, },
    { name: 'Necrotic', spells: necroticSpells, },
    { name: 'Radiant', spells: radiantSpells, },
    { name: 'Wind', spells: windSpells, },
    { name: 'Utility', spells: utilitySpells },
  ] as const;

  let extraSchool: MagicSchool | undefined = $state();
  
  let allAllowed = $derived(extraSchool ? [...allowed, extraSchool] : allowed);
  const available = $derived(allSchools.reduce<SchoolGroup[]>((p, c) => {
    if (c.name === 'Utility') {
      const av = c.spells.filter(s => s.tier <= tierCap && allAllowed.includes(s.school));
      if (av.length) {
        p.push({ name: 'Utility', spells: av});
      }
    } else if (allAllowed.includes(c.name)) {
      const av = c.spells.filter(s => s.tier <= tierCap && (!s.onlyFor || s.onlyFor === charClass));
      if (av.length) {
        p.push({ name: c.name, spells: av});
      }
    } 
    return p;
  }, []));

  let additionalSchools: MagicSchool[] = $derived(
    charClass === 'Songweaver'
      ? ['Fire', 'Ice', 'Lightning', 'Necrotic', 'Radiant']
      : (charClass === 'Shadowmancer' && level >= 3
        ? ['Fire', 'Ice']
        : (charClass === 'Stormshifter' && level >= 3
          ? ['Ice', 'Radiant']
          : []
        )
      ));
</script>

<Card.Root>
  <Card.Header>
    <div class="flex gap-2 items-center">
      <Card.Title class="text-lg flex-grow w-full">Spells</Card.Title>
      {#if additionalSchools.length}
        <Select.Root onSelectedChange={(v) => extraSchool = v?.value} selected={{value: extraSchool, label: extraSchool}}>
          <Select.Trigger>
            <Select.Value placeholder="Additional school" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="">(None)</Select.Item>
            {#each additionalSchools as asch}
              <Select.Item value={asch}>{asch}</Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      {/if}
    </div>
  </Card.Header>
  <Card.Content class="flex flex-col gap-2">
    {#each available as school}
      <Collapsible.Root>
        <Collapsible.Trigger class="flex gap-4 items-center">
          <SpellSchool school={school.name} class="size-6" />
          <div class="text-lg">{school.name}</div>
        </Collapsible.Trigger>
        <Collapsible.Content class="pl-10 py-2">
          {#each school.spells as spell}
          <div class="flex gap-2 items-center">
            {#if school.name === 'Utility'}
            <Checkbox bind:checked={utilspells[spell.name]} />
            <SpellSchool school={spell.school} />
            {/if}
            <div class="flex gap-2 flex-grow w-full py-2 items-center">
              <Popover.Root>
                <Popover.Trigger>
                  <div class:text-muted-foreground={school.name === 'Utility' && !utilspells[spell.name]}>{spell.name}</div>
                </Popover.Trigger>
                <Popover.Content>
                  <div>
                    {spell.desc}
                  </div>
                </Popover.Content>
              </Popover.Root>
              {#if school.name !== 'Utility'}<span class=" text-muted-foreground text-sm">({spell.tier <= 0 ? `Cantrip` : `Tier ${spell.tier}`})</span>{/if}
            </div>
            {#if spell.roll}
            <Button variant="ghost" size="icon" onclick={() => onroll(spell.roll, spell.name)}><Dice class="size-5" /></Button>
            {/if}
          </div>
          {/each}
        </Collapsible.Content>
      </Collapsible.Root>
    {:else}
      <div class="text-sm text-muted-foreground flex items-center justify-center p-4">
        {#if charClass}This class doesn't get any spells (at this level){:else}Set class and level to access spells.{/if}
      </div>
    {/each}
  </Card.Content>
</Card.Root>
