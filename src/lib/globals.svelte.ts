import type { Restaurant } from "./types";

class GlobalsClass {
	searchOpen = $state(false);
	restaurantDetailsId = $state<Restaurant['id'] | null>(null);
	toggleList = $state<Restaurant['id'] | null>(null);
	manageLists = $state(false);
}


const Globals = new GlobalsClass();
export default Globals;
