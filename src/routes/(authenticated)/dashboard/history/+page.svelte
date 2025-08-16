<script lang="ts">
	import { onMount } from "svelte";
	import StarRating from "$lib/components/StarRating.svelte";
	import { page } from "$app/stores";

	let sandwiches = [];
	let loading = true;
	let error = null;
	let username = "";
	const userId = $page.url.searchParams.get("userId");

	onMount(async () => {
		try {
			const userRes = await fetch(`/api/user/${userId}`);
			if (!userRes.ok) throw new Error("Failed to fetch user data");
			const userData = await userRes.json();
			username = userData.username;

			const res = await fetch(`/api/history?userId=${userId}`);
			if (!res.ok) throw new Error("Failed to fetch sandwiches");
			sandwiches = await res.json();
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	});

	const copyLink = () => {
		navigator.clipboard.writeText(window.location.href)
			.then(() => alert(`Successfully copied link to ${username}'s history to clipboard!`))
			.catch((err) => alert("Failed to copy the link: " + err));
	};
</script>

{#if username}
	<h1 class="text-3xl mb-5">{username}'s Sandwiches</h1>
	<button 
		on:click={copyLink} 
		class="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-colors"
	>
		Copy Link to History
	</button>
	<hr class="mt-3 mb-3" />
{/if}

{#if loading}
	<p>Loading sandwiches...</p>
{:else if error}
	<p class="text-red-600">Error: {error}</p>
{:else if sandwiches.length === 0}
	<p>{username} hasn't made any sandwiches yet!</p>
{:else}
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
		{#each sandwiches as sandwich (sandwich.id)}
			<a href={`/dashboard/${sandwich.id}`} class="block">
				<div class="p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200">
					<h2 class="text-xl font-bold mb-2">{sandwich.name}</h2>
					<p class="text-sm text-gray-600">
						{new Date(sandwich.createdAt).toLocaleDateString()}
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
						<p class="text-red-600 mt-2">
							Sandwich was never rated and will not appear on the Sandwich Feed.
						</p>
					{/if}
				</div>
			</a>
		{/each}
	</div>
{/if}
