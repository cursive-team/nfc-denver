import { object, string, boolean } from "yup";
import { getFromLocalStorage, saveToLocalStorage } from ".";

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
