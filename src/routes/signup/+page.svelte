<script>
    import { applyAction, enhance } from "$app/forms";
    import { faWarning } from "@fortawesome/free-solid-svg-icons";
    import Fa from "svelte-fa";
    import debug from "debug";
    import { session } from "$lib/stores/session";
    import { goto } from "$app/navigation";

    const log = debug("app:routes:signup:page.svelte");

    export let form;
</script>

<section class="max-w-sm mx-auto">
    <div class="prose">
        <h1>Sign Up</h1>
    </div>

    <form
        class="flex flex-col gap-6 my-6"
        method="POST"
        use:enhance={() =>
            async ({ result }) => {
                log("form result:", result);

                await applyAction(result);

                // TODO: this is kinda a hack since redirecting in the
                // action doesn't work because we can't also update page
                // data.
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
        <p>
            <input
                type="text"
                name="username"
                placeholder="Username..."
                class="input input-bordered w-full"
                value={form?.username || ''}
                required
            />
        </p>        
        <p>
            <input
                type="password"
                name="password"
                placeholder="Password..."
                value={form?.password || ''}
                class="input input-bordered w-full"
                required
            />
        </p>
        <p>
            <input
                type="password"
                name="password-confirm"
                placeholder="Confirm password..."
                value={form?.passwordConfirm || ''}
                class="input input-bordered w-full"
                required
            />
        </p>
        <p class="flex items-center gap-6 mt-6">
            <button class="btn btn-primary">Sign Up</button>
            or
            <a href="/login" class="link">Log In</a>
        </p>
    </form>
</section>