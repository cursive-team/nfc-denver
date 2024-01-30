import { babyjubjub } from "babyjubjub-ecdsa";

export const generateSignatureKeyPair = (): {
  signingKey: string;
  verifyingKey: string;
} => {
  const keyPair = babyjubjub.ec.genKeyPair();

  const pubKey = keyPair.getPublic();
  const privKey = keyPair.getPrivate();

  return {
    verifyingKey: pubKey.encode("hex"),
    signingKey: privKey.toString("hex"),
  };
};

export const sign = (signingKey: string, data: string): string => {
  const key = babyjubjub.ec.keyFromPrivate(signingKey, "hex");
  const msgHash = BigInt(
    "0x" + babyjubjub.ec.hash().update(data).digest("hex")
  );
  const signature = key.sign(msgHash.toString(16), "hex", {
    canonical: true,
  });
  const signatureDER = signature.toDER();

  return Buffer.from(signatureDER).toString("base64");
};

export const verify = (
  verifyingKey: string,
  data: string,
  signature: string
): boolean => {
  const key = babyjubjub.ec.keyFromPublic(verifyingKey, "hex");
  const msgHash = BigInt(
    "0x" + babyjubjub.ec.hash().update(data).digest("hex")
  );
  const signatureDER = Buffer.from(signature, "base64");
  return key.verify(msgHash.toString(16), signatureDER);
};
