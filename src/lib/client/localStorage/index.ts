export * from "./auth";
export * from "./backup";
export * from "./messages";
export * from "./profile";
export * from "./keys";
export * from "./users";
export * from "./locationSignatures";
export * from "./activities";

export const saveToLocalStorage = (key: string, value: string): void => {
  localStorage.setItem(key, value);
};

export const getFromLocalStorage = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const deleteFromLocalStorage = (key: string): void => {
  localStorage.removeItem(key);
};
