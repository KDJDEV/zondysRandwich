import { json } from "@sveltejs/kit";
import optionsData from '$lib/data/options.json';
import OpenAI from "openai";
import 'dotenv/config'
import { db } from "$lib/db";
import { sandwiches } from "$lib/db/schema";
import { getTodayTheme } from '$lib/theme';
import { count, gt, eq, and } from "drizzle-orm";

function getRandomSandwich(data) {
    const randomItem = arr => arr[Math.floor(Math.random() * arr.length)];
    const getRandomToppings = toppings =>
        toppings.filter(() => Math.random() < 0.3); // 30% chance per topping

    return {
        bread: randomItem(data.bread_options),
        protein: randomItem(data.protein_options),
        cheese: randomItem(data.cheese_options),
        toppings: getRandomToppings(data.topping_options),
        sauce: randomItem(data.sauce_options)
    };
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateSandwichName(sandwich) {
    const theme = getTodayTheme();
    const prompt = `
You are a brilliant and slightly eccentric chef who names sandwiches like an artist titles paintings. Given the following sandwich ingredients and the theme "${theme}", come up with a **bold, clever, and one-of-a-kind name** for this sandwich — something that sparks curiosity or laughter, like a band name or a poetic pun. Don't include anything but the name itself.

Bread: ${sandwich.bread}
Protein: ${sandwich.protein}
Cheese: ${sandwich.cheese}
Sauce: ${sandwich.sauce}
Toppings: ${sandwich.toppings.join(", ")}
`;

    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini-2024-07-18",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 20,
    });

    const name = response.choices[0].message.content.trim();
    return name;
}

export const POST = async (event) => {
    const user = event.locals?.user;

    if (user) {
        const hoursAgo = new Date(Date.now() - 18 * 60 * 60 * 1000);

        const countResult = await db
            .select({ total: count() })
            .from(sandwiches)
            .where(and(
                eq(sandwiches.userId, user.id),
                gt(sandwiches.createdAt, hoursAgo)));

        const userSandwichCount = Number(countResult[0]?.total ?? 0);

        if (userSandwichCount >= 3) {
            return json({ error: "Sandwich limit reached: 2 per 24 hours." }, { status: 429 });
        }
    }

    const sandwich = getRandomSandwich(optionsData);
    const name = await generateSandwichName(sandwich);

    const result = await db.insert(sandwiches).values({
        bread: sandwich.bread,
        name: name,
        protein: sandwich.protein,
        cheese: sandwich.cheese,
        toppings: sandwich.toppings,
        sauce: sandwich.sauce,
        userId: user?.id || null,
    }).returning({ insertedId: sandwiches.id, createdAt: sandwiches.createdAt });

    const insertedId = result[0]?.insertedId;
    const createdAt = result[0]?.createdAt;

    return json({
        ...sandwich,
        name,
        id: insertedId,
        createdAt,
    });
};
