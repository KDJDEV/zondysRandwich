<script>
    import { applyAction, enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { session } from "$lib/stores/session";
    import { faWarning } from "@fortawesome/free-solid-svg-icons";
    import debug from "debug";
    import Fa from "svelte-fa";

    const log = debug("app:routes:login:page.svelte");

    export let form;

    $: log("form:", form);
</script>

<section class="max-w-sm mx-auto">
    <div class="prose">
        <h1 class="">Log In</h1>
        <p>
            You're almost ready to dive into the world of random sandwiches! Please log in to continue.
        </p>
    </div>
    <form
        class="flex flex-col gap-6 my-6"
        method="POST"
        use:enhance={() =>
            async ({ result }) => {
                log("form result:", result);

                await applyAction(result);

                if (result.type === "success") {
                    const user = result.data?.user;
                    if (user) $session.user = user;
                    await goto("/dashboard");
                }
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

        <!-- changed input name from "username" to "email" -->
        <p>
            <input
                type="email"
                name="email"
                placeholder="Email..."
                class="input input-bordered w-full"
                value={form?.email || ''}
                required
            />
        </p>     
        <p>
            <input
                autocomplete="current-password"
                type="password"
                name="password"
                placeholder="Password..."
                class="input input-bordered w-full"
                required
            />
        </p>
        <p class="flex items-center gap-6 mt-6">
            <button class="btn btn-primary">Log In</button>
            or
            <a href="/signup" class="link">Sign Up</a>
        </p>
    </form>
</section>
