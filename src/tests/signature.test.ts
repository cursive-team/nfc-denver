import {
  generateSignatureKeyPair,
  sign,
  verify,
} from "../lib/shared/signature";

describe("testing key & signature generation", () => {
  test("should correctly generate different keypair", () => {
    const keyPair1 = generateSignatureKeyPair();
    const keyPair2 = generateSignatureKeyPair();

    expect(keyPair1.signingKey).not.toEqual(keyPair2.signingKey);
    expect(keyPair1.verifyingKey).not.toEqual(keyPair2.verifyingKey);
  });

  test("should correctly sign another pubKey and verify", () => {
    const { verifyingKey, signingKey } = generateSignatureKeyPair();
    const { verifyingKey: signedPubKey } = generateSignatureKeyPair();

    const signedData = signedPubKey;
    const signature = sign(signingKey, signedData);
    const verified = verify(verifyingKey, signedData, signature);
    expect(verified).toBe(true);
  });

  test("should correctly not verify with different keypair", () => {
    const { signingKey } = generateSignatureKeyPair();
    const { verifyingKey: signedPubKey } = generateSignatureKeyPair();

    const signedData = signedPubKey;
    const signature = sign(signingKey, signedData);
    const verified = verify(signedPubKey, signedData, signature);
    expect(verified).toBe(false);
  });
});
