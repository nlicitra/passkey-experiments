import { error } from '@sveltejs/kit';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import type { AuthenticatorDevice, RegistrationResponseJSON } from '@simplewebauthn/typescript-types';
import type { RequestHandler } from './$types';
import { rpID, origin as rpOrigin } from "$lib/relying-party";
import { getUser, updateUser } from "$lib/users";
import { isoUint8Array } from '@simplewebauthn/server/helpers';

// Registration options are requested by the browser so that they can be
// passed along to the user's authenticator (i.e. a browser or 1password).
//
// The options dictate what type of response that an authenticator device will
// return back to the server for verification and saving, if successfully verified.
export const POST: RequestHandler = async (event) => {
  const body: RegistrationResponseJSON = await event.request.json();
  const user = await getUser();
  const { currentChallenge } = user;

  if (!currentChallenge) {
    throw error(400, "user has no challenge to compare against");
  }

  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge: currentChallenge,
    expectedOrigin: rpOrigin, // this can be multiple origins, just pass in an array
    expectedRPID: rpID, // this can also be an array
  });

  const { verified, registrationInfo } = verification;
  console.log(verified);
  console.log(registrationInfo);

  if (verified && registrationInfo) {
    const {
      credentialPublicKey,
      credentialID,
      counter,
    } = registrationInfo;

    // Check to see if the user has already authenticated with their current device
    const existingDevice = user.devices.find((device) => {
      isoUint8Array.areEqual(device.credentialID, credentialID);
    });

    if (!existingDevice) {
      const newDevice: AuthenticatorDevice = {
        credentialPublicKey,
        credentialID,
        counter,
        transports: body.response.transports,
      }
      user.devices.push(newDevice);
      await updateUser(user.id, user);
    }
  }

  return new Response(JSON.stringify({ verified }), {
    headers: {
      "content-type": "application/json"
    }
  });
};
