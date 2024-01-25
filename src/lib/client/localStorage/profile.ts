import { object, string, boolean } from "yup";
import {
  deleteFromLocalStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from ".";

export const PROFILE_STORAGE_KEY = "profile";

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
  saveToLocalStorage(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};

export const getProfile = (): Profile | undefined => {
  const profile = getFromLocalStorage(PROFILE_STORAGE_KEY);
  if (profile) {
    return JSON.parse(profile);
  }

  return undefined;
};

export const deleteProfile = (): void => {
  deleteFromLocalStorage(PROFILE_STORAGE_KEY);
};
