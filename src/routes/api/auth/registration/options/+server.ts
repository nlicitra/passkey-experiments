import { generateRegistrationOptions } from '@simplewebauthn/server';
import type { RequestHandler } from './$types';
import { rpID, rpName } from "$lib/relying-party";
import { getUser, updateUser } from "$lib/users";

// Registration options are requested by the browser so that they can be
// passed along to the user's authenticator (i.e. a browser or 1password).
//
// The options dictate what type of response that an authenticator device will
// return back to the server for verification and saving, if successfully verified.
export const GET: RequestHandler = async (event) => {
  const user = await getUser();
  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id,
    userName: user.username,
    timeout: 60000,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: 'none',
    // Prevent users from re-registering existing authenticators
    excludeCredentials: user.devices.map(device => ({
      id: device.credentialID,
      type: 'public-key',
      // Optional
      transports: device.transports,
    })),
    authenticatorSelection: {
      // Defaults
      residentKey: 'preferred',
      userVerification: 'preferred',
      // Optional
      authenticatorAttachment: 'platform',
    },
  });

  // Associate the newly generated challenge string with the user to prevent
  // replay attacks. This ensures that when we verify any registration response
  // from the user, we can validate it's for the most recent registration attempt.
  user.currentChallenge = options.challenge;
  await updateUser(user.id, user);

  return new Response(JSON.stringify(options), {
    headers: {
      "content-type": "application/json"
    }
  });
};
