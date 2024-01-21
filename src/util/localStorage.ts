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

export const saveKeys = (
  encryptionPrivateKey: string,
  signaturePrivateKey: string
): void => {
  const keys = getFromLocalStorage("keys");
  if (keys) {
    const parsedKeys = JSON.parse(keys);
    parsedKeys.encryptionPrivateKey = encryptionPrivateKey;
    parsedKeys.signaturePrivateKey = signaturePrivateKey;
    saveToLocalStorage("keys", JSON.stringify(parsedKeys));
    return;
  } else {
    saveToLocalStorage(
      "keys",
      JSON.stringify({
        encryptionPrivateKey,
        signaturePrivateKey,
      })
    );
  }
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
