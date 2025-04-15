<script>
	import { confetti } from "@neoconfetti/svelte";
	import { page } from "$app/stores";
	// @ts-ignore
	import StarRating from "$lib/components/StarRating.svelte";
	import PhotoUpload from "$lib/components/PhotoUpload.svelte";
	import Fa from "svelte-fa";
	import { faWarning } from "@fortawesome/free-solid-svg-icons";
	import { goto } from "$app/navigation";

	$: created = $page.url.searchParams.get("created") === "true";

	export let data;

	const { sandwich } = data;
	$: toppingsText = sandwich?.toppings?.length
		? sandwich.sauce + ", " + sandwich?.toppings.slice(0, -1).join(", ") +
		  (sandwich?.toppings.length > 1 ? ", and " : "") +
		  sandwich?.toppings.slice(-1)
		: "and no toppings";

	$: orderText = `"I would like ${sandwich?.cheese} and ${sandwich?.protein} on ${sandwich?.bread}.""<br/><br/>
"I would like ${toppingsText}."<br/><br/>
"Thank you!"`;

	let ordered = false;
	let rating = "";
	let comments = "";
	let photoUrl = "";
	let error = "";
	function handlePhotoUpload(url) {
		photoUrl = url;
	}

	async function submitRating() {
		error = "";
		if (!rating) {
			error = "Please select a star rating.";
			return;
		}
		if (!photoUrl) {
			error = "Please upload a photo.";
			return;
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

	$: alreadyInDB = sandwich?.starRating;
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
	{#if alreadyInDB}
		{#if data.user?.id === sandwich.userId}
			<p class="text-green-500 font-bold mb-2 text-center">
				You've ordered this sandwich before!
			</p>
		{:else}
			<p class="text-green-500 font-bold mb-2 text-center">
				{sandwich.username} has ordered this sandwich before!
			</p>
		{/if}
	{/if}
	<div class=" text-center">
		<p class="text-gray-500 text-sm">Sandwich #{sandwich.id} ({new Date(sandwich.createdAt).toLocaleDateString()})</p>
		<h1 class=" text-2xl font-bold">🔥 {sandwich.name} 🔥</h1>

		<p><strong>🥖 Bread:</strong> {sandwich.bread}</p>
		<p><strong>🍗 Protein:</strong> {sandwich.protein}</p>
		<p><strong>🧀 Cheese:</strong> {sandwich.cheese}</p>
		<p>
			<strong>🥗 Toppings (×{sandwich.toppings.length}):</strong>
			{toppingsText}
		</p>
		<p><strong>🍅 Sauce:</strong> {sandwich.sauce}</p>
		<hr class="mt-3" />
		{#if !ordered}
			<p class="mt-3 font-bold">
				Here's what you can say to order{data.user?.id === sandwich.userId &&
				alreadyInDB
					? " again"
					: ""}:
			</p>
			<div
				class="border-2 border-dashed border-primary p-4 my-4 rounded-lg bg-base-100 text-left"
			>
				<p>{@html orderText}</p>
			</div>
			{#if !alreadyInDB}
				<button class="generate mt-5" on:click={() => (ordered = true)}>
					<span class="text-2xl"></span>I've ordered my sandwich<span
						class="text-2xl"></span
					>
				</button>
			{:else}
				<div class="text-left p-3 rounded-lg border border-gray-300">
					{#if data.user?.id === sandwich.userId}
						<p class="text-gray-500">Your review:</p>
					{:else}
						<p class="text-gray-500">{sandwich.username}'s review:</p>
					{/if}
					<StarRating rate={sandwich.starRating.toString()} {alreadyInDB} />
					<p>{sandwich.comments ? sandwich.comments : "No comments"}</p>
					<div class="mt-4">
						<img
							src={sandwich.imageUrl}
							alt="Preview"
							class="w-full max-w-sm rounded-lg shadow-md"
						/>
					</div>
				</div>
			{/if}
		{:else}
			<div>
				<p class="mt-5 text-green-500 font-bold">Enjoy your sandwich! 🎉</p>
				<h2 class="text-xl font-bold">Three last steps</h2>
				<div
					class="border-2 border-dashed border-primary p-4 my-4 rounded-lg bg-base-100 text-left"
				>
					{#if error}
						<div class="alert alert-error mb-2">
							<div>
								<Fa icon={faWarning} />
								{error}
							</div>
						</div>
					{/if}
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
					<button
						class="generate mt-5 m-auto block mb-3"
						on:click={submitRating}
					>
						Submit rating
					</button>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<p>Sandwich not found.</p>
{/if}
