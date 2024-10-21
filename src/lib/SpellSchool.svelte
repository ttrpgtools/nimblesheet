<script lang="ts">
  import Fire from "lucide-svelte/icons/flame";
  import Ice from "lucide-svelte/icons/snowflake";
  import Lightning from "lucide-svelte/icons/zap";
  import Necrotic from "lucide-svelte/icons/skull";
  import Radiant from "lucide-svelte/icons/sun";
  import Wind from "lucide-svelte/icons/wind";
  import Utility from "lucide-svelte/icons/pencil-ruler";
    import type { MagicSchool } from "./types";

  const schoolMap = {
    'Fire': Fire,
    'Ice': Ice,
    'Lightning': Lightning,
    'Necrotic': Necrotic,
    'Radiant': Radiant,
    'Wind': Wind,
    'Utility': Utility,
  } as const;
  let { school, class : cls, ...others }: { school: MagicSchool | 'Utility', class?: string } = $props();

  const Icon = $derived(schoolMap[school]);
</script>
<Icon class={cls || 'size-4'} {...others} />
