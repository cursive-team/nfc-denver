import { object, string, boolean } from "yup";

// TODO: Error handling for local storage

export const saveToLocalStorage = (key: string, value: string): void => {
  localStorage.setItem(key, value);
};

export const getFromLocalStorage = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const saveAuthToken = (value: string, expiresAt: Date): void => {
  const authToken = JSON.stringify({
    value,
    expiresAt,
  });
  saveToLocalStorage("authToken", authToken);
};

export const getAuthToken = ():
  | {
      value: string;
      expiresAt: Date;
    }
  | undefined => {
  const authToken = getFromLocalStorage("authToken");
  if (authToken) {
    const parsedToken = JSON.parse(authToken);
    parsedToken.expiresAt = new Date(parsedToken.expiresAt);
    return parsedToken;
  }

  return undefined;
};

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

export type Profile = {
  displayName: string;
  email: string;
  encryptionPublicKey: string;
  signaturePublicKey: string;
  wantsServerCustody: boolean;
  twitterUsername?: string;
  telegramUsername?: string;
};

export const profileSchema = object({
  displayName: string().required(),
  email: string().email().required(),
  encryptionPublicKey: string().required(),
  signaturePublicKey: string().required(),
  wantsServerCustody: boolean().required(),
  twitterUsername: string().optional(),
  telegramUsername: string().optional(),
});

export const saveProfile = (profile: Profile): void => {
  saveToLocalStorage("profile", JSON.stringify(profile));
};

export const getProfile = (): Profile | undefined => {
  const profile = getFromLocalStorage("profile");
  if (profile) {
    return JSON.parse(profile);
  }

  return undefined;
};

export const backupSchema = object({
  profile: profileSchema.required(),
  keys: keysSchema.required(),
});

export const loadBackup = (backup: string): void => {
  const { profile, keys } = JSON.parse(backup);
  saveProfile(profile);
  saveKeys(keys);
};

export const createBackup = (): string | undefined => {
  const profile = getProfile();
  const keys = getKeys();

  // We only want to return a backup if both the profile and keys are present
  if (profile && keys) {
    return JSON.stringify({
      profile,
      keys,
    });
  }

  return undefined;
};
