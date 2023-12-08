<script lang="ts">
  import type {
    PublicKeyCredentialRequestOptionsJSON,
    AuthenticationResponseJSON,
  } from "@simplewebauthn/typescript-types";
  import { startAuthentication } from "@simplewebauthn/browser";
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/auth";

  let error: string | undefined;
  let username: string;

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    const options = await getAuthenticationOptions(username);

    try {
      const auth = await startAuthentication(options);

      const { verified } = await verifyAuthentication(username, auth);
      authStore.set({ authenticated: verified });
      if (verified) {
        goto("/");
      } else {
        error = "Cannot verify your passkey";
      }
    } catch (e) {
      console.log(e);
      error = String(e);
    }
  }

  async function verifyAuthentication(
    username: string,
    authResponse: AuthenticationResponseJSON
  ): Promise<{ verified: boolean }> {
    const resp = await fetch(`/api/${username}/authentication/verify`, {
      method: "POST",
      body: JSON.stringify(authResponse),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw Error(data.message);
    }
    return data;
  }

  async function getAuthenticationOptions(username: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const resp = await fetch(`/api/${username}/authentication/options`);
    return resp.json();
  }
</script>

<main>
  <form on:submit={onSubmit}>
    <label for="username">username</label>
    <input type="text" name="username" autocomplete="username webauthn" bind:value={username} />
    <button>Login</button>
  </form>
  {#if error}
    <div class="error">{error}</div>
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

  form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  form > * {
    font-size: 2rem;
  }

  .error {
    font-weight: 700;
    border-radius: 0.25rem;
    padding: 1rem 0.5rem;
    background: tomato;
  }
</style>
