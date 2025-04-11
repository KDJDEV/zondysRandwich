<script>
    import { goto } from '$app/navigation';
	export let data;

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
	<h1>Dashboard</h1>
	<p>
		🎉 Hello there <strong>{data.user?.username}</strong>, you're logged in!
		Ready for a sandwich?
	</p>
	<div class="text-center">
		<button class="generate" on:click={generateSandwich} disabled={loading}>
			{#if loading}
				Generating...
			{:else}
				<span class="text-2xl">🥪</span>Generate Sandwich<span class="text-2xl"
					>🥪</span
				>
			{/if}
		</button>
		{#if loading}
			<img class="w-96 m-auto" src="/sandwich.gif" alt="A delicious sandwich" />
		{/if}
	</div>
</section>
