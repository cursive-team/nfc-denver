import { getFromLocalStorage, saveToLocalStorage } from ".";

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
