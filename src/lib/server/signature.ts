import {
  generateKeyPair,
  sign as cryptoSign,
  verify as cryptoVerify,
  KeyPairKeyObjectResult,
  KeyObject,
} from "crypto";
import { promisify } from "util";

const generateKeyPairAsync = promisify(
  (
    options: any,
    callback: (err: Error | null, result?: KeyPairKeyObjectResult) => void
  ) => {
    generateKeyPair(
      "ec" as any,
      options,
      (err: Error | null, publicKey: KeyObject, privateKey: KeyObject) => {
        if (err) {
          callback(err);
        } else {
          callback(null, { publicKey, privateKey });
        }
      }
    );
  }
);

export const generateSignatureKeyPair = async (): Promise<{
  signingKey: string;
  verifyingKey: string;
}> => {
  const result = await generateKeyPairAsync({
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

  if (!result) {
    throw new Error("Key pair generation failed");
  }

  const { privateKey, publicKey } = result;

  return {
    signingKey: privateKey.toString(),
    verifyingKey: Buffer.from(publicKey.toString()).toString("base64"),
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
