<script>
	import { onMount } from "svelte";

	let leaderboard = { allTime: [], thisMonth: [] };

	onMount(async () => {
		const response = await fetch("/api/leaderboard");
		if (response.ok) {
			leaderboard = await response.json();
		} else {
			console.error("Failed to fetch leaderboard");
		}
	});
</script>

<div class="mt-8 space-y-12">
	<!-- This Month Leaderboard -->
	<section>
		<h2 class="text-2xl font-semibold mb-4">This Month Leaderboard</h2>
		<table class="leaderboard-table">
			<thead>
				<tr>
					<th>Pos</th>
					<th>User Name</th>
					<th>Sandwiches</th>
				</tr>
			</thead>
			<tbody>
				{#each leaderboard.thisMonth as { username, sandwichCount }, index}
					<tr class="leaderboard-item">
						<td>{index + 1}</td>
						<td>{username}</td>
						<td>{sandwichCount}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
	
	<!-- All Time Leaderboard -->
	<section>
		<h2 class="text-2xl font-semibold mb-4">All Time Leaderboard</h2>
		<table class="leaderboard-table">
			<thead>
				<tr>
					<th>Pos</th>
					<th>User Name</th>
					<th>Sandwiches</th>
				</tr>
			</thead>
			<tbody>
				{#each leaderboard.allTime as { username, sandwichCount }, index}
					<tr class="leaderboard-item">
						<td>{index + 1}</td>
						<td>{username}</td>
						<td>{sandwichCount}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	
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
