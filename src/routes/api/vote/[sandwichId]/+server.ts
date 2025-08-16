import { json, error } from "@sveltejs/kit";
import { db } from "$lib/db";
import { sandwichVotes } from "$lib/db/schema";
import { eq, and, count } from "drizzle-orm";

export const POST = async ({ params, locals }) => {
    const userId = locals.user?.id;
    if (!userId) throw error(401, "Unauthorized");
    
    if (!locals?.user?.emailVerified) {
        throw error(403, "Email must be verified to vote");
    }

    const sandwichId = parseInt(params.sandwichId);
    if (isNaN(sandwichId)) throw error(400, "Invalid sandwich ID");

    // Check if the vote exists
    const existingVote = await db
        .select()
        .from(sandwichVotes)
        .where(and(
            eq(sandwichVotes.sandwichId, sandwichId),
            eq(sandwichVotes.userId, userId)
        ));

    if (existingVote.length > 0) {
        // Already voted, remove vote (toggle)
        await db.delete(sandwichVotes)
            .where(and(
                eq(sandwichVotes.sandwichId, sandwichId),
                eq(sandwichVotes.userId, userId)
            ));

        // Count remaining votes
        const voteCountResult = await db
            .select({ count: count(sandwichVotes.id) })
            .from(sandwichVotes)
            .where(eq(sandwichVotes.sandwichId, sandwichId));

        const voteCount = Number(voteCountResult[0]?.count ?? 0);

        return json({ message: "Vote removed", hasVoted: false, voteCount });
    } else {
        // Add vote
        await db.insert(sandwichVotes).values({
            sandwichId,
            userId
        });

        // Count total votes
        const voteCountResult = await db
            .select({ count: count(sandwichVotes.id) })
            .from(sandwichVotes)
            .where(eq(sandwichVotes.sandwichId, sandwichId));

        const voteCount = Number(voteCountResult[0]?.count ?? 0);

        return json({ message: "Vote added", hasVoted: true, voteCount });
    }
};
