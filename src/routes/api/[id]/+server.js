import { json } from "@sveltejs/kit";
import 'dotenv/config'
import { db } from "$lib/db";
import { sandwiches, users } from "$lib/db/schema";
import { eq } from "drizzle-orm";

export const GET = async ({ params }) => {
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
			sauce: sandwiches.sauce,
			userId: sandwiches.userId,
			username: users.username, // may be null for anonymous
			imageUrl: sandwiches.imageUrl,
			starRating: sandwiches.starRating,
			comments: sandwiches.comments,
			createdAt: sandwiches.createdAt
		})
		.from(sandwiches)
		.where(eq(sandwiches.id, id))
		.leftJoin(users, eq(sandwiches.userId, users.id));

	const sandwich = result[0];

	if (!sandwich) {
		return json({ error: 'sandwich not found' }, { status: 404 });
	}

	return json(sandwich);
};
