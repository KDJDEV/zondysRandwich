<script>
	import { onMount } from "svelte";
	import StarRating from "./StarRating.svelte";
	import { goto } from "$app/navigation";

	let feed = [];
	let page = 1;
	let limit = 10;
	let loading = false;
	let hasMore = true;
	let sort = "recent"; // "recent" | "upvoted"

	// Tracks which sandwiches are currently processing a vote
	let voteLoading = new Set();

	async function loadFeed(reset = false) {
		if (loading || (!hasMore && !reset)) return; // allow fetch if resetting
		loading = true;

		if (reset) {
			page = 1;
			feed = [];
			hasMore = true;
		}

		try {
			const res = await fetch(
				`/api/feed?sort=${sort}&page=${page}&limit=${limit}`
			);
			if (!res.ok) throw new Error("Failed to fetch feed");

			const data = await res.json();
			if (reset) feed = data.feed;
			else feed = [...feed, ...data.feed];

			hasMore = data.hasMore;
			page += 1;
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function onScroll(event) {
		const el = event.target;
		if (el.scrollHeight - el.scrollTop <= el.clientHeight + 200) {
			loadFeed();
		}
	}

	async function toggleVote(sandwich) {
		if (voteLoading.has(sandwich.sandwichId)) return;
		voteLoading.add(sandwich.sandwichId);

		const originalHasVoted = sandwich.hasVoted;
		const originalVoteCount = Number(sandwich.voteCount); // convert to number

		// Optimistically update the feed array
		feed = feed.map((s) => {
			if (s.sandwichId === sandwich.sandwichId) {
				return {
					...s,
					hasVoted: !s.hasVoted,
					voteCount: (s.voteCount = originalVoteCount + (s.hasVoted ? -1 : 1)),
				};
			}
			return s;
		});

		try {
			const res = await fetch(`/api/vote/${sandwich.sandwichId}`, {
				method: "POST",
			});
			if (!res.ok) {
				const data = await res.json();
				console.log(data);
				if (data.message === "Unauthorized") {
					alert("You must be logged in to vote.");
				}
				if (data.message === "Email must be verified to vote") {
					alert("You must verify your email to vote.");
				}
				throw new Error("Failed to toggle vote");
			}

			const data = await res.json();
			console.log(data);
			// Correct UI if server disagrees
			feed = feed.map((s) => {
				if (s.sandwichId === sandwich.sandwichId) {
					return {
						...s,
						hasVoted: data.hasVoted,
						voteCount: Number(data.voteCount), // ensure numeric
					};
				}
				return s;
			});
		} catch (err) {
			console.error(err);
			// Revert to original state on error
			feed = feed.map((s) => {
				if (s.sandwichId === sandwich.sandwichId) {
					return {
						...s,
						hasVoted: originalHasVoted,
						voteCount: originalVoteCount,
					};
				}
				return s;
			});
		} finally {
			voteLoading.delete(sandwich.sandwichId);
		}
	}

	onMount(() => loadFeed());
</script>

<section
	class="social-feed"
	on:scroll={onScroll}
	style="max-height: 80vh; overflow-y: auto;"
>
	<img class="mt-0" src="/sandwichSocial.png" />
	<div
		class="sort-container mb-4 p-3 bg-gray-100 rounded flex items-center gap-3 shadow-sm"
	>
		<span class="font-semibold text-gray-700">Sort by:</span>

		<button
			class="px-4 py-2 rounded transition-colors duration-200 font-medium"
			class:bg-blue-600={sort === "recent"}
			class:text-white={sort === "recent"}
			class:bg-white={sort !== "recent"}
			class:text-gray-700={sort !== "recent"}
			class:hover:bg-blue-500={sort !== "recent"}
			on:click={() => {
				sort = "recent";
				loadFeed(true);
			}}
		>
			Most Recent
		</button>

		<button
			class="px-4 py-2 rounded transition-colors duration-200 font-medium"
			class:bg-green-600={sort === "upvoted"}
			class:text-white={sort === "upvoted"}
			class:bg-white={sort !== "upvoted"}
			class:text-gray-700={sort !== "upvoted"}
			class:hover:bg-green-500={sort !== "upvoted"}
			on:click={() => {
				sort = "upvoted";
				loadFeed(true);
			}}
		>
			Top Upvoted
		</button>
	</div>

	{#each feed as sandwich (sandwich.sandwichId)}
		<div
			class="sandwich-card border rounded p-4 mb-4 cursor-pointer hover:shadow-lg transition"
			on:click={() => goto(`/dashboard/${sandwich.sandwichId}`)}
		>
			<div class="flex flex-col md:flex-row gap-4 items-start">
  <!-- Image -->
  <img
    src={sandwich.imageUrl}
    alt="Randwich"
    class="w-24 h-24 object-cover rounded flex-shrink-0 mt-0 mb-0"
  />

  <!-- Content -->
  <div class="flex-1">
    {#if sandwich.name}
      <p
        class="font-bold text-md mb-1 mt-0 leading-4"
        title={sandwich.name.replace(/^["']|["']$/g, "")}
      >
        {sandwich.name.replace(/^["']|["']$/g, "").slice(0, 80)}{sandwich
          .name.length > 80
          ? "…"
          : ""}
      </p>
    {/if}

    <div class="mb-1 flex flex-wrap items-center gap-2 m-0">
      <strong class="whitespace-nowrap">
        {sandwich.username.replace(/^["']|["']$/g, "")}
      </strong>
      <span class="whitespace-nowrap">rated:</span>
      <StarRating
        rate={sandwich.starRating.toString()}
        alreadyInDB={true}
        small={true}
        class="mt-1 sm:mt-0 h-2"
      />
    </div>

    <p class="text-sm text-gray-600 m-0">
      {#if sandwich.comments}
        {sandwich.comments.length > 80
          ? sandwich.comments.slice(0, 80) + "…"
          : sandwich.comments}
      {/if}
    </p>

    <p class="text-sm text-gray-500 m-0">
      {new Date(sandwich.createdAt).toLocaleDateString()}
    </p>
  </div>

  <!-- Vote Button -->
  <div
    class="flex-shrink-0 flex items-center gap-2 order-2 md:order-none md:mt-0"
  >
    <button
      class="px-3 py-1 rounded text-white"
      class:bg-red-500={sandwich.hasVoted}
      class:bg-gray-400={!sandwich.hasVoted}
      disabled={voteLoading.has(sandwich.sandwichId)}
      on:click|stopPropagation={() => toggleVote(sandwich)}
    >
      {sandwich.hasVoted ? "Unvote ❤️" : "Upvote 🤍"}
    </button>
    <span class="text-gray-700 font-medium">{sandwich.voteCount}</span>
  </div>
</div>

		</div>
	{/each}

	{#if loading}
		<p class="text-center text-gray-500">Loading...</p>
	{/if}

	{#if !hasMore && feed.length > 0}
		<p class="text-center text-gray-400 mt-4">No more sandwiches to show.</p>
	{/if}
</section>

<style>
	.social-feed::-webkit-scrollbar {
		width: 6px;
	}
	.social-feed::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}
</style>
