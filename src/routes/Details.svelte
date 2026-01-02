<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import Globals from '$lib/globals.svelte';
	import type { List, NewReview, Restaurant } from '$lib/types';
	import { fade, scale, slide } from 'svelte/transition';
	import * as Field from '$lib/components/ui/field';
	import { Textarea } from '$lib/components/ui/textarea';
	import Rating from './Rating.svelte';
	import { invalidateAll } from '$app/navigation';
	import { formatDate } from '$lib/utils';
	import * as Empty from '$lib/components/ui/empty';
	import { Bookmark, Plus, Star, Trash2, UtensilsCrossed } from '@lucide/svelte';
	import EmojiPicker from '$lib/components/emojiPicker/emojiPicker.svelte';

	let restaurant = $derived(
		(page.data.restaurants as Restaurant[]).find((r) => r.id === Globals.restaurantDetailsId) ||
			null
	);
	let restaurantLists = $derived(
		(page.data.lists as List[]).filter((list) =>
			list.restaurants.map((r) => r.id).includes(restaurant?.id || '')
		)
	);
	let reviewOpen = $state(false);
	let newReview = $state<NewReview>({
		rating: 5,
		comment: '',
		// svelte-ignore state_referenced_locally
		restaurantId: ''
	});
	let isCreatingReview = $state(false);
	let deleteStates = $state({ confirmOpen: false, processing: false });

	$effect(() => {
		if (restaurant) {
			newReview.restaurantId = restaurant.id;
		}
	});

	async function submitReview() {
		isCreatingReview = true;
		const res = await fetch('/api/review', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(newReview)
		});
		const data = await res.json();
		if (!res.ok) {
			console.error('Failed to create review:', data);
			isCreatingReview = false;
			return;
		}
		await invalidateAll();
		isCreatingReview = false;
		reviewOpen = false;
	}

	$effect(() => {
		// Rest fields on close
		if (!reviewOpen) {
			newReview.rating = 5;
			newReview.comment = '';
		}
	});

	async function updateRestaurant(newData: Partial<Restaurant>) {
		if (!restaurant) return;
		const updatedRestaurant = { ...restaurant, ...newData, id: restaurant.id };
		const res = await fetch('/api/restaurant', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(updatedRestaurant)
		});
		const data = await res.json();
		if (!res.ok) {
			console.error('Failed to update restaurant:', data);
			return;
		}
		await invalidateAll();
	}

	async function deleteRestaurant() {
		if (!restaurant) return;
		deleteStates.processing = true;
		const res = await fetch('/api/restaurant', {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: restaurant.id })
		});
		const data = await res.json();
		if (!res.ok) {
			console.error('Failed to delete restaurant:', data);
			deleteStates.processing = false;
			return;
		}
		deleteStates.processing = false;
		Globals.restaurantDetailsId = null;
		await invalidateAll();
	}
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'Escape' && reviewOpen) {
			reviewOpen = false;
		}
	}}
/>

{#if restaurant}
	<div
		class="fixed inset-0 z-40 flex flex-col gap-4 bg-background p-2"
		transition:slide={{ axis: 'y', duration: 400 }}
	>
		<div class="flex flex-row items-center justify-between">
			<div class="flex flex-row gap-2">
				<EmojiPicker
					onSelect={(emoji) => {
						updateRestaurant({ icon: emoji });
					}}
					selectedEmoji={restaurant.icon}
				>
					<div
						class="relative flex size-8 flex-col items-center justify-center overflow-hidden rounded-[42%] border border-border bg-secondary"
					>
						<span class="text-xl">{restaurant.icon}</span>
					</div>
				</EmojiPicker>
				<h1 class="shrink-0 text-xl font-medium">
					{restaurant.name}
				</h1>
			</div>
			<Rating rating={restaurant.rating} compact={true} />
		</div>
		<!-- Restaurant in list pills -->
		<div class="flex flex-row items-center justify-between">
			<div class="flex grow flex-row flex-nowrap gap-2 overflow-x-auto">
				{#each restaurantLists as list}
					<div class="relative w-max rounded border-border bg-card px-2 py-0.5">
						<div class="absolute inset-0 overflow-hidden rounded">
							<span
								class="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 text-[120px] opacity-10 blur-xl"
								>{list.icon}</span
							>
						</div>
						<span class="font-medium text-nowrap whitespace-nowrap">{list.icon} {list.name}</span>
					</div>
				{/each}
			</div>

			<!-- manage place bookmarks button -->
			<Button class="shrink-0" size="icon-sm" onclick={() => (Globals.toggleList = restaurant.id)}>
				<Bookmark class="size-4" />
			</Button>
		</div>

		<!-- Main content (empty or reviews list) -->
		{#if restaurant.reviews.length === 0}
			<Empty.Root>
				<Empty.Header>
					<Empty.Media variant="icon">
						<UtensilsCrossed />
					</Empty.Media>
					<Empty.Title>No Reviews yet</Empty.Title>
					<Empty.Description>
						You haven't reviewed <b>{restaurant.name}</b> yet, click the button below to do so!
					</Empty.Description>
				</Empty.Header>
				<Empty.Content>
					<div class="flex gap-2">
						<Button
							variant="outline"
							class="flex flex-row gap-2"
							onclick={() => (Globals.toggleList = restaurant.id)}
						>
							<Bookmark class="size-4" />
							Bookmark
						</Button>
						<Button class="flex flex-row gap-2" onclick={() => (reviewOpen = true)}>
							<Star class="size-4" />
							Review
						</Button>
					</div>
				</Empty.Content>
			</Empty.Root>
		{:else}
			<div class="flex grow flex-col gap-2 overflow-y-auto">
				{#each restaurant.reviews as review}
					<div class="relative space-y-2 rounded border border-border p-3">
						<div class="flex flex-row items-center justify-between gap-4">
							<Rating rating={review.rating} compact={true} />
							<span class="text-sm text-muted-foreground">{formatDate(review.date)}</span>
						</div>
						<p>{review.comment}</p>
					</div>
				{/each}
			</div>
			<Button class="mt-auto flex shrink-0 flex-row gap-2" onclick={() => (reviewOpen = true)}>
				New review
				<Plus class="size-4" />
			</Button>
		{/if}

		<!-- Footer -->
		<div class="mt-auto flex shrink-0 flex-row gap-2">
			<Button variant="destructive" onclick={() => (deleteStates.confirmOpen = true)}>
				<Trash2 class="size-4 shrink-0" />
			</Button>
			<Button variant="outline" class="grow" onclick={() => (Globals.restaurantDetailsId = null)}>
				Close
			</Button>
		</div>
	</div>
	<!-- New review modal -->
	{#if reviewOpen}
		<div
			class="fixed inset-0 z-40 bg-background/50 backdrop-blur-xs"
			transition:fade={{ duration: 200 }}
		></div>
		<div
			class="fixed top-1/2 left-1/2 z-40 w-[90%] max-w-150 -translate-x-1/2 -translate-y-1/2 space-y-6 rounded border border-border bg-card p-4"
			transition:scale={{ duration: 200, start: 0.5 }}
		>
			<h2 class="text-xl font-medium">New review for {restaurant.name}</h2>
			<div class="flex flex-col gap-2">
				<Field.Field>
					<Field.Label for="newReviewRating">Rating</Field.Label>
					<Rating
						rating={newReview.rating}
						id="newReviewRating"
						onStarClick={(starIndex) => (newReview.rating = starIndex + 1)}
					/>
				</Field.Field>
				<Field.Field>
					<Field.Label for="newReviewComment">Comment</Field.Label>
					<Textarea
						bind:value={newReview.comment}
						id="newReviewComment"
						placeholder="Your comment on the place"
						class="resize-none"
					/>
				</Field.Field>
			</div>

			<div class="flex flex-row items-center justify-end gap-2">
				<Button variant="outline" onclick={() => (reviewOpen = false)} disabled={isCreatingReview}
					>Cancel</Button
				>
				<Button
					variant="default"
					onclick={submitReview}
					disabled={isCreatingReview}
					loading={isCreatingReview}>Create</Button
				>
			</div>
		</div>
	{/if}
{/if}

<!-- Delete POI confirm modal -->
{#if deleteStates.confirmOpen && restaurant}
	<div
		class="fixed inset-0 z-40 bg-background/50 backdrop-blur-xs"
		transition:fade={{ duration: 200 }}
	></div>
	<div
		class="fixed top-1/2 left-1/2 z-40 w-[90%] max-w-150 -translate-x-1/2 -translate-y-1/2 space-y-6 rounded border border-border bg-card p-4"
		transition:scale={{ duration: 200, start: 0.5 }}
	>
		<h2 class="text-xl font-medium">Delete {restaurant.name}</h2>
		<p>Are you sure you want to delete this restaurant? This action cannot be undone.</p>

		<div class="flex flex-row items-center justify-end gap-2">
			<Button
				variant="outline"
				onclick={() => (deleteStates.confirmOpen = false)}
				disabled={deleteStates.processing}>Cancel</Button
			>
			<Button
				variant="destructive"
				onclick={deleteRestaurant}
				disabled={deleteStates.processing}
				loading={deleteStates.processing}>Delete</Button
			>
		</div>
	</div>
{/if}
