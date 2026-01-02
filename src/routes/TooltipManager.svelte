<script lang="ts">
	import type { Restaurant } from '$lib/types';
	import { Overlay } from 'svelte-openlayers';
	import { ChevronRight, UtensilsCrossed } from '@lucide/svelte';
	import Rating from './Rating.svelte';
	import { clusterStyle, cn, formatDate } from '$lib/utils';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import Globals from '$lib/globals.svelte';
	import * as Empty from '$lib/components/ui/empty';

	interface Props {
		maxReviewsToShow?: number;
	}

	let { maxReviewsToShow = 4 }: Props = $props();
</script>

<Overlay.TooltipManager
	hoverTooltip={true}
	selectTooltip={true}
	selectStyle={clusterStyle}
	hoverClass="!bg-transparent !shadow-none"
	selectClass="!bg-transparent !shadow-none"
>
	{#snippet hoverSnippet(feature)}
		{@const props = feature.getProperties()}
		{@const restaurants =
			'features' in props
				? props.features.map((e: any) => e.getProperties().restaurant as Restaurant)
				: []}
		{#if restaurants.length > 1}
			<div class="flex flex-row items-center rounded border border-border bg-card p-2 shadow">
				{#each restaurants.slice(0, 4) as { icon }, i}
					<div
						class={cn(
							'flex size-7 flex-col items-center justify-center rounded-full bg-background',
							i > 0 && '-ml-2'
						)}
					>
						<span class="font-mono text-lg font-bold">{icon}</span>
					</div>
				{/each}
				{#if restaurants.length > 4}
					<div
						class="-ml-2 flex size-7 flex-col items-center justify-center rounded-full bg-background"
					>
						<span class="font-mono text-sm font-bold">+{restaurants.length - 4}</span>
					</div>
				{/if}
			</div>
		{:else}
			<div
				class="flex flex-row items-center gap-4 rounded border border-border bg-card px-4 py-2 shadow"
			>
				<div class="font-mono text-base font-bold">{restaurants[0].icon} {restaurants[0].name}</div>
				<div class="h-fit rounded-full bg-secondary px-2">
					<Rating rating={restaurants[0].rating} compact={true} />
				</div>
			</div>
		{/if}
	{/snippet}

	{#snippet selectSnippet(feature)}
		{@const props = feature.getProperties()}
		{@const restaurants =
			'features' in props
				? props.features.map((e: any) => e.getProperties().restaurant)
				: ([] as Restaurant[])}
		{#if restaurants.length > 1}
			<div
				class="w-[80dvw] max-w-125 space-y-4 overflow-y-auto rounded border border-border bg-card p-4"
			>
				{#each restaurants as { icon, name, id }}
					<div class="flex flex-row items-center justify-between gap-2 rtl:flex-row-reverse">
						<p class="line-clamp-1 font-mono text-lg font-medium">{icon} {name}</p>
						<Button size="icon-sm" onclick={() => (Globals.restaurantDetailsId = id)}>
							<ChevronRight class="size-4 rtl:rotate-180" />
						</Button>
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="w-[80dvw] max-w-125 space-y-4 overflow-hidden rounded border border-border bg-card p-4"
			>
				<div class="flex flex-row items-center justify-between gap-8">
					<p class="line-clamp-2 font-mono text-xl font-bold">
						{restaurants[0].icon}
						{restaurants[0].name}
					</p>
					{#if restaurants[0].reviews.length > 0}
						<Rating rating={restaurants[0].rating} compact={true} />
					{/if}
				</div>

				<Separator />

				{#if restaurants[0].reviews.length === 0}
					<Empty.Root>
						<Empty.Header>
							<Empty.Media variant="icon">
								<UtensilsCrossed />
							</Empty.Media>
							<Empty.Title>No Reviews yet</Empty.Title>
							<Empty.Description>
								You haven't reviewed <b>{name}</b> yet.
							</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				{:else}
					<div class="relative flex max-h-[50dvh] flex-col gap-4 overflow-y-auto pt-2">
						{#each restaurants[0].reviews.slice(0, maxReviewsToShow) as review}
							<div class="relative rounded-md border border-border p-2">
								<span
									class="absolute top-0 right-3 -translate-y-1/2 bg-card text-xs text-muted-foreground"
									>{formatDate(review.date)}</span
								>
								<div class="absolute top-0 left-3 -translate-y-1/2 bg-card">
									<Rating rating={review.rating} compact={true} />
								</div>
								<p>{review.comment}</p>
							</div>
						{/each}
						{#if restaurants[0].reviews.length > maxReviewsToShow}
							<p class="text-center text-sm text-muted-foreground">
								And {restaurants[0].reviews.length - maxReviewsToShow} more review{restaurants[0]
									.reviews.length -
									maxReviewsToShow >
								1
									? 's'
									: ''}...
							</p>
						{/if}
					</div>
				{/if}

				<Button
					class="mt-4 flex w-full flex-row gap-2"
					onclick={() => (Globals.restaurantDetailsId = restaurants[0].id)}
				>
					More details
					<ChevronRight class="size-4 rtl:rotate-180" />
				</Button>
			</div>
		{/if}
	{/snippet}
</Overlay.TooltipManager>
