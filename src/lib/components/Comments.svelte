<script>
	import { onMount } from "svelte";
	import { session } from "$lib/stores/session";

	export let sandwichId;
	let comments = [];
	let loading = false;
	let error = "";
	let newComment = "";

	// Load existing comments
	async function loadComments() {
		loading = true;
		try {
			const res = await fetch(`/api/${sandwichId}/comments`);
			if (!res.ok) throw new Error("Failed to fetch comments");
			const data = await res.json();
			comments = data.comments;
		} catch (err) {
			console.error(err);
			error = "Failed to load comments";
		} finally {
			loading = false;
		}
	}

	// Submit a new comment
	async function submitComment() {
		if (!$session?.user?.emailVerified) {
			error = "You must verify your email to comment.";
			return;
		}
		if (!newComment.trim()) {
			error = "Please add a comment.";
			return;
		}
		error = "";

		try {
			const res = await fetch(`/api/${sandwichId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: $session.user.name || $session.user.email,
					userId: $session.user.id,
					comments: newComment
				}),
			});

			const data = await res.json();

			if (data.success) {
				comments = [data.comment, ...comments]; // prepend new comment
				newComment = "";
			} else {
				error = data.error || "Failed to submit comment.";
			}
		} catch (err) {
			console.error(err);
			error = "Failed to submit comment.";
		}
	}

	onMount(() => {
		loadComments();
	});
</script>

<section class="mt-8">
	<h2 class="text-xl font-bold mb-3">Comments</h2>

	{#if $session?.user && $session.user.emailVerified}
		<div class="mb-4 border p-3 rounded-lg bg-gray-50">
			<label class="block font-semibold mb-2">Your Comment:</label>
			<textarea
				bind:value={newComment}
				class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
				rows="3"
				placeholder="Share your thoughts..."
			/>

			{#if error}
				<p class="text-red-500 mt-2">{error}</p>
			{/if}

			<button
				class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
				on:click={submitComment}
			>
				Submit
			</button>
		</div>
	{:else}
		<p class="text-gray-500 mb-4">
			You must verify your email to leave a comment.
		</p>
	{/if}

	{#if loading}
		<p class="text-gray-500">Loading comments...</p>
	{:else if comments.length === 0}
		<p class="text-gray-400">No comments yet.</p>
	{:else}
		<ul class="space-y-4">
			{#each comments as c (c.id)}
				<li class="border p-3 rounded-lg bg-white shadow-sm">
					<div class="flex justify-between items-center mb-1">
						<strong>{c.username}</strong>
						<small class="text-gray-400 text-sm">{new Date(c.createdAt).toLocaleDateString()}</small>
					</div>
					<p class="mt-1 text-gray-700">{c.comments}</p>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<style>
	textarea {
		min-height: 60px;
	}
</style>
