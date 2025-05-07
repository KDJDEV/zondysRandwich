import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { sandwiches } from '$lib/db/schema';
import { eq, desc, not, and } from 'drizzle-orm';

export const GET = async (event) => {
	const userId = event.url.searchParams.get('userId');

	if (!userId) {
		return json({ error: 'userId is required' }, { status: 400 });
	}

	const userSandwiches = await db
		.select()
		.from(sandwiches)
		.where(and(
			eq(sandwiches.userId, userId),
			not(eq(sandwiches.rerolled, true)),
			eq(sandwiches.deleted, false)
		))
		.orderBy(desc(sandwiches.id));

	return json(userSandwiches);
};
