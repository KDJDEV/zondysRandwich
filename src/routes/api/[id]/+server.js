import { json } from "@sveltejs/kit";
import 'dotenv/config'
import { db } from "$lib/db";
import { sandwiches, users } from "$lib/db/schema";
import { eq, and } from "drizzle-orm";

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
		.where(and(
			eq(sandwiches.id, id),
			eq(sandwiches.deleted, false)
		))
		.leftJoin(users, eq(sandwiches.userId, users.id));

	const sandwich = result[0];

	if (!sandwich) {
		return json({ error: 'sandwich not found' }, { status: 404 });
	}

	return json(sandwich);
};

export const DELETE = async ({ params, locals }) => {
	const sandwichId = Number(params.id);
	const user = locals?.user;

	if (!user) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	if (isNaN(sandwichId)) {
		return json({ error: "Invalid sandwich ID" }, { status: 400 });
	}

	const result = await db
		.select({ id: sandwiches.id })
		.from(sandwiches)
		.where(and(
			eq(sandwiches.id, sandwichId),
			eq(sandwiches.userId, user.id)
		));

	if (result.length === 0) {
		return json({ error: "Sandwich not found or not yours" }, { status: 403 });
	}

	const updated = await db
		.update(sandwiches)
		.set({ deleted: true })
		.where(eq(sandwiches.id, sandwichId))
		.returning({ id: sandwiches.id });

	return json({ success: true, deletedId: updated[0].id });
};