import {
  generateKeyPair,
  sign as cryptoSign,
  verify as cryptoVerify,
} from "crypto";
import { promisify } from "util";

const generateKeyPairAsync = promisify(generateKeyPair);

export const generateSignatureKeyPair = async (): Promise<{
  signingKey: string;
  verifyingKey: string;
}> => {
  const { privateKey, publicKey } = await generateKeyPairAsync("ec", {
    namedCurve: "P-256",
    publicKeyEncoding: {
      type: "spki",
      format: "der",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  return {
    signingKey: privateKey,
    verifyingKey: Buffer.from(publicKey).toString("base64"),
  };
};

export const sign = async (
  signingKey: string,
  data: string
): Promise<string> => {
  const sign = cryptoSign("sha256", Buffer.from(data), {
    key: signingKey,
  });

  return sign.toString("base64");
};

export const verify = async (
  verifyingKey: string,
  data: string,
  signature: string
): Promise<boolean> => {
  const isVerified = cryptoVerify(
    "sha256",
    Buffer.from(data),
    {
      key: verifyingKey,
    },
    Buffer.from(signature, "base64")
  );

  return isVerified;
};
