<script lang="ts">
	import { cn } from '$lib/utils';
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { availableEmojis, type AvailableEmojis } from '$lib/types';
	import { Button } from '../ui/button';
	import { fade } from 'svelte/transition';

	interface Props {
		onSelect?: (emoji: AvailableEmojis) => void;
		selectedEmoji?: string;
		open?: boolean;
	}

	let {
		open = $bindable(false),
		onSelect,
		children,
		selectedEmoji,
		class: className,
		...restProps
	}: Props & SvelteHTMLElements['div'] = $props();

	function onWindowClick(event: MouseEvent) {
		if (!(event.target as HTMLElement).closest('.emoji-picker')) {
			open = false;
		}
	}
</script>

<svelte:window onclick={onWindowClick} />

<div class={cn('relative emoji-picker', className)} {...restProps}>
  <button
    onclick={() => {
      open = !open;
    }}
  >
	  {@render children?.()}
  </button>
	{#if open}
		<div class="h-[50dvh] max-h-50 w-[80dvw] max-w-50 overflow-y-auto rounded grid absolute z-10 bg-card top-full left-0 mt-2 border border-border p-2" transition:fade={{ duration: 300 }} style="grid-template-columns: repeat(auto-fit, minmax(2.25rem, 1fr));">
			{#each availableEmojis as emoji}
				<Button
					onclick={() => {
						onSelect?.(emoji);
            open = false;
					}}
					size="icon"
					variant={emoji === selectedEmoji ? 'default' : 'ghost'}
					class="text-lg"
				>
					{emoji}
				</Button>
			{/each}
		</div>
	{/if}
</div>
