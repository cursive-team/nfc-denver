import { object, string } from "yup";
import {
  deleteFromLocalStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from ".";

export const KEYS_STORAGE_KEY = "keys";

export type Keys = {
  encryptionPrivateKey: string;
  signaturePrivateKey: string;
  fhePrivateKeyShare: string;
  relinKeyPrivateRound1: string;
};

export const keysSchema = object({
  encryptionPrivateKey: string().required(),
  signaturePrivateKey: string().required(),
  fhePrivateKeyShare: string().required(),
  relinKeyPrivateRound1: string().required(),
});

export const saveKeys = (keys: Keys): void => {
  const {
    encryptionPrivateKey,
    signaturePrivateKey,
    fhePrivateKeyShare,
    relinKeyPrivateRound1,
  } = keys;
  const currentKeys = getFromLocalStorage(KEYS_STORAGE_KEY);
  if (currentKeys) {
    const parsedKeys = JSON.parse(currentKeys);
    parsedKeys.encryptionPrivateKey = encryptionPrivateKey;
    parsedKeys.signaturePrivateKey = signaturePrivateKey;
    parsedKeys.fhePrivateKeyShare = fhePrivateKeyShare;
    parsedKeys.relinKeyPrivateRound1 = relinKeyPrivateRound1;
    saveToLocalStorage(KEYS_STORAGE_KEY, JSON.stringify(parsedKeys));
    return;
  } else {
    saveToLocalStorage(KEYS_STORAGE_KEY, JSON.stringify(keys));
  }
};

export const getKeys = (): Keys | undefined => {
  const keys = getFromLocalStorage(KEYS_STORAGE_KEY);
  if (keys) {
    return JSON.parse(keys);
  }

  return undefined;
};

export const deleteAllKeys = (): void => {
  deleteFromLocalStorage(KEYS_STORAGE_KEY);
};
