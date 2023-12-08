import { error } from "@sveltejs/kit";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { AuthenticatorDevice, AuthenticationResponseJSON } from "@simplewebauthn/typescript-types";
import type { RequestHandler } from "./$types";
import { rpID, origin as rpOrigin } from "$lib/relying-party";
import { getUser, updateUser } from "$lib/users";
import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";

export const POST: RequestHandler = async (event) => {
  const body: AuthenticationResponseJSON = await event.request.json();
  const user = await getUser(event.params.username);
  if (!user) {
    throw error(400, "user does not exist");
  }
  const bodyCredIDBuffer = isoBase64URL.toBuffer(body.rawId);
  const { currentChallenge } = user;

  if (!currentChallenge) {
    throw error(400, "user has no challenge to compare against");
  }

  const device = user.devices.find((device) => {
    return isoUint8Array.areEqual(device.credentialID, bodyCredIDBuffer);
  });
  if (!device) {
    throw error(400, "Authenticator is not registered with this site");
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: currentChallenge,
      expectedOrigin: rpOrigin, // this can be multiple origins, just pass in an array
      expectedRPID: rpID, // this can also be an array
      authenticator: device,
      requireUserVerification: true,
    });

    const { verified, authenticationInfo } = verification;

    if (verified && authenticationInfo) {
      device.counter = authenticationInfo.newCounter;
      user.currentChallenge = ""; // hack to get dynamodb working, should prob be undefined
      await updateUser(user);
    }

    return new Response(JSON.stringify({ verified }), {
      headers: {
        "content-type": "application/json",
      },
    });
  } catch (e) {
    console.log(e);
    throw error(500, e as Error);
  }
};
