<script>
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import Leaderboard from "$lib/components/Leaderboard.svelte";
	export let data;
	$: success = $page.url.searchParams.get("success") === "true";

	let loading = false;
	let result = null;
	let error = null;

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

	<h1 class="flex items-center gap-4">
		Dashboard
		<a
			href="/dashboard/history"
			class="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
		>
			View My Sandwich History
		</a>
	</h1>
	<p>
		🎉 Hello there <strong>{data.user?.username}</strong>, you're logged in!
	</p>
	<p>
		Ready to keep life interesting with a random sandwich? Click the button
		below to generate one! There is only one simple rule: once you generate a
		sandwich, you must order it! 😉
	</p>
	<div class="text-center">
		<button class="generate" on:click={generateSandwich} disabled={loading}>
			{#if loading}
				Generating...
			{:else}
				<span class="text-2xl">🥪</span>Generate Randwich<span class="text-2xl"
					>🥪</span
				>
			{/if}
		</button>
		{#if loading}
			<img class="w-96 m-auto" src="/sandwich.gif" alt="A delicious sandwich" />
		{/if}
	</div>
	<Leaderboard/>
</section>
