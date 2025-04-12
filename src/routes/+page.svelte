<script lang="ts">
	import { session } from "$lib/stores/session";
</script>

<div class="prose">
	<h1>Zondy's Randomizer</h1>
	<p>
		Can't decide what to get? Tired of ordering the same sandwich every time?
		Let chance choose your next delicious bite. We believe sandwiches should be exciting. Whether you're
		bold enough to try something completely unexpected or just looking to mix up
		your usual lunch routine, the Sandwich Randomizer is here for you.
	</p>

	<h2 class="mt-0">How it works:</h2>
	<ol>
		<li>Create an account.</li>
		<li>Generate a sandwich from the Dashboard.</li>
		<li>Order it. Upload a picture of it. Eat it. Love it.</li>
		<li>Give it a review.</li>
	</ol>

	<p>
		Also check out the leaderboard to see how many random sandwiches you've eaten comapared to others!
	</p>
	<p class="flex items-center gap-4 mt-12">
		{#if $session?.user}
			<a href="/dashboard" class="btn btn-primary text-base-100">Dashboard</a>
			<a href="/settings" class="btn text-base-100">Settings</a>
		{:else}
			<a href="/signup" class="btn btn-primary text-base-100">Sign Up</a>
			<a href="/login" class="btn text-base-100">Log In</a>
		{/if}
	</p>
</div>
