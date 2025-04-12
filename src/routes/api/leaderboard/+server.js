import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import { sandwiches, users } from "$lib/db/schema";
import { eq, count, desc, and } from "drizzle-orm";

export const GET = async () => {
    const result = await db
        .select({
            userId: users.id,
            username: users.username,
            sandwichCount: count(sandwiches.id).as("sandwichCount")
        })
        .from(users)
        .leftJoin(sandwiches, eq(users.id, sandwiches.userId))
        .where(
            and(
                eq(sandwiches.starRating, sandwiches.starRating),
                eq(sandwiches.imageUrl, sandwiches.imageUrl)
            )
        )
        .groupBy(users.id)
        .orderBy(desc("sandwichCount"))
        .limit(10);

    return json(result);
};
