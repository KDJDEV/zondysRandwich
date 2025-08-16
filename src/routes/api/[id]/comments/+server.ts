import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db";
import { sandwichComments } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from "obscenity";
export const GET = async ({ params }) => {
	const sandwichId = Number(params.id);

	if (isNaN(sandwichId)) return json({ comments: [] });

	try {
		const comments = await db
			.select()
			.from(sandwichComments)
			.where(eq(sandwichComments.sandwichId, sandwichId))
			.orderBy(sandwichComments.createdAt);

		return json({ comments });
	} catch (err) {
		console.error(err);
		return json({ comments: [] }, { status: 500 });
	}
};

// Obscenity filter setup
const matcher = new RegExpMatcher({
	...englishDataset.build(),
	...englishRecommendedTransformers,
});

export const POST = async ({ request, params, locals }) => {
    const user = locals.user;
    if (!user) throw error(401, "Unauthorized");

    const sandwichId = Number(params.id);
    if (isNaN(sandwichId)) throw error(400, "Invalid sandwich ID");

    const body = await request.json();
    const { comments } = body;

    if (!comments) throw error(400, "Missing required fields");

    if (matcher.hasMatch(comments)) {
        return json({ success: false, error: "Comments contain inappropriate language." }, { status: 422 });
    }

    try {
        const result = await db
            .insert(sandwichComments)
            .values({
                sandwichId,
                userId: user.id,
                username: user.username,
                comments
            })
            .returning();

        return json({ success: true, comment: result[0] });
    } catch (err) {
        console.error(err);
        return json({ success: false, error: "Failed to add comment" }, { status: 500 });
    }
};