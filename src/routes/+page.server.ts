import { RestaurantDAO } from '$lib/server/db/RestaurantDAO';
import type { PageServerLoad } from './$types';
import { TILE_CUSTOM } from '$env/static/private';
import { ListDAO } from '$lib/server/db/ListDAO';

export const load = (async () => {
	const restaurants = await RestaurantDAO.getAllRestaurants();
	const lists = await ListDAO.getAllLists();
	return {
		restaurants,
		lists,
		TILE_CUSTOM: TILE_CUSTOM === 'true'
	};
}) satisfies PageServerLoad;
