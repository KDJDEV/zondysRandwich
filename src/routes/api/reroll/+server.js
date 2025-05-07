import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import { sandwiches } from "$lib/db/schema";
import { eq, and } from "drizzle-orm";

export const POST = async (event) => {
	const user = event.locals?.user;

	if (!user) {
		return json({ error: "User must be logged in." }, { status: 401 });
	}

	const body = await event.request.json();
	const sandwichId = body.id;

	if (!sandwichId) {
		return json({ error: "Missing sandwich ID." }, { status: 400 });
	}

	try {
		const result = await db
			.update(sandwiches)
			.set({ rerolled: true })
			.where(and(eq(sandwiches.id, sandwichId), eq(sandwiches.userId, user.id)))
			.returning();

		if (result.length === 0) {
			return json({ error: "Sandwich not found or not yours." }, { status: 404 });
		}

		return json({ success: true, sandwich: result[0] });
	} catch (error) {
		console.error("Error setting rerolled flag:", error);
		return json({ error: "Database update failed." }, { status: 500 });
	}
};
