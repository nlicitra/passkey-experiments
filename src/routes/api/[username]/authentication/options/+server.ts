import { error } from "@sveltejs/kit";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import type { RequestHandler } from "./$types";
import { rpID, rpName } from "$lib/relying-party";
import { getUser, updateUser } from "$lib/users";

// Registration options are requested by the browser so that they can be
// passed along to the user's authenticator (i.e. a browser or 1password).
//
// The options dictate what type of response that an authenticator device will
// return back to the server for verification and saving, if successfully verified.
export const GET: RequestHandler = async (event) => {
  const user = await getUser(event.params.username);
  if (!user) {
    throw error(400, "user does not exist");
  }
  const options = await generateAuthenticationOptions({
    rpID,
    timeout: 60000,
    // Require users to use a previously registered device
    allowCredentials: user.devices.map((device) => ({
      id: device.credentialID,
      type: "public-key",
      transports: device.transports,
    })),
    userVerification: "preferred",
  });

  // Associate the newly generated challenge string with the user to prevent
  // replay attacks. This ensures that when we verify any registration response
  // from the user, we can validate it's for the most recent registration attempt.
  user.currentChallenge = options.challenge;
  await updateUser(user);

  return new Response(JSON.stringify(options), {
    headers: {
      "content-type": "application/json",
    },
  });
};
