<script lang="ts" generics="T">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import Trash from "lucide-svelte/icons/trash-2";
  import type { Snippet } from "svelte";

  type Props = {
    list: T[];
    title: string;
    headerExtra?: Snippet;
    buttonLabel: string;
    emptyLabel: string;
    onchange: () => void;
    initialRow: T;
    row: Snippet<[T]>;
    deleteAlt: Snippet<[T]>;
  };
  let {
    list = $bindable(),
    title,
    headerExtra,
    buttonLabel,
    emptyLabel,
    initialRow,
    onchange,
    row,
    deleteAlt,
  } : Props = $props();

  let deleteMode = $state(false);

  function deleteRow(index: number) {
    list.splice(index, 1);
    if (!list.length) {
      deleteMode = false;
    }
    onchange();
  }

  function addRow() {
    list.push(structuredClone(initialRow));
    onchange();
  }
</script>

  <Card.Root class={deleteMode ? `border-destructive` : ``}>
    <Card.Header>
      <div class="flex gap-2 items-center">
        <Card.Title class="text-lg flex-grow">{title}</Card.Title>
        {#if headerExtra}
          {@render headerExtra()}
        {/if}
        <Button size="icon" variant={deleteMode ? `destructive` : `outline`} onclick={() => deleteMode = !deleteMode}><Trash class="size-5 {deleteMode ? `text-destructive-foreground` : `text-destructive`}"/></Button>
      </div>
    </Card.Header>
    <Card.Content class="grid grid-cols-[minmax(0,_1fr)_auto_auto] gap-2">
          {#each list as item, index}
            {@render row(item)}
            {#if deleteMode}
              <Button size="icon" variant="outline">
                <Trash onclick={() => deleteRow(index)} class="size-5 text-destructive" />
              </Button>
            {:else}
              {@render deleteAlt(item)}
            {/if}
          {:else}
            <div class="p-2 text-center text-muted-foreground text-sm col-span-3">{emptyLabel}</div>
          {/each}
    </Card.Content>
    <Card.Footer>
      <Button variant="secondary" class="" onclick={addRow}>{buttonLabel}</Button>
    </Card.Footer>
  </Card.Root>

