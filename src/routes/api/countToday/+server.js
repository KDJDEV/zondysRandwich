import { json } from "@sveltejs/kit";
import { db } from "$lib/db";
import { sandwiches } from "$lib/db/schema";
import { count, eq, gt, desc } from "drizzle-orm";

export const GET = async (event) => {
    const user = event.locals?.user;

    if (!user) {
        return json({ error: "User must be logged in to view sandwich count." }, { status: 401 });
    }

    try {
        const hoursAgo = new Date(Date.now() - 18 * 60 * 60 * 1000);

        const countResult = await db
            .select({ total: count() })
            .from(sandwiches)
            .where(eq(sandwiches.userId, user.id))
            .where(gt(sandwiches.createdAt, hoursAgo));
        
        const recentCount = Number(countResult[0]?.total ?? 0);
        
        let nextAvailableTime = null;
        
        if (recentCount >= 2) {
            const recentSandwiches = await db
                .select({ createdAt: sandwiches.createdAt })
                .from(sandwiches)
                .where(eq(sandwiches.userId, user.id))
                .orderBy(sandwiches.createdAt, { direction: 'desc' })
                .limit(2);
            
            if (recentSandwiches.length > 0) {
                const oldestRecentSandwich = recentSandwiches[recentSandwiches.length - 1];
                if (oldestRecentSandwich && oldestRecentSandwich.createdAt) {
                    nextAvailableTime = new Date(oldestRecentSandwich.createdAt.getTime() + 18 * 60 * 60 * 1000);
                }
            }
        }

        return json({
            recentCount,
            limit: 2,
            remaining: Math.max(0, 2 - recentCount)
        });
    } catch (error) {
        console.error("Error fetching sandwich count:", error);
        return json({ error: "Failed to fetch sandwich count" }, { status: 500 });
    }
};