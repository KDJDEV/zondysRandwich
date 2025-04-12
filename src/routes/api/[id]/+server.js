import { json } from "@sveltejs/kit";
import 'dotenv/config'
import { db } from "$lib/db";
import { sandwiches, users } from "$lib/db/schema";
import { eq } from "drizzle-orm";

export const GET = async ({ params, locals }) => {
	const user = locals?.user;

	if (!user) {
		return json({ error: 'not authorized' }, { status: 401 });
	}

	const id = Number(params.id);

	if (isNaN(id)) {
		return json({ error: 'invalid id' }, { status: 400 });
	}

	const result = await db
		.select({
			id: sandwiches.id,
			name: sandwiches.name,
			bread: sandwiches.bread,
			protein: sandwiches.protein,
			cheese: sandwiches.cheese,
			toppings: sandwiches.toppings,
			userId: sandwiches.userId,
			username: users.username,
			imageUrl: sandwiches.imageUrl,
			starRating: sandwiches.starRating,
			comments: sandwiches.comments
		})
		.from(sandwiches)
		.where(eq(sandwiches.id, id))
		.innerJoin(users, eq(sandwiches.userId, users.id));

	const sandwich = result[0];

	if (!sandwich) {
		return json({ error: 'sandwich not found' }, { status: 404 });
	}

    /*
	if (sandwich.userId !== user.id) {
		return json({ error: 'forbidden' }, { status: 403 });
	}
    */

	return json(sandwich);
};