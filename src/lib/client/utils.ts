import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper function to hash any public key to a UUID.
 * Used to index information by public key in localStorage.
 */
export const hashPublicKeyToUUID = async (
  encryptionPublicKey: string
): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(encryptionPublicKey);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const uuid = `${hashHex.substring(0, 8)}-${hashHex.substring(
    8,
    12
  )}-${hashHex.substring(12, 16)}-${hashHex.substring(
    16,
    20
  )}-${hashHex.substring(20, 32)}`;

  return uuid;
};

export const generateSalt = (): string => {
  return window.crypto.getRandomValues(new Uint8Array(16)).toString();
};

export const hashPassword = async (
  password: string,
  salt: string
): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
