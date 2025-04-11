<script>
	import { confetti } from "@neoconfetti/svelte";
	import { page } from "$app/stores";
	$: created = $page.url.searchParams.get("created") === "true";

	export let data;

	const { sandwich } = data;

	$: toppingsText = sandwich.toppings?.length
		? sandwich.toppings.slice(0, -1).join(", ") +
		  (sandwich.toppings.length > 1 ? ", and " : "") +
		  sandwich.toppings.slice(-1)
		: "no toppings";

	$: orderText = `I would like ${sandwich.cheese} and ${sandwich.protein} on ${sandwich.bread}.\n
For toppings I would like ${toppingsText}.\n
Thank you!`;
</script>

{#if sandwich}
	{#if created}
		<div
			class="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-hidden"
			use:confetti={{
				stageWidth: window.innerWidth,
			}}
		/>
	{/if}
	{#if data.user?.id === sandwich.userId}
			Here's your sandwich:
		{:else}
			{sandwich.username}'s sandwich:
		{/if}
	<div class=" text-center">
		
		<p class="text-gray-500 text-sm">Sandwich #{sandwich.id}</p>
		<h1 class=" text-2xl font-bold">🔥 {sandwich.name} 🔥</h1>

		<p><strong>🥖 Bread:</strong> {sandwich.bread}</p>
		<p><strong>🍗 Protein:</strong> {sandwich.protein}</p>
		<p><strong>🧀 Cheese:</strong> {sandwich.cheese}</p>
		<p><strong>🥗 Toppings (×{sandwich.toppings.length}):</strong> {toppingsText}</p>
		<hr class="mt-3"/>
		<p class="mt-3 font-bold">Here's what you can say to order:</p>
		<div class="border-2 border-dashed border-primary p-4 my-4 rounded-lg bg-base-100 text-left">
			<p>"{orderText}"</p>
		</div>
	</div>
{:else}
	<p>Sandwich not found.</p>
{/if}
