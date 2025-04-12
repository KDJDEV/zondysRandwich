<script lang="ts">
	import { onMount } from "svelte";
	import StarRating from "$lib/components/StarRating.svelte";

	let sandwiches = [];
	let loading = true;
	let error = null;

	onMount(async () => {
		try {
			const res = await fetch("/api/history");
			if (!res.ok) throw new Error("Failed to fetch sandwiches");
			sandwiches = await res.json();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});
</script>

{#if loading}
	<p>Loading your sandwiches...</p>
{:else if error}
	<p class="text-red-600">Error: {error}</p>
{:else if sandwiches.length === 0}
	<p>You haven’t made any sandwiches yet!</p>
{:else}
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
		{#each sandwiches as sandwich (sandwich.id)}
			<a href={`/dashboard/${sandwich.id}`} class="block">
				<div
					class="p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200"
				>
					<h2 class="text-xl font-bold mb-2">{sandwich.name}</h2>
					<p class="text-sm text-gray-600">
						<strong>Bread:</strong>
						{sandwich.bread}<br />
						<strong>Protein:</strong>
						{sandwich.protein}<br />
						<strong>Cheese:</strong>
						{sandwich.cheese}<br />
						<strong>Toppings:</strong>
						{sandwich.toppings.join(", ")}
					</p>

					{#if sandwich.starRating && sandwich.imageUrl}
						<div>
							<StarRating
								rate={sandwich.starRating.toString()}
								alreadyInDB={true}
								small={true}
							/>
							<p class="mt-1">
								{sandwich.comments ? sandwich.comments : "No comments"}
							</p>
						</div>

						<div class="mt-4">
							<img
								src={sandwich.imageUrl}
								alt="Preview"
								class="w-full max-w-sm rounded-lg shadow-md"
							/>
						</div>
					{:else}
						<p class=" text-red-600 mt-2">Sandwich was never rated (does not count towards leaderboard)</p>
					{/if}
				</div>
			</a>
		{/each}
	</div>
{/if}
