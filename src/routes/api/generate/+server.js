import { json } from "@sveltejs/kit";
import optionsData from '$lib/data/options.json';

function getRandomSandwich(data) {
    const randomItem = arr => arr[Math.floor(Math.random() * arr.length)];
    const getRandomToppings = toppings =>
        toppings.filter(() => Math.random() < 0.5); // 50% chance per topping

    return {
        bread: randomItem(data.bread_options),
        protein: randomItem(data.protein_options),
        cheese: randomItem(data.cheese_options),
        toppings: getRandomToppings(data.topping_options)
    };
}


export const GET = (event) => {
    const user = event.locals?.user;

    if (!user) return json({ error: "not authorized" }, { status: 401 });

    const sandwich = getRandomSandwich(optionsData);
    console.log(sandwich);

    return json(sandwich);
};