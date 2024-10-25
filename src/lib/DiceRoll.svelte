<script lang="ts">
  import { Die } from "./dice";
  import Explode from "./dice/Explode.svelte";
  import { evaluateDiceRoll } from "./dice/rolling";
  import Vicious from "./dice/Vicious.svelte";
  import X from "lucide-svelte/icons/x";
    import OBR from "@owlbear-rodeo/sdk";

  type Props = {
    formula: string;
    label?: string;
    context?: Record<string, number>;
    rollModifier?: number;
    characterName?: string;
  };
  let { formula, label = '', context = {}, rollModifier = 0, characterName }: Props = $props();

  const result = evaluateDiceRoll(formula, context, rollModifier);
  const modDisplay = Math.abs(rollModifier) === 1 ? '' : ` ${Math.abs(rollModifier)}`;

  result.then(async res => {
    if (OBR.isAvailable) {
      const pname = await OBR.player.getName();
      const rollMsg = `${characterName || pname} rolled ${res.formula}${label ? ` (${label})` : ``} = ${res.value}`;
      OBR.broadcast.sendMessage(`tools.ttrpg.obr-dicelog/roll`, { roll: rollMsg, from: pname }, { destination: 'ALL' });
    }
  });
</script>
<div class="flex flex-col gap-2">
  <div class="">
    Rolling {formula}{label ? ` (${label})` : ``}
    {rollModifier === 0 ? `` : `with${modDisplay} ${rollModifier < 0 ? `dis` : ''}advantage`}
  </div>
  {#await result}
    <div class="text-2xl">&nbsp;</div>
  {:then roller}
    <div class="flex gap-4 items-center">
      <div class="text-2xl font-bold">{roller.value}</div>
      <div class="flex gap-2 border border-gray-400 rounded-md p-2">
        {#each roller.dice as die}
        <div class="flex flex-col gap-1 items-center">
          {#if die.type === 'vicious'}
          <Vicious size="size-4" />
          {:else if die.type === 'exploded'}
          <Explode size="size-4" />
          {:else if die.type === 'dropped'}
          <X class="size-4" />
          {:else}
          <Die which={die.sides} size="size-4"/>
          {/if}
          <div class="{die.isMax() ? `text-green-500` : ''} {die.isMin() ? `text-red-500` : ``}">{die.value}</div>
        </div>
        {/each}
      </div>
    </div>
  {/await}
</div>