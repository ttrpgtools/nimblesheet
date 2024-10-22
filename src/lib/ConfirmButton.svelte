<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { Snippet } from 'svelte';
  import { createConfirm } from './confirm.svelte';
  import { Button } from './components/ui/button';
  interface Props {
    confirmText: string;
    children?: Snippet;
    onconfirm: () => void;
  }
  let { confirmText, onconfirm, children}: Props = $props();

  const confirm = createConfirm(onconfirm);

</script>
<span class="relative inline-block">
  <Button onclick={confirm.onclick} variant={confirm.confirming ? `destructive` : `secondary`} class="w-full">
    {#if children}{@render children()}{:else}Confirm{/if}
  </Button>
  {#if confirm.ready}
  <span class="helper absolute text-center z-10 bg-rose-500 text-white border-0 rounded text-sm left-1/2 top-0 px-2 py-1 w-max max-w-full" transition:fade={{duration: 175}}>
    <span class="nib absolute z-10 w-0 h-0 left-1/2 bottom-0 border-x-[0.5rem] border-t-[0.5rem] border-b-0 border-x-transparent border-b-transparent border-t-rose-500 -translate-x-1/2 translate-y-[90%] "></span>
    {confirmText}
  </span>
  {/if}
</span>

<style>
  .helper {
    transform: translate3d(-50%, calc(-100% + -1rem), 0);
  }
</style>