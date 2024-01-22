import { object, string } from "yup";
import { getFromLocalStorage, saveToLocalStorage } from ".";

export type Keys = {
  encryptionPrivateKey: string;
  signaturePrivateKey: string;
};

export const keysSchema = object({
  encryptionPrivateKey: string().required(),
  signaturePrivateKey: string().required(),
});

export const saveKeys = (keys: Keys): void => {
  const { encryptionPrivateKey, signaturePrivateKey } = keys;
  const currentKeys = getFromLocalStorage("keys");
  if (currentKeys) {
    const parsedKeys = JSON.parse(currentKeys);
    parsedKeys.encryptionPrivateKey = encryptionPrivateKey;
    parsedKeys.signaturePrivateKey = signaturePrivateKey;
    saveToLocalStorage("keys", JSON.stringify(parsedKeys));
    return;
  } else {
    saveToLocalStorage("keys", JSON.stringify(keys));
  }
};

export const getKeys = (): Keys | undefined => {
  const keys = getFromLocalStorage("keys");
  if (keys) {
    return JSON.parse(keys);
  }

  return undefined;
};
