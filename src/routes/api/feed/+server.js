import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import { sandwiches, users, sandwichVotes } from "$lib/db/schema";
import { sql, desc, eq, and, isNotNull } from "drizzle-orm";

export const GET = async ({ url, locals }) => {
    const userId = locals.user?.id ?? null;

    const sort = url.searchParams.get("sort") || "recent"; // "recent" | "upvoted"
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const baseWhere = and(
        isNotNull(sandwiches.starRating),
        isNotNull(sandwiches.imageUrl)
    );

   const orderBy =
  sort === "upvoted"
    ? [
        desc(sql`COUNT(${sandwichVotes.id})`), // vote count
        desc(sandwiches.createdAt),            // break ties by recency
        desc(sandwiches.id)                    // final unique tiebreaker
      ]
    : [
        desc(sandwiches.createdAt),
        desc(sandwiches.id) // add ID here too, to make recent stable
      ];

const feed = await db
  .select({
    sandwichId: sandwiches.id,
    imageUrl: sandwiches.imageUrl,
    starRating: sandwiches.starRating,
    createdAt: sandwiches.createdAt,
    comments: sandwiches.comments,
    name: sandwiches.name,
    userId: users.id,
    username: users.username,
    voteCount: sql`COUNT(${sandwichVotes.id})`,
    hasVoted: userId
      ? sql`BOOL_OR(${sandwichVotes.userId} = ${userId}::int)`
      : sql`false`
  })
  .from(sandwiches)
  .leftJoin(users, eq(users.id, sandwiches.userId))
  .leftJoin(sandwichVotes, eq(sandwiches.id, sandwichVotes.sandwichId))
  .where(baseWhere)
  .groupBy(sandwiches.id, users.id)
  .orderBy(...orderBy) // spread array
  .limit(limit)
  .offset(offset);

    return json({
        page,
        limit,
        hasMore: feed.length === limit,
        feed
    });
};

