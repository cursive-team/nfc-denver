import { getCounterMessage } from "babyjubjub-ecdsa";

export type RawLocationSignature = {
  signaturePublicKey: string;
  signatureMessage: string;
  signature: string;
};

export const getHaLoArgs = (
  params: URLSearchParams
): RawLocationSignature | undefined => {
  const pkN = params.get("pkN");
  const rnd = params.get("rnd");
  const rndsig = params.get("rndsig");

  if (!pkN || !rnd || !rndsig) {
    return undefined;
  }
  // Messages using Arx cards are prepended with a string before hashing,
  // the following constructs the preimage of the hash used for the signature
  const msgNonce = parseInt(rnd?.substring(0, 8), 16);
  const msgRand = rnd.substring(8);
  const signatureMessage = getCounterMessage(msgNonce, msgRand);

  return {
    signaturePublicKey: pkN.substring(4),
    signatureMessage,
    signature: rndsig,
  };
};

/**
 * Given a counter message, returns the nonce within the message
 * This mirrors the way Arx cards sign messages with an incrementing counter
 * The first 22 bytes represent Buffer.from("\x19Attest counter pk62:\n", "utf8")
 * The next 4 bytes represent the nonce
 * Counter message reference: https://github.com/jubmoji/babyjubjub-ecdsa/blob/main/packages/lib/src/libhalo.ts
 * Arx reference: https://github.com/arx-research/libhalo/blob/master/docs/halo-command-set.md#command-sign_random
 * @param message The message to extract the nonce from
 * @returns The nonce if it exists, otherwise undefined
 */
export const getNonceFromCounterMessage = (
  message: string
): number | undefined => {
  if (message.length < 52) {
    return undefined;
  }

  const nonceString = parseInt(message.substring(44, 52), 16);
  if (isNaN(nonceString)) {
    return undefined;
  }

  return nonceString;
};
