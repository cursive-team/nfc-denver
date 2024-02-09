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

  const strippedPkN = pkN.substring(4);
  // Messages using Arx cards are prepended with a string before hashing,
  // the following constructs the preimage of the hash used for the signature
  const msgNonce = parseInt(rnd?.substring(0, 8), 16);
  const msgRand = rnd.substring(8);
  const signatureMessage = getCounterMessage(msgNonce, msgRand).toString(
    "utf-8"
  );

  return {
    signaturePublicKey: strippedPkN,
    signatureMessage,
    signature: rndsig,
  };
};
