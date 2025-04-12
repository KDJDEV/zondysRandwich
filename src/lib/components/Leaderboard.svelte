<script>
	import { onMount } from "svelte";

	let leaderboard = [];

	onMount(async () => {
		const response = await fetch("/api/leaderboard");
		if (response.ok) {
			leaderboard = await response.json();
		} else {
			console.error("Failed to fetch leaderboard");
		}
	});
</script>

<div class="mt-8">
	<h2 class="text-2xl font-semibold mb-4">Leaderboard</h2>
	<table class="leaderboard-table w-full border-collapse shadow-lg">
		<thead>
			<tr>
				<th class="px-4 py-2 text-left">Pos</th>
				<th class="px-4 py-2 text-left">User Name</th>
				<th class="px-4 py-2 text-left">Sandwiches</th>
			</tr>
		</thead>
		<tbody>
			{#each leaderboard as { username, sandwichCount }, index}
				<tr class="leaderboard-item">
					<td class="px-4 py-2">{index + 1}</td>
					<td class="px-4 py-2">{username}</td>
					<td class="px-4 py-2">{sandwichCount}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>

	.leaderboard-table {
		width: 100%;
		border-collapse: collapse;
		background-color: #222;
		color: white;
        font-family: "Press Start 2P", system-ui;
		font-weight: 400;
	}

	.leaderboard-table th,
	.leaderboard-table td {
		border: 2px solid #ffffff;
        color: white;
		text-align: left;
		padding: 8px 16px;
	}

	.leaderboard-item:nth-child(even) {
		background-color: #333;
	}
</style>
