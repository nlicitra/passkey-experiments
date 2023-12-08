import { writable } from "svelte/store";

interface AuthState {
  authenticated: boolean;
}
export const authStore = writable<AuthState>({ authenticated: false });
