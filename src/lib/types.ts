import z from 'zod';

export const UUIDZ = z.uuid();
export type UUID = z.infer<typeof UUIDZ>;

export const CoordinatesZ = z.tuple([z.number(), z.number()]);
export type Coordinates = z.infer<typeof CoordinatesZ>;

export const ViewboxZ = z.tuple([z.number(), z.number(), z.number(), z.number()]);
export type Viewbox = z.infer<typeof ViewboxZ>;

export const availableEmojis = [
	'🌭',
	'🌮',
	'🌯',
	'🌰',
	'🌶',
	'🌽',
	'🍄‍🟫',
	'🍅',
	'🍆',
	'🍇',
	'🍈',
	'🍉',
	'🍊',
	'🍋',
	'🍋‍🟩',
	'🍌',
	'🍍',
	'🍎',
	'🍏',
	'🍐',
	'🍑',
	'🍒',
	'🍓',
	'🍔',
	'🍕',
	'🍖',
	'🍗',
	'🍘',
	'🍙',
	'🍚',
	'🍛',
	'🍜',
	'🍝',
	'🍞',
	'🍟',
	'🍠',
	'🍡',
	'🍢',
	'🍣',
	'🍤',
	'🍥',
	'🍦',
	'🍧',
	'🍨',
	'🍩',
	'🍪',
	'🍫',
	'🍬',
	'🍭',
	'🍮',
	'🍯',
	'🍰',
	'🍱',
	'🍲',
	'🍳',
	'🍴',
	'🍵',
	'🍶',
	'🍷',
	'🍸',
	'🍹',
	'🍺',
	'🍻',
	'🍼',
	'🍽',
	'🍾',
	'🍿',
	'🎂',
	'🏺',
	'🔪',
	'🥂',
	'🥃',
	'🥄',
	'🥐',
	'🥑',
	'🥒',
	'🥓',
	'🥔',
	'🥕',
	'🥖',
	'🥗',
	'🥘',
	'🥙',
	'🥚',
	'🥛',
	'🥜',
	'🥝',
	'🥞',
	'🥟',
	'🥠',
	'🥡',
	'🥢',
	'🥣',
	'🥤',
	'🥥',
	'🥦',
	'🥧',
	'🥨',
	'🥩',
	'🥪',
	'🥫',
	'🥬',
	'🥭',
	'🥮',
	'🥯',
	'🧀',
	'🧁',
	'🧂',
	'🧃',
	'🧄',
	'🧅',
	'🧆',
	'🧇',
	'🧈',
	'🧉',
	'🧊',
	'🧋',
	'🫐',
	'🫑',
	'🫒',
	'🫓',
	'🫔',
	'🫕',
	'🫖',
	'🫗',
	'🫘',
	'🫙',
	'🫚',
	'🫛',
	'🫜'
] as const;

export const ReviewZ = z.object({
	id: UUIDZ,
	rating: z.number().min(0).max(5),
	comment: z.string(),
	restaurantId: UUIDZ,
	date: z.date()
});
export type Review = z.infer<typeof ReviewZ>;
export const NewReviewZ = ReviewZ.omit({ id: true, date: true });
export type NewReview = z.infer<typeof NewReviewZ>;

export const RestaurantZ = z.object({
	id: UUIDZ,
	name: z.string(),
	coordinates: CoordinatesZ,
	rating: z.number().min(0).max(5),
	reviews: z.array(z.lazy(() => ReviewZ)),
	icon: z.enum(availableEmojis)
});
export type Restaurant = z.infer<typeof RestaurantZ>;
export const NewRestaurantZ = RestaurantZ.omit({
	id: true,
	reviews: true,
	rating: true,
	icon: true
});
export type NewRestaurant = z.infer<typeof NewRestaurantZ>;

export type AvailableEmojis = (typeof availableEmojis)[number];
export const ListZ = z.object({
	id: UUIDZ,
	name: z.string(),
	description: z.string().optional(),
	createdAt: z.date(),
	restaurants: z.array(RestaurantZ),
	icon: z.enum(availableEmojis)
});
export type List = z.infer<typeof ListZ>;
export const NewListZ = ListZ.omit({ id: true, createdAt: true, restaurants: true });
export type NewList = z.infer<typeof NewListZ>;
