<script>
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import Leaderboard from "$lib/components/Leaderboard.svelte";
	export let data;
	$: success = $page.url.searchParams.get("success") === "true";
	$: deleted = $page.url.searchParams.get("deleted") === "true";

	let loading = false;
	let result = null;
	let error = null;
	let sandwichesRemaining = 3;
	async function checkSandwichLimit() {
		try {
			const res = await fetch(`/api/countToday`);
			const data = await res.json();

			if (res.ok) {
				sandwichesRemaining = data.remaining;
				if (data.count >= 3) {
					return false;
				}
				return true;
			} else {
				console.log(data.error);
				return false;
			}
		} catch (error) {
			console.error("Error fetching sandwich limit:", error);
			return false;
		}
	}
	onMount(() => {
		checkSandwichLimit();
	});

	async function generateSandwich() {
		if (loading) return;
		loading = true;
		error = null;
		result = null;

		try {
			const res = await fetch("/api/generate", {
				method: "POST",
			});

			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || "Unknown error");
			}

			result = await res.json();
			goto(`/dashboard/${result.id}?created=true`);
		} catch (err) {
			error = err.message;
		} finally {
			loading = false;
		}
	}
</script>

<section class="prose">
	{#if success}
		<p class="text-center text-green-500 font-bold text-xl mt-4">
			Successfully rated your sandwich! 🎉
		</p>
	{/if}
	{#if deleted}
		<p class="text-center text-green-500 font-bold text-xl mt-4">
			Successfully deleted your sandwich!
		</p>
	{/if}

	<h1 class="flex items-center gap-4 mb-0">
		Dashboard
		{#if data.user}
			<a
				href={`/dashboard/history?userId=${data.user.id}`}
				class="text-sm text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
			>
				View My Sandwich History
			</a>
		{/if}
	</h1>
	{#if data.user}
		{#if sandwichesRemaining < 1}
			<p class="text-sm text-red-600 font-semibold">
				Daily rolls remaining: {sandwichesRemaining}
			</p>
		{:else}
			<p class="text-sm text-black font-semibold">
				Daily rolls remaining: {sandwichesRemaining}
			</p>
		{/if}
	{/if}
	{#if data.user}
		<p>
			🎉 Hello there <strong>{data.user?.username}</strong>, you're logged in!
		</p>
	{:else}
		<p class="text-red-600 inline italic">
			You're not currently logged in. Created randwiches will not be saved to
			your history or count towards the leaderboard (not recommended).
		</p>
		<a href="/login" class="link">Log In</a>
	{/if}
	<p>
		Ready to keep life interesting with a random sandwich? Click the button
		below to generate one! There is only one simple rule: once you generate a
		sandwich, you must order it! 😉
	</p>
	<div class="text-center">
		{#if sandwichesRemaining > 0}
			<button class="generate" on:click={generateSandwich} disabled={loading}>
				{#if loading}
					Generating...
				{:else}
					<span class="text-2xl">🥪</span>Generate Randwich<span
						class="text-2xl">🥪</span
					>
				{/if}
			</button>
		{:else}
			<p class="text-red-600 font-bold">You're out of randwich rolls for today. Please come back tomorrow.</p>
		{/if}
		{#if loading}
			<img class="w-96 m-auto" src="/sandwich.gif" alt="A delicious sandwich" />
		{/if}
	</div>
	<Leaderboard />
</section>
