<script lang="ts">
  import type {
    PublicKeyCredentialCreationOptionsJSON,
    RegistrationResponseJSON,
  } from "@simplewebauthn/typescript-types";
  import { startRegistration } from "@simplewebauthn/browser";

  let error: string | undefined;

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();
    console.log(event);
    const options = await getRegistrationOptions();
    console.log(options);

    try {
      const registration = await startRegistration(options);
      console.log(registration);

      const { verified } = await verifyRegistration(registration);
      console.log(verified);
    } catch (e) {
      console.log(e);
      error = String(e);
    }
  }

  async function verifyRegistration(
    registration: RegistrationResponseJSON
  ): Promise<{ verified: boolean }> {
    const resp = await fetch("/api/auth/registration/verify", {
      method: "POST",
      body: JSON.stringify(registration),
    });
    return resp.json();
  }

  async function getRegistrationOptions(): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const resp = await fetch("/api/auth/registration/options");
    return resp.json();
  }
</script>

<main>
  <form on:submit={onSubmit}>
    <label for="username">username</label>
    <input type="text" name="username" autocomplete="username webauthn" />
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
