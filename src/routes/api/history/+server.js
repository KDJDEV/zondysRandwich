import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { sandwiches } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET = async (event) => {
	const user = event.locals?.user;

	if (!user) {
		return json({ error: 'not authorized' }, { status: 401 });
	}

	const userSandwiches = await db
		.select()
		.from(sandwiches)
		.where(eq(sandwiches.userId, user.id)).orderBy(desc(sandwiches.id));;

	return json(userSandwiches);
};
