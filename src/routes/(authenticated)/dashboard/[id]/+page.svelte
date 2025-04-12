<script>
	import { confetti } from "@neoconfetti/svelte";
	import { page } from "$app/stores";
	// @ts-ignore
	import StarRating from "$lib/components/StarRating.svelte";
	import PhotoUpload from "$lib/components/PhotoUpload.svelte";
	import { goto } from "$app/navigation";

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

	let ordered = false;
	let rating = "";
	let comments = "";
	let photoUrl = "";

	function handlePhotoUpload(url) {
		photoUrl = url;
	}

	async function submitRating() {
	  if (!rating || !photoUrl) {
		return; // Optionally, show a message that rating and photo are required
	  }
  
	  try {
		const response = await fetch(`/api/rate`, {
		  method: "PATCH",
		  headers: {
			"Content-Type": "application/json",
		  },
		  body: JSON.stringify({
			id: sandwich.id,
			comments,
			starRating: parseInt(rating),
			imageUrl: photoUrl,
		  }),
		});
  
		const result = await response.json();
  
		if (result.success) {
		  goto("/dashboard?success=true");
		} else {
		  console.error("Failed to submit rating", result.error);
		}
	  } catch (error) {
		console.error("Error submitting rating", error);
	  }
	}
</script>

{#if sandwich}
	{#if created}
		<div
			class="w-screen h-screen absolute top-0 left-0 overflow-hidden pointer-events-none"
		>
			<div
				class="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
				use:confetti
			/>
		</div>
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
		<p>
			<strong>🥗 Toppings (×{sandwich.toppings.length}):</strong>
			{toppingsText}
		</p>
		<hr class="mt-3" />
		{#if !ordered}
			<p class="mt-3 font-bold">Here's what you can say to order:</p>
			<div
				class="border-2 border-dashed border-primary p-4 my-4 rounded-lg bg-base-100 text-left"
			>
				<p>"{orderText}"</p>
			</div>
			<button class="generate mt-5" on:click={() => (ordered = true)}>
				<span class="text-2xl">✅</span>I've ordered my sandwich<span
					class="text-2xl">✅</span
				>
			</button>
		{:else}
			<div>
				<p class="mt-5 text-green-500 font-bold">Enjoy your sandwich! 🎉</p>
				<h2 class="text-xl font-bold">Three last steps</h2>
				<div
					class="border-2 border-dashed border-primary p-4 my-4 rounded-lg bg-base-100 text-left"
				>
					<StarRating bind:rate={rating} />
					{#if rating}
						<p>{rating} Stars</p>
					{:else}
						<p class="text-gray-500">Please rate your sandwich</p>
					{/if}
					<div class="mt-4">
						<label for="comments" class="block text-gray-700 font-semibold mb-2"
							>2. Optional Comments</label
						>
						<textarea
							id="comments"
							placeholder="Share your thoughts here..."
							bind:value={comments}
							class="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[80px] transition-all"
						/>
					</div>
					<PhotoUpload {photoUrl} onUpload={handlePhotoUpload} />
					{#if photoUrl}
						<p class="mt-2 text-gray-500">Photo uploaded successfully!</p>
					{/if}
					<button class="generate mt-5 m-auto block mb-3" on:click={submitRating} disabled={!rating || !photoUrl}>
						Submit rating
					</button>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<p>Sandwich not found.</p>
{/if}
