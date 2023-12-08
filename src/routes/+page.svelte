<script lang="ts">
  import { authStore } from "$lib/auth";

  let error: string | undefined;
</script>

<main>
  {#if error}
    <div class="error">{error}</div>
  {/if}
  {#if $authStore.authenticated}
    <div class="login-success">You are successfully logged in.</div>
  {:else}
    <div>
      You are not authenticated. If this is your first time here, register your account, but if you're returning you can
      just log in!
    </div>
  {/if}
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    max-width: 30rem;
    margin: auto;
    gap: 1rem;
    margin-top: 2rem;
  }

  .login-success {
    background-color: mediumseagreen;
    font-size: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    border: 1px solid black;
  }

  .error {
    font-weight: 700;
    border-radius: 0.25rem;
    padding: 1rem 0.5rem;
    background: tomato;
  }
</style>
