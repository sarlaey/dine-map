<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import Globals from '$lib/globals.svelte';
	import { availableEmojis, type List, type NewList, type Restaurant } from '$lib/types';
	import { Pen, Plus, Save, X } from '@lucide/svelte';
	import { fade, scale } from 'svelte/transition';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { invalidateAll } from '$app/navigation';
	import { cn } from '$lib/utils';
	import EmojiPicker from '$lib/components/emojiPicker/emojiPicker.svelte';

	let restaurant = $derived(
		(page.data.restaurants as Restaurant[]).find((r) => r.id === Globals.toggleList) || null
	);
	let lists = $derived<List[]>(page.data.lists);
	let createListOpen = $state(false);
	let createListContent = $state({ name: '', description: '' });
	let isCreatingList = $state(false);
	let editListId = $state<List['id'] | null>(null);
	let editedList = $state<Required<NewList>>({
		name: '',
		description: '',
		icon: availableEmojis[0]
	});

	async function createList() {
		isCreatingList = true;
		// Implement list creation logic here
		const res = await fetch('/api/list', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(createListContent)
		});
		if (!res.ok) {
			console.error('Failed to create list');
			isCreatingList = false;
			return;
		}
		await invalidateAll();
		isCreatingList = false;
		createListOpen = false;
	}

	async function addToList(listId: List['id']) {
		if (!restaurant) return;
		const res = await fetch(`/api/list/item`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ listId, restaurantId: restaurant.id })
		});
		if (!res.ok) {
			console.error('Failed to add restaurant to list');
			return;
		}
		await invalidateAll();
		Globals.toggleList = null;
	}

	async function removeFromList(listId: List['id']) {
		if (!restaurant) return;
		const res = await fetch(`/api/list/item`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ listId, restaurantId: restaurant.id })
		});
		if (!res.ok) {
			console.error('Failed to remove restaurant from list');
			return;
		}
		await invalidateAll();
		Globals.toggleList = null;
	}

	async function toggleRestaurantInList(listId: List['id']) {
		if (isRestaurantInList(listId)) {
			await removeFromList(listId);
		} else {
			await addToList(listId);
		}
	}

	const isRestaurantInList = (listId: List['id']) => {
		if (!restaurant) return false;
		const list = lists.find((l) => l.id === listId);
		if (!list) return false;
		return list.restaurants.map((r) => r.id).includes(restaurant.id);
	};

	async function saveList() {
		const res = await fetch(`/api/list`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ ...editedList, id: editListId })
		});
		if (!res.ok) {
			console.error('Failed to save list');
			return;
		}
		editListId = null;
		await invalidateAll();
	}

	$effect(() => {
		if (editListId) {
			const list = lists.find((l) => l.id === editListId);
			if (list) {
				editedList = { name: list.name, description: list.description || '', icon: list.icon };
			}
		}
	});

	$effect(() => {
		if (!restaurant && !Globals.manageLists) {
			editListId = null;
			editedList = { name: '', description: '', icon: availableEmojis[0] };
			isCreatingList = false;
			createListContent = { name: '', description: '' };
			createListOpen = false;
		}
	});
</script>

{#snippet listIcon(icon: List['icon'], id: List['id'], isEditing: boolean)}
	<div
		class="relative flex size-12 flex-col items-center justify-center overflow-hidden rounded-[42%] border border-border bg-secondary"
	>
		<span class="text-2xl">{icon}</span>
		{#if isRestaurantInList(id) && !isEditing}
			<div
				class="absolute inset-0 flex flex-col items-center justify-center bg-card text-destructive opacity-50"
			>
				<X class="size-6" />
			</div>
		{/if}
	</div>
{/snippet}

{#if restaurant || Globals.manageLists}
	<div
		class="fixed inset-0 z-40 bg-background/50 backdrop-blur-xs"
		transition:fade={{ duration: 200 }}
	></div>
	<div
		class="fixed top-1/2 left-1/2 z-40 w-[90%] max-w-125 -translate-x-1/2 -translate-y-1/2 space-y-6 rounded border border-border bg-card p-4"
		transition:scale={{ duration: 200, start: 0.5 }}
	>
		{#if restaurant}
			<h2 class="text-xl font-medium">Save {restaurant.name}</h2>
		{/if}
		<div class="flex flex-col gap-2">
			{#if restaurant}
				{#each lists as list}
					<button
						onclick={() => toggleRestaurantInList(list.id)}
						class="flex flex-row items-center justify-start gap-2 text-start"
					>
						{@render listIcon(list.icon, list.id, false)}
						<div class="flex flex-col">
							<span class="text-lg font-medium">
								{list.name}
							</span>
							<span class="line-clamp-1 text-sm font-normal text-muted-foreground">
								{list.description}
							</span>
						</div>
					</button>
				{/each}
			{:else}
				{#each lists as list}
					{@const isEditing = editListId === list.id}
					<div class="flex flex-row items-center justify-start gap-2 text-start">
						{#if isEditing}
							<EmojiPicker
								selectedEmoji={editedList.icon}
								onSelect={(emoji) => {
									editedList.icon = emoji;
								}}
							>
								{@render listIcon(editedList.icon, list.id, isEditing)}
							</EmojiPicker>
						{:else}
							{@render listIcon(list.icon, list.id, isEditing)}
						{/if}
						<div class={cn('flex grow flex-col', isEditing && 'gap-1')}>
							{#if isEditing}
								<Input bind:value={editedList.name} placeholder="Name" />
								<Textarea
									id="newListDescription"
									bind:value={editedList.description}
									placeholder="Description"
									class="resize-none"
									autoFit={{ active: true, maxRows: 4 }}
								/>
							{:else}
								<span class="text-lg font-medium">
									{list.name}
								</span>
								<span class="line-clamp-1 text-sm font-normal text-muted-foreground">
									{list.description}
								</span>
							{/if}
						</div>

						<Button
							class="shrink-0"
							size="icon"
							onclick={() => {
								if (isEditing) {
									saveList();
								} else {
									editListId = list.id;
								}
							}}
						>
							{#if isEditing}
								<div class="size-4" in:scale={{ duration: 200 }}>
									<Save class="size-full" />
								</div>
							{:else}
								<div class="size-4" in:scale={{ duration: 200 }}>
									<Pen class="size-full" />
								</div>
							{/if}
						</Button>
					</div>
				{/each}
			{/if}
			<div>
				{#if createListOpen}
					<div class="flex flex-row items-end gap-2">
						<div class="flex grow flex-col gap-2">
							<Input bind:value={createListContent.name} placeholder="Name" />
							<Textarea
								id="newListDescription"
								bind:value={createListContent.description}
								placeholder="Description"
								class="resize-none"
								autoFit={{ active: true, maxRows: 4 }}
							/>
						</div>
						<Button
							size="icon"
							variant="outline"
							disabled={createListContent.name.trim() === '' || isCreatingList}
							onclick={createList}
						>
							<Plus class="size-4" />
						</Button>
					</div>
				{:else}
					<Button
						variant="outline"
						class="flex w-full flex-row gap-2"
						onclick={() => (createListOpen = true)}
					>
						<Plus class="size-4" />
						Create new list
					</Button>
				{/if}
			</div>
		</div>

		<div class="flex flex-row items-center justify-end gap-2">
			<Button
				variant="outline"
				onclick={() => {
					Globals.toggleList = null;
					Globals.manageLists = false;
				}}>Cancel</Button
			>
		</div>
	</div>
{/if}
