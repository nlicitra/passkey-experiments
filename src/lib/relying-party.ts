import { dev } from "$app/environment";

// Human-readable title for your website
export const rpName = "PBS Digi Innovation";
// A unique identifier for your website
export const rpID = dev ? "localhost" : "digi-innovation.pbs.org";
// The URL at which registrations and authentications should occur
export const origin = dev ? "http://localhost:5173" : "https://passkey-proto.digi-innovation.pbs.org";
