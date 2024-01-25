export const generateSignatureKeyPair = async (): Promise<{
  signingKey: string;
  verifyingKey: string;
}> => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );
  const publicKey = await window.crypto.subtle.exportKey(
    "raw",
    keyPair.publicKey
  );
  const privateKey = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  return {
    verifyingKey: Buffer.from(publicKey).toString("base64"),
    signingKey: Buffer.from(privateKey).toString("base64"),
  };
};

export const sign = async (
  signingKey: string,
  data: string
): Promise<string> => {
  const importedPrivateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    Buffer.from(signingKey, "base64"),
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign"]
  );
  const encodedData = new TextEncoder().encode(data);
  const signature = await window.crypto.subtle.sign(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    importedPrivateKey,
    encodedData
  );

  return Buffer.from(signature).toString("base64");
};

export const verify = async (
  verifyingKey: string,
  data: string,
  signature: string
): Promise<boolean> => {
  const importedPublicKey = await window.crypto.subtle.importKey(
    "raw",
    Buffer.from(verifyingKey, "base64"),
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["verify"]
  );
  const encodedData = new TextEncoder().encode(data);
  const signatureBuffer = Buffer.from(signature, "base64");
  const isValid = await window.crypto.subtle.verify(
    {
      name: "ECDSA",
      hash: { name: "SHA-256" },
    },
    importedPublicKey,
    signatureBuffer,
    encodedData
  );

  return isValid;
};
