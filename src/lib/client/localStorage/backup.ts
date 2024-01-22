import { object } from "yup";
import { getProfile, profileSchema, saveProfile } from "./profile";
import { getKeys, keysSchema, saveKeys } from "./keys";

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
