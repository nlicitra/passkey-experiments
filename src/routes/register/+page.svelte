<script lang="ts">
  import type {
    PublicKeyCredentialCreationOptionsJSON,
    RegistrationResponseJSON,
  } from "@simplewebauthn/typescript-types";
  import { startRegistration } from "@simplewebauthn/browser";
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/auth";

  let error: string | undefined;
  let username: string;

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();

    try {
      const options = await getRegistrationOptions(username);
      const registration = await startRegistration(options);

      const { verified } = await verifyRegistration(username, registration);
      authStore.set({ authenticated: verified });
      if (verified) {
        goto("/");
      } else {
        error = "there was a problem registering.";
      }
    } catch (e) {
      console.log(e);
      error = String(e);
    }
  }

  async function verifyRegistration(
    username: string,
    registration: RegistrationResponseJSON
  ): Promise<{ verified: boolean }> {
    const resp = await fetch(`/api/${username}/registration/verify`, {
      method: "POST",
      body: JSON.stringify(registration),
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw Error(data.message);
    }
    return data;
  }

  async function getRegistrationOptions(username: string): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const resp = await fetch(`/api/${username}/registration/options`);
    const data = await resp.json();
    if (!resp.ok) {
      throw Error(data.message);
    }
    return data;
  }
</script>

<main>
  <form on:submit={onSubmit}>
    <label for="username">username</label>
    <input type="text" name="username" autocomplete="username webauthn" bind:value={username} />
    <button>Register</button>
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
