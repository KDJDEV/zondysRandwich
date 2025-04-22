import { json } from "@sveltejs/kit";
import optionsData from '$lib/data/options.json';
import OpenAI from "openai";
import 'dotenv/config'
import { db } from "$lib/db";
import { sandwiches } from "$lib/db/schema";
import { getTodayTheme } from '$lib/theme';

function getRandomSandwich(data) {
    const randomItem = arr => arr[Math.floor(Math.random() * arr.length)];
    const getRandomToppings = toppings =>
        toppings.filter(() => Math.random() < 0.4); // 40% chance per topping

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
Given the sandwich ingredients below, respond with only a creative and unique name for the sandwich inspired by ${theme}. Output only the name and nothing else.

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

	if (!user) {
		return json({ error: 'not authorized' }, { status: 401 });
	}

	let sandwich = getRandomSandwich(optionsData);
	let name = await generateSandwichName(sandwich);

	const result = await db.insert(sandwiches).values({
        bread: sandwich.bread,
        name: name,
        protein: sandwich.protein,
        cheese: sandwich.cheese,
        toppings: sandwich.toppings,
        sauce: sandwich.sauce,
        userId: user.id,
    }).returning({ insertedId: sandwiches.id, createdAt:sandwiches.createdAt });
    
    const insertedId = result[0]?.insertedId;
    const createdAt = result[0]?.createdAt;
	return json({
		...sandwich,
		name,
		id: insertedId,
        createdAt:createdAt
	});
};