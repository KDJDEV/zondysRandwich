import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import { sandwiches } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";

// Initialize obscenity matcher
const matcher = new RegExpMatcher({
    ...englishDataset.build(),
    ...englishRecommendedTransformers,
});

function isValidSandwichUrl(url: string) {
	const regex = /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/sandwiches\/uploads\/[a-f0-9]{32}\.jpg$/;
	return regex.test(url);
}

export const PATCH = async (event) => {
	const user = event.locals?.user;

	if (!user) {
		return json({ error: "not authorized" }, { status: 401 });
	}

	// Require verified user
	if (!user.emailVerified) {
		return json({ error: "account must be verified to update a sandwich" }, { status: 403 });
	}

	const body = await event.request.json();
	const { id, comments, starRating, imageUrl } = body;

	if (!id) {
		return json({ error: "sandwich id is required" }, { status: 400 });
	}

	// Validate star rating
	if (starRating !== undefined && ![1, 2, 3, 4, 5].includes(starRating)) {
		return json({ error: "starRating must be an integer from 1 to 5" }, { status: 400 });
	}

	// Validate image URL
	if (!isValidSandwichUrl(imageUrl)) {
		return json({ error: "imageUrl must be valid" }, { status: 400 });
	}

	// Obscenity check for comments
	if (comments && matcher.hasMatch(comments)) {
		return json({ error: "Comments contain inappropriate language." }, { status: 422 });
	}

	try {
		await db
			.update(sandwiches)
			.set({
				...(comments !== undefined && { comments }),
				...(starRating !== undefined && { starRating }),
				...(imageUrl !== undefined && { imageUrl })
			})
			.where(eq(sandwiches.id, id));

		return json({ success: true });
	} catch (err) {
		console.error("Update failed:", err);
		return json({ error: "Failed to update sandwich" }, { status: 500 });
	}
};
