<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import Globals from '$lib/globals.svelte';
	import { availableEmojis, type List, type NewList, type Restaurant } from '$lib/types';
	import { Map, Pen, Plus, Save, Trash, X } from '@lucide/svelte';
	import { fade, scale, slide } from 'svelte/transition';
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
	let listDetailsId = $state<List['id'] | null>(null);
	let deleteListConfirmOpen = $state(false);
	let deleteListStates = $state<{ processing: boolean; open: boolean; list: List | null }>({
		processing: false,
		open: false,
		list: null
	});
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

	async function addToList(listId: List['id'], restaurantId: Restaurant['id']) {
		const res = await fetch(`/api/list/item`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ listId, restaurantId })
		});
		if (!res.ok) {
			console.error('Failed to add restaurant to list');
			return;
		}
		await invalidateAll();
		Globals.toggleList = null;
	}

	async function removeFromList(listId: List['id'], restaurantId: Restaurant['id']) {
		const res = await fetch(`/api/list/item`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ listId, restaurantId })
		});
		if (!res.ok) {
			console.error('Failed to remove restaurant from list');
			return;
		}
		await invalidateAll();
		Globals.toggleList = null;
	}

	async function toggleRestaurantInList(listId: List['id']) {
		if (!restaurant) return;
		if (isRestaurantInList(listId)) {
			await removeFromList(listId, restaurant.id);
		} else {
			await addToList(listId, restaurant.id);
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

	async function deleteList() {
		if (!editListId) return;
		const res = await fetch(`/api/list`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: editListId })
		});
		if (!res.ok) {
			console.error('Failed to delete list');
			return;
		}
		editListId = null;
		deleteListStates = { processing: false, open: false, list: null };
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

	function onListItemClick(event: MouseEvent, listId: List['id']) {
		const target = event.target as HTMLElement;
		if (!target.closest('.listItem') || target.closest('button') || editListId) return;

		listDetailsId = listDetailsId ? null : listId;
	}
</script>

{#snippet listIcon(icon: List['icon'], id: List['id'], isEditing: boolean)}
	<div
		class="relative flex size-12 shrink-0 flex-col items-center justify-center overflow-hidden rounded-[42%] border border-border bg-secondary"
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
		class="fixed top-1/2 left-1/2 z-40 max-h-dvh w-[90%] max-w-125 -translate-x-1/2 -translate-y-1/2 space-y-6 rounded border border-border bg-card p-4"
		transition:scale={{ duration: 200, start: 0.5 }}
	>
		{#if restaurant}
			<h2 class="text-xl font-medium">Save {restaurant.name}</h2>
		{/if}
		<div
			class={cn(
				'flex flex-col transition-all duration-300',
				createListOpen && 'pointer-events-none blur-xs'
			)}
		>
			{#if restaurant}
				{#each lists as list, i (list.id)}
					<button
						onclick={() => toggleRestaurantInList(list.id)}
						class={cn(
							'flex flex-row items-center justify-start gap-2 text-start',
							i !== 0 && 'mt-2'
						)}
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
				{#each lists as list, i (list.id)}
					{@const isEditingThisList = editListId === list.id}
					{#if !listDetailsId || listDetailsId === list.id}
						<div
							class={cn('flex flex-col', i !== 0 && 'mt-2')}
							transition:slide={{ duration: 300, axis: 'y' }}
						>
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<div
								onclick={(e) => onListItemClick(e, list.id)}
								tabindex={0}
								role="button"
								class={cn(
									'listItem flex flex-row items-center justify-start gap-2 text-start transition-all',
									editListId && !isEditingThisList && 'pointer-events-none blur-xs'
								)}
							>
								{#if isEditingThisList}
									<EmojiPicker
										class="shrink-0"
										selectedEmoji={editedList.icon}
										onSelect={(emoji) => {
											editedList.icon = emoji;
										}}
									>
										{@render listIcon(editedList.icon, list.id, isEditingThisList)}
									</EmojiPicker>
								{:else}
									{@render listIcon(list.icon, list.id, isEditingThisList)}
								{/if}
								<div class="relative h-full grow">
									{#if isEditingThisList}
										<div class="flex flex-col gap-1" transition:slide={{ axis: 'y' }}>
											<Input bind:value={editedList.name} placeholder="Name" />
											<Textarea
												id="newListDescription"
												bind:value={editedList.description}
												placeholder="Description"
												class="resize-none"
												autoFit={{ active: true, maxRows: 4 }}
											/>
										</div>
									{:else}
										<div
											class="absolute top-1/2 right-0 left-0 flex -translate-y-1/2 flex-col"
											in:slide={{ axis: 'y' }}
										>
											<span class="text-lg font-medium">
												{list.name}
											</span>
											<span class="line-clamp-1 text-sm font-normal text-muted-foreground">
												{list.description}
											</span>
										</div>
									{/if}
								</div>

								<div class="flex flex-col">
									<Button
										class="shrink-0"
										size="icon-sm"
										onclick={() => {
											listDetailsId = null;
											if (isEditingThisList) {
												saveList();
											} else {
												editListId = list.id;
											}
										}}
									>
										{#if isEditingThisList}
											<div class="size-4" in:scale={{ duration: 200 }}>
												<Save class="size-full" />
											</div>
										{:else}
											<div class="size-4" in:scale={{ duration: 200 }}>
												<Pen class="size-full" />
											</div>
										{/if}
									</Button>
									{#if editListId === list.id}
										<div class="mt-2 shrink-0" transition:slide={{ axis: 'y' }}>
											<Button
												variant="destructive"
												size="icon-sm"
												onclick={() =>
													(deleteListStates = { ...deleteListStates, open: true, list })}
											>
												<Trash class="size-4" />
											</Button>
										</div>
									{/if}
								</div>
							</div>
							<!-- List of restaurants details -->
							{#if listDetailsId === list.id}
								<div
									class="mt-2 flex max-h-[60dvh] flex-col gap-2 overflow-y-auto"
									transition:slide={{ duration: 300, axis: 'y' }}
								>
									{#each list.restaurants as restaurant (restaurant.id)}
										<div
											class="flex flex-row justify-between rounded border border-border p-2"
											transition:slide={{ duration: 200, axis: 'y' }}
										>
											<div class="flex flex-row items-center gap-2">
												<span class="text-lg">{restaurant.icon}</span>
												<p class="line-clamp-1 text-lg font-medium">
													{restaurant.name}
												</p>
											</div>
											<Button
												variant="destructive"
												size="icon-sm"
												onclick={() => removeFromList(list.id, restaurant.id)}
											>
												<Trash class="size-4" />
											</Button>
										</div>
									{:else}
										<div
											class="text-sm text-muted-foreground"
											in:slide={{ duration: 200, axis: 'y', delay: 200 }}
											out:slide={{ duration: 200, axis: 'y' }}
										>
											No restaurants in this list.
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				{/each}
			{/if}
		</div>
		{#if createListOpen}
			<div class="mt-2 flex flex-col gap-2" transition:slide={{ duration: 300 }}>
				<Input bind:value={createListContent.name} placeholder="Name" />
				<Textarea
					id="newListDescription"
					bind:value={createListContent.description}
					placeholder="Description"
					class="resize-none"
					autoFit={{ active: true, maxRows: 4 }}
				/>
			</div>
		{/if}

		<div class="flex flex-row items-center">
			{#if !editListId}
				<div class="w-full ltr:mr-2 rtl:ml-2" transition:slide={{ axis: 'x', duration: 300 }}>
					<Button
						class="flex w-full flex-row gap-2"
						onclick={() => {
							if (createListOpen) {
								createList();
							} else if (listDetailsId) {
								Globals.mapFilterList = [listDetailsId];
								Globals.manageLists = false;
								Globals.toggleList = null;
								listDetailsId = null;
							} else {
								createListOpen = true;
							}
						}}
						disabled={createListOpen && (createListContent.name.trim() === '' || isCreatingList)}
					>
						{#if listDetailsId}
							<span class="size-4" in:scale={{ duration: 200 }}>
								<Map class="size-4" />
							</span>
						{:else}
							<span class="size-4" in:scale={{ duration: 200 }}>
								<Plus class="size-4" />
							</span>
						{/if}
						{listDetailsId ? 'See on map' : createListOpen ? 'Create' : 'Create new list'}
					</Button>
				</div>
			{/if}
			<Button
				variant="outline"
				class="ltr:ml-auto rtl:mr-auto"
				onclick={() => {
					if (createListOpen) {
						createListOpen = false;
					} else if (editListId) {
						editListId = null;
					} else if (listDetailsId) {
						listDetailsId = null;
					} else {
						Globals.toggleList = null;
						Globals.manageLists = false;
						listDetailsId = null;
					}
				}}>{createListOpen || editListId ? 'Cancel' : 'Close'}</Button
			>
		</div>
	</div>
{/if}

<!-- Delete list confirm modal -->
{#if deleteListStates.open}
	<div
		class="fixed inset-0 z-40 bg-background/50 backdrop-blur-xs"
		transition:fade={{ duration: 200 }}
	></div>
	<div
		class="fixed top-1/2 left-1/2 z-40 w-[90%] max-w-150 -translate-x-1/2 -translate-y-1/2 space-y-6 rounded border border-border bg-card p-4"
		transition:scale={{ duration: 200, start: 0.5 }}
	>
		<h2 class="text-xl font-medium">Delete {deleteListStates.list!.name}</h2>
		<p>Are you sure you want to delete this list? This action cannot be undone.</p>

		<div class="flex flex-row items-center justify-end gap-2">
			<Button
				variant="outline"
				onclick={() => (deleteListConfirmOpen = false)}
				disabled={deleteListStates.processing}>Cancel</Button
			>
			<Button
				variant="destructive"
				onclick={deleteList}
				disabled={deleteListStates.processing}
				loading={deleteListStates.processing}>Delete</Button
			>
		</div>
	</div>
{/if}
