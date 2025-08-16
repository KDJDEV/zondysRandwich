import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import { sandwiches, users } from "$lib/db/schema";
import { eq, count, desc, and, isNotNull, gte } from "drizzle-orm";

export const GET = async () => {
    const sandwichCount = count(sandwiches.id).as("sandwichCount");

    // First day of the current month (UTC)
    const now = new Date();
    const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    // All-time leaderboard
    const allTime = await db
        .select({
            userId: users.id,
            username: users.username,
            sandwichCount
        })
        .from(users)
        .leftJoin(sandwiches, eq(users.id, sandwiches.userId))
        .where(
            and(
                isNotNull(sandwiches.starRating),
                isNotNull(sandwiches.imageUrl)
            )
        )
        .groupBy(users.id)
        .orderBy(desc(sandwichCount))
        .limit(10);

    // This-month leaderboard
    const thisMonth = await db
        .select({
            userId: users.id,
            username: users.username,
            sandwichCount
        })
        .from(users)
        .leftJoin(sandwiches, eq(users.id, sandwiches.userId))
        .where(
            and(
                isNotNull(sandwiches.starRating),
                isNotNull(sandwiches.imageUrl),
                gte(sandwiches.createdAt, firstOfMonth)
            )
        )
        .groupBy(users.id)
        .orderBy(desc(sandwichCount))
        .limit(10);

    return json({ allTime, thisMonth });
};
