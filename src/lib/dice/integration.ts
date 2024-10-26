import OBR from "@owlbear-rodeo/sdk";
import { toast } from "svelte-sonner";
import { evaluateDiceRoll } from "./rolling";
import DiceRoll from "./DiceRoll.svelte";

type RollOptions = {
  label?: string;
  context?: Record<string, number>;
  rollModifier?: number;
  characterName?: string;
};

async function sendToOwlbear(
  result: Awaited<ReturnType<typeof evaluateDiceRoll>>,
  label?: string,
  characterName?: string
) {
  if (OBR.isAvailable) {
    const pname = await OBR.player.getName();
    const rollMsg = `${characterName || pname} rolled ${result.formula}${
      label ? ` (${label})` : ``
    } = ${result.value}`;
    OBR.broadcast.sendMessage(
      `tools.ttrpg.obr-dicelog/roll`,
      { roll: rollMsg, from: pname },
      { destination: "ALL" }
    );
  }
}

export async function rollDice(
  formula: string,
  { label, context, rollModifier, characterName }: RollOptions = {}
) {
  const result = await evaluateDiceRoll(formula, context, rollModifier);
  //@ts-ignore
  toast(DiceRoll, {
    componentProps: { formula, label, rollModifier, result },
    class: "![--initial-height:7.5rem] !bg-gray-200 dark:!bg-gray-800",
  });
  await sendToOwlbear(result, label, characterName);
  return result;
}
