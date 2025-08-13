<script>
  export let data;
</script>

<section class="max-w-md mx-auto my-12 p-6 bg-base-200 rounded-lg shadow">
  {#if data.error}
    <div class="alert alert-error">{data.error}</div>
  {:else}
    <h1 class="text-2xl font-bold mb-4">Confirm your email</h1>
    <p class="mb-6">Click the button below to finish verifying your account.</p>
    <form method="POST">
      <input type="hidden" name="token" value={data.token} />
      <button class="btn btn-primary text-white">Confirm Email</button>
    </form>
  {/if}
</section>
