import { ListDAO } from '$lib/server/db/ListDAO';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ListZ, NewListZ } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	const params = url.searchParams;
	const id = params.get('id');
	if(id) {
		const list = await ListDAO.getListById(id);
		if(!list) {
			return json({ error: 'List not found' }, { status: 404 });
		}
		return json(list);
	}else {
		const allLists = await ListDAO.getAllLists();
		return json(allLists);
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const schema = NewListZ;
	const body = await request.json();
	const parseResult = schema.safeParse(body);
	if (!parseResult.success) {
		return json({ error: 'Invalid request body', details: parseResult.error }, { status: 400 });
	}
	const newList = parseResult.data;
	const createdList = await ListDAO.createList(newList);
	return json(createdList, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const schema = ListZ.omit({ createdAt: true, restaurants: true });
	const body = await request.json();
	const parseResult = schema.safeParse(body);
	if (!parseResult.success) {
		return json({ error: 'Invalid request body', details: parseResult.error }, { status: 400 });
	}
	const { id, name, description, icon } = parseResult.data;
	const updatedList = await ListDAO.updateList(id, { name, description, icon });
	if (!updatedList) {
		return json({ error: 'List not found' }, { status: 404 });
	}
	return json(updatedList);
};
