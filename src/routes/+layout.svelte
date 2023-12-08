<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { authStore } from "$lib/auth";

  function logout() {
    authStore.set({ authenticated: false });
  }
</script>

<div>
  <header>
    {#if $authStore.authenticated}
      <button on:click={logout}>Logout</button>
    {:else}
      {#if $page.url.pathname !== "/register"}
        <a href="/register">Register</a>
      {/if}
      {#if $page.url.pathname !== "/login"}
        <a href="/login">Login</a>
      {/if}
    {/if}
  </header>
  <slot />
</div>

<style>
  header {
    display: flex;
    gap: 2rem;
    justify-content: flex-end;
    font-size: 1.5rem;
  }
</style>
