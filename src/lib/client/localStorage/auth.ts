import {
  deleteFromLocalStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from ".";

export const AUTH_TOKEN_STORAGE_KEY = "authToken";

export const saveAuthToken = (value: string, expiresAt: Date): void => {
  const authToken = JSON.stringify({
    value,
    expiresAt,
  });
  saveToLocalStorage(AUTH_TOKEN_STORAGE_KEY, authToken);
};

export const getAuthToken = ():
  | {
      value: string;
      expiresAt: Date;
    }
  | undefined => {
  const authToken = getFromLocalStorage(AUTH_TOKEN_STORAGE_KEY);
  if (authToken) {
    const parsedToken = JSON.parse(authToken);
    parsedToken.expiresAt = new Date(parsedToken.expiresAt);
    return parsedToken;
  }

  return undefined;
};

export const deleteAuthToken = (): void => {
  deleteFromLocalStorage(AUTH_TOKEN_STORAGE_KEY);
};
