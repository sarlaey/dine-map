import type { List, Restaurant } from './types';

class GlobalsClass {
	searchOpen = $state(false);
	restaurantDetailsId = $state<Restaurant['id'] | null>(null);
	toggleList = $state<Restaurant['id'] | null>(null);
	manageLists = $state(false);
	mapFilterList = $state<List['id'][]>([]);
}

const Globals = new GlobalsClass();
export default Globals;
