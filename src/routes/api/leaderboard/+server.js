import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import { sandwiches, users } from "$lib/db/schema";
import { eq, count, desc, and, isNotNull } from "drizzle-orm";

export const GET = async () => {
    const sandwichCount = count(sandwiches.id).as("sandwichCount");

    const result = await db
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

    return json(result);
};