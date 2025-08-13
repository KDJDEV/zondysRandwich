<script>
	import { applyAction, enhance } from "$app/forms";
	import { faWarning } from "@fortawesome/free-solid-svg-icons";
	import Fa from "svelte-fa";
	import debug from "debug";
	import { session } from "$lib/stores/session";
	import { goto } from "$app/navigation";
	import { tick } from "svelte";

	const log = debug("app:routes:signup:page.svelte");
	export let form;

	let isSubmitting = false;
</script>

<section class="max-w-sm mx-auto">
	<div class="prose">
		<h1>Sign Up</h1>
	</div>

	<form
		class="flex flex-col gap-6 my-6"
		method="POST"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result }) => {
				log("form result:", result);

				await applyAction(result);

				if (result.type === "success") {
					const user = result.data?.user;
					if (user) $session.user = user;
					await goto("/dashboard");
				}

				isSubmitting = false;
			};
		}}
	>
		{#if form?.error}
			<div class="alert alert-error">
				<div>
					<Fa icon={faWarning} />
					{form.error}
				</div>
			</div>
		{/if}

		<p>
			<input
				type="text"
				name="username"
				placeholder="Username..."
				class="input input-bordered w-full"
				value={form?.username || ""}
				required
			/>
		</p>

		<p>
			<input
				type="email"
				name="email"
				placeholder="Your Taylor email"
				class="input input-bordered w-full"
				value={form?.email || ""}
				required
			/>
		</p>

		<p>
			<input
				type="password"
				name="password"
				placeholder="Password..."
				value={form?.password || ""}
				class="input input-bordered w-full"
				required
			/>
		</p>

		<p>
			<input
				type="password"
				name="password-confirm"
				placeholder="Confirm password..."
				value={form?.passwordConfirm || ""}
				class="input input-bordered w-full"
				required
			/>
		</p>

		<p class="flex items-center gap-6 mt-6">
			<button
				class="btn btn-primary flex items-center gap-2"
				disabled={isSubmitting}
			>
				{#if isSubmitting}
					<span
						class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
					/>
				{/if}
				Sign Up
			</button>
			or
			<a href="/login" class="link">Log In</a>
		</p>
	</form>
</section>
